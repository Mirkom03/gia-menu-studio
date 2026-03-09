import { GoogleGenAI, ThinkingLevel } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function generateMenuImage(
  prompt: string,
  aspectRatio: string = '3:4'
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio,
      },
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  })

  for (const part of response.candidates![0].content!.parts!) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data!, 'base64')
    }
  }

  throw new Error('No se generó imagen. Intenta de nuevo.')
}

export async function generateMenuImageWithReference(
  prompt: string,
  referenceBase64: string,
  aspectRatio: string = '3:4'
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: referenceBase64 } },
          {
            text: `Generate a restaurant menu image following the EXACT same visual style, layout, colors, typography, and decorative elements as the reference image above. Do NOT copy the content — only replicate the style. Use this new content:\n\n${prompt}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio,
      },
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  })

  for (const part of response.candidates![0].content!.parts!) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data!, 'base64')
    }
  }

  throw new Error('No se generó imagen. Intenta de nuevo.')
}
