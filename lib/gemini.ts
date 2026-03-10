import { GoogleGenAI, ThinkingLevel } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function generateMenuImage(
  prompt: string,
  logoBase64: string,
  aspectRatio: string = '3:4'
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: logoBase64 } },
          { text: prompt },
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

export async function generateMenuImageWithReference(
  prompt: string,
  referenceBase64: string,
  logoBase64: string,
  aspectRatio: string = '3:4'
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: referenceBase64 } },
          { inlineData: { mimeType: 'image/png', data: logoBase64 } },
          {
            text: `Generate a restaurant menu image following the EXACT same visual style, layout, colors, typography, and decorative elements as the first reference image above. Do NOT copy the content — only replicate the style. The second image is the GIA restaurant logo — it MUST appear in the generated image as specified in the prompt instructions. Use this new content:\n\n${prompt}`,
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
