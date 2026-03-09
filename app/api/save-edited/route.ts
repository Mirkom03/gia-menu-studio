import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createThumbnail, uploadImage } from '@/lib/image-utils'

interface SaveEditedBody {
  menu_id: string
  image_base64: string
  original_image_id?: string
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

    const body: SaveEditedBody = await req.json()
    const { menu_id, image_base64, original_image_id } = body

    if (!menu_id || !image_base64) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const imageBuffer = Buffer.from(image_base64, 'base64')

    // Upload full image
    const timestamp = Date.now()
    const imagePath = `menus/${menu_id}/${timestamp}_edited.png`
    await uploadImage(supabase, 'menu-images', imagePath, imageBuffer)

    // Generate and upload thumbnail
    const thumbBuffer = await createThumbnail(imageBuffer, 400)
    const thumbPath = `menus/${menu_id}/${timestamp}_edited_thumb.png`
    await uploadImage(supabase, 'menu-images', thumbPath, thumbBuffer)

    // Get original image metadata if available
    let language = 'es' as const
    let width: number | null = null
    let height: number | null = null

    if (original_image_id) {
      const { data: original } = await supabase
        .from('menu_images')
        .select('language, width, height')
        .eq('id', original_image_id)
        .single()

      if (original) {
        language = original.language
        width = original.width
        height = original.height
      }
    }

    // Insert menu_images record
    const { data: image, error: insertError } = await supabase
      .from('menu_images')
      .insert({
        menu_id,
        language,
        image_url: imagePath,
        thumbnail_url: thumbPath,
        format: 'png',
        width,
        height,
        prompt_used: 'Edited version',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Error al guardar imagen editada' },
        { status: 500 }
      )
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error('Error al guardar imagen editada:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error inesperado al guardar',
      },
      { status: 500 }
    )
  }
}
