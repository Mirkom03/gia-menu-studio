import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const langNames: Record<string, string> = {
  en: 'English',
  fr: 'French',
}

interface TranslateBody {
  menuId: string
  targetLanguage: 'en' | 'fr'
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

    const body: TranslateBody = await req.json()
    const { menuId, targetLanguage } = body

    if (!menuId || !targetLanguage || !['en', 'fr'].includes(targetLanguage)) {
      return NextResponse.json(
        { error: 'Faltan campos: menuId, targetLanguage (en|fr)' },
        { status: 400 }
      )
    }

    // Fetch menu items
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_id', menuId)
      .order('sort_order')

    if (itemsError) {
      return NextResponse.json({ error: 'Error al cargar platos' }, { status: 500 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ translations: [], message: 'No hay platos' })
    }

    // Filter items needing translation
    const nameField = targetLanguage === 'en' ? 'name_en' : 'name_fr'
    const needsTranslation = items.filter(
      (item) => !item[nameField] || item[nameField].trim() === ''
    )

    if (needsTranslation.length === 0) {
      return NextResponse.json({ translations: [], message: 'All translations exist' })
    }

    // Build dish list for translation
    const dishList = needsTranslation.map((item, i) => `${i + 1}. ${item.name_es}`).join('\n')
    const langName = langNames[targetLanguage] ?? targetLanguage

    const prompt = `You are translating restaurant menu dish names from a Mediterranean-Italian restaurant in Spain. Translate each Spanish dish name to ${langName}. Use proper culinary terminology, not literal translations. Return ONLY a JSON array of strings, one per dish, in the same order.\n\nDish names:\n${dishList}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    })

    // Parse response, stripping potential markdown fences
    let responseText = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    let translations: string[]
    try {
      translations = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { error: 'Error al parsear traducciones de Gemini' },
        { status: 500 }
      )
    }

    // Persist translations
    for (let i = 0; i < needsTranslation.length; i++) {
      if (translations[i]) {
        await supabase
          .from('menu_items')
          .update({ [nameField]: translations[i] })
          .eq('id', needsTranslation[i].id)
      }
    }

    return NextResponse.json({ translations, count: translations.length })
  } catch (error) {
    console.error('Error en traduccion:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error inesperado al traducir',
      },
      { status: 500 }
    )
  }
}
