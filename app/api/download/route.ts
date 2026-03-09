import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { createPdfFromImage } from '@/lib/pdf'

interface DownloadBody {
  image_path: string
  format: 'png' | 'pdf'
  dpi?: number
  paper_size?: string
  custom_width?: number
  custom_height?: number
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

    const body: DownloadBody = await req.json()
    const { image_path, format, dpi, paper_size, custom_width, custom_height } = body

    if (!image_path || !format) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: image_path, format' },
        { status: 400 }
      )
    }

    if (format !== 'png' && format !== 'pdf') {
      return NextResponse.json(
        { error: 'Formato no soportado. Usa png o pdf.' },
        { status: 400 }
      )
    }

    // Download image from Supabase storage
    const { data, error } = await supabase.storage
      .from('menu-images')
      .download(image_path)

    if (error || !data) {
      return NextResponse.json(
        { error: 'Error al descargar la imagen del almacenamiento' },
        { status: 500 }
      )
    }

    const imageBuffer = Buffer.from(await data.arrayBuffer())

    if (format === 'png') {
      const selectedDpi = dpi || 72
      const pngBuffer = await sharp(imageBuffer)
        .withMetadata({ density: selectedDpi })
        .png()
        .toBuffer()

      const pngArrayBuffer = new ArrayBuffer(pngBuffer.length)
      new Uint8Array(pngArrayBuffer).set(pngBuffer)

      return new Response(pngArrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="menu-${selectedDpi}dpi.png"`,
        },
      })
    }

    // PDF format
    const pdfBytes = await createPdfFromImage({
      imageBuffer,
      paperSize: paper_size || 'a4',
      customWidthMm: custom_width,
      customHeightMm: custom_height,
    })

    const pdfArrayBuffer = new ArrayBuffer(pdfBytes.length)
    new Uint8Array(pdfArrayBuffer).set(pdfBytes)

    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="menu.pdf"',
      },
    })
  } catch (error) {
    console.error('Error en descarga:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error inesperado al preparar la descarga',
      },
      { status: 500 }
    )
  }
}
