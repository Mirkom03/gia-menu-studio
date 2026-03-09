import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, type Content } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

interface EditBody {
  image_base64: string
  edit_instruction: string
  chat_history?: Content[]
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

    const body: EditBody = await req.json()
    const { image_base64, edit_instruction, chat_history = [] } = body

    if (!image_base64 || !edit_instruction) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: image_base64, edit_instruction' },
        { status: 400 }
      )
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    // Build messages for multi-turn editing
    const contents: Content[] = [
      ...chat_history,
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: image_base64 } },
          { text: edit_instruction },
        ],
      },
    ]

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    })

    let newImageBase64: string | null = null
    let textResponse: string | null = null

    for (const part of response.candidates![0].content!.parts!) {
      if (part.inlineData) {
        newImageBase64 = part.inlineData.data!
      }
      if (part.text) {
        textResponse = part.text
      }
    }

    // Build the model's turn for chat history continuation
    const chatTurn = {
      role: 'model',
      parts: response.candidates![0].content!.parts!,
    }

    return NextResponse.json({
      image_base64: newImageBase64,
      text_response: textResponse,
      chat_turn: chatTurn,
    })
  } catch (error) {
    console.error('Error en edicion de imagen:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error inesperado al editar imagen',
      },
      { status: 500 }
    )
  }
}
