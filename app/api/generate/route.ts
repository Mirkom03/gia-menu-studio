import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMenuImage, generateMenuImageWithReference } from '@/lib/gemini'
import { buildMenuPrompt } from '@/lib/prompts'
import { createThumbnail, uploadImage, getSignedUrl } from '@/lib/image-utils'
import { ASPECT_RATIOS } from '@/lib/constants'
import {
  formatRangeSpanish,
  formatDateSpanish,
  formatRangeEnglish,
  formatDateEnglish,
  formatRangeFrench,
  formatDateFrench,
} from '@/lib/date-utils'
import type { Language } from '@/lib/types'

export const maxDuration = 60

interface GenerateBody {
  menu_id: string
  style_id?: string
  aspectRatio: string
  customStylePrompt?: string
  customWidth?: number
  customHeight?: number
  language?: Language
  oneoff_reference_base64?: string
}

// Supported Gemini aspect ratios for finding closest match
const GEMINI_RATIOS = [
  { ratio: '1:1', value: 1 },
  { ratio: '2:3', value: 2 / 3 },
  { ratio: '3:2', value: 3 / 2 },
  { ratio: '3:4', value: 3 / 4 },
  { ratio: '4:3', value: 4 / 3 },
  { ratio: '4:5', value: 4 / 5 },
  { ratio: '5:4', value: 5 / 4 },
  { ratio: '9:16', value: 9 / 16 },
  { ratio: '16:9', value: 16 / 9 },
]

function findClosestGeminiRatio(width: number, height: number): string {
  const target = width / height
  let closest = GEMINI_RATIOS[0]
  let minDiff = Math.abs(target - closest.value)
  for (const r of GEMINI_RATIOS) {
    const diff = Math.abs(target - r.value)
    if (diff < minDiff) {
      minDiff = diff
      closest = r
    }
  }
  return closest.ratio
}

function formatDateRange(
  menu: { type: string; week_start: string; week_end: string | null },
  language: Language
): string {
  const { type, week_start, week_end } = menu

  if (language === 'en') {
    return type === 'weekly' && week_end
      ? formatRangeEnglish(week_start, week_end)
      : formatDateEnglish(week_start)
  }

  if (language === 'fr') {
    return type === 'weekly' && week_end
      ? formatRangeFrench(week_start, week_end)
      : formatDateFrench(week_start)
  }

  // Default: Spanish
  return type === 'weekly' && week_end
    ? formatRangeSpanish(week_start, week_end)
    : formatDateSpanish(week_start)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body: GenerateBody = await req.json()
    const {
      menu_id,
      style_id,
      aspectRatio,
      customStylePrompt,
      customWidth,
      customHeight,
      language = 'es',
      oneoff_reference_base64,
    } = body

    if (!menu_id || !aspectRatio) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: menu_id, aspectRatio' },
        { status: 400 }
      )
    }

    if (!style_id && !oneoff_reference_base64) {
      return NextResponse.json(
        { error: 'Se requiere un estilo o una imagen de referencia' },
        { status: 400 }
      )
    }

    // Fetch menu
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menu_id)
      .single()

    if (menuError || !menu) {
      return NextResponse.json({ error: 'Menu no encontrado' }, { status: 404 })
    }

    // Fetch menu items
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_id', menu_id)
      .order('sort_order')

    if (itemsError) {
      return NextResponse.json({ error: 'Error al cargar platos' }, { status: 500 })
    }

    // Fetch style (optional when reference image is provided)
    let style: { name: string; prompt_template: string; reference_image_url?: string } | null = null
    if (style_id) {
      const { data: styleData, error: styleError } = await supabase
        .from('styles')
        .select('*')
        .eq('id', style_id)
        .single()

      if (styleError || !styleData) {
        return NextResponse.json({ error: 'Estilo no encontrado' }, { status: 404 })
      }
      style = styleData
    }

    // Determine style prompt
    const stylePrompt = style
      ? (style.name === 'Personalizado'
          ? customStylePrompt ?? ''
          : style.prompt_template)
      : ''

    // Look up aspect ratio
    const arConfig = ASPECT_RATIOS.find((ar) => ar.id === aspectRatio)
    let ratioString: string
    let imageWidth: number | null
    let imageHeight: number | null

    if (aspectRatio === 'custom' && customWidth && customHeight) {
      ratioString = findClosestGeminiRatio(customWidth, customHeight)
      imageWidth = customWidth
      imageHeight = customHeight
    } else if (arConfig && arConfig.ratio) {
      ratioString = arConfig.ratio
      imageWidth = arConfig.width
      imageHeight = arConfig.height
    } else {
      ratioString = '3:4'
      imageWidth = null
      imageHeight = null
    }

    // Build date range string in the correct language
    const dateRange = formatDateRange(menu, language)

    // Select correct name field based on language
    const dishes = (items ?? []).map((i: { category: string; name_es: string; name_en: string | null; name_fr: string | null }) => ({
      category: i.category,
      name: (language === 'en' ? i.name_en : language === 'fr' ? i.name_fr : i.name_es) || i.name_es,
    }))

    // Build prompt
    const prompt = buildMenuPrompt({
      stylePrompt,
      dishes,
      price: menu.price?.toString() ?? '',
      dateRange,
      aspectRatio: ratioString,
      menuType: menu.type,
      eventTitle: menu.title ?? undefined,
      language,
    })

    // Determine reference image: oneoff upload > style's saved reference > none
    let referenceImage: string | null = null
    if (oneoff_reference_base64) {
      referenceImage = oneoff_reference_base64
    } else if (style?.reference_image_url) {
      try {
        const { data } = await supabase.storage
          .from('menu-images')
          .download(style.reference_image_url)
        if (data) {
          const arrayBuffer = await data.arrayBuffer()
          referenceImage = Buffer.from(arrayBuffer).toString('base64')
        }
      } catch {
        // Fall through to text-only generation
      }
    }

    // Generate image (with or without reference)
    const imageBuffer = referenceImage
      ? await generateMenuImageWithReference(prompt, referenceImage, ratioString)
      : await generateMenuImage(prompt, ratioString)

    // Upload full image
    const timestamp = Date.now()
    const imagePath = `menus/${menu_id}/${timestamp}.png`
    await uploadImage(supabase, 'menu-images', imagePath, imageBuffer)

    // Generate and upload thumbnail
    const thumbBuffer = await createThumbnail(imageBuffer, 400)
    const thumbPath = `menus/${menu_id}/${timestamp}_thumb.png`
    await uploadImage(supabase, 'menu-images', thumbPath, thumbBuffer)

    // Insert menu_images record
    const { data: image, error: insertError } = await supabase
      .from('menu_images')
      .insert({
        menu_id,
        language,
        image_url: imagePath,
        thumbnail_url: thumbPath,
        format: 'png',
        width: imageWidth,
        height: imageHeight,
        prompt_used: prompt,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error al guardar imagen:', insertError)
      return NextResponse.json(
        { error: 'Error al guardar registro de imagen' },
        { status: 500 }
      )
    }

    // Create signed URL for immediate display
    const signedUrl = await getSignedUrl(supabase, 'menu-images', imagePath)

    // Update menu status
    await supabase
      .from('menus')
      .update({ status: 'generated', ...(style_id ? { style_id } : {}) })
      .eq('id', menu_id)

    // Return base64 for the image editor
    const imageBase64 = imageBuffer.toString('base64')

    return NextResponse.json({ image, signedUrl, imageBase64 })
  } catch (error) {
    console.error('Error en generacion de imagen:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error inesperado al generar imagen',
      },
      { status: 500 }
    )
  }
}
