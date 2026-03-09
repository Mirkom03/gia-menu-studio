import { PDFDocument, PageSizes } from 'pdf-lib'

const MM_TO_POINTS = 2.835

interface CreatePdfOptions {
  imageBuffer: Buffer
  paperSize: string
  customWidthMm?: number
  customHeightMm?: number
}

export async function createPdfFromImage({
  imageBuffer,
  paperSize,
  customWidthMm,
  customHeightMm,
}: CreatePdfOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  // Determine page dimensions in PDF points
  let pageWidth: number
  let pageHeight: number

  switch (paperSize) {
    case 'a4':
      ;[pageWidth, pageHeight] = PageSizes.A4
      break
    case 'a5':
      ;[pageWidth, pageHeight] = PageSizes.A5
      break
    case 'custom':
      if (!customWidthMm || !customHeightMm) {
        // Fallback to A4 if custom dimensions not provided
        ;[pageWidth, pageHeight] = PageSizes.A4
      } else {
        pageWidth = customWidthMm * MM_TO_POINTS
        pageHeight = customHeightMm * MM_TO_POINTS
      }
      break
    default:
      ;[pageWidth, pageHeight] = PageSizes.A4
  }

  const page = pdfDoc.addPage([pageWidth!, pageHeight!])

  // Embed the PNG image
  const pngImage = await pdfDoc.embedPng(imageBuffer)
  const imgWidth = pngImage.width
  const imgHeight = pngImage.height

  // Scale to fit page maintaining aspect ratio
  const scaleX = pageWidth! / imgWidth
  const scaleY = pageHeight! / imgHeight
  const scale = Math.min(scaleX, scaleY)

  const scaledWidth = imgWidth * scale
  const scaledHeight = imgHeight * scale

  // Center image on page
  const x = (pageWidth! - scaledWidth) / 2
  const y = (pageHeight! - scaledHeight) / 2

  page.drawImage(pngImage, {
    x,
    y,
    width: scaledWidth,
    height: scaledHeight,
  })

  return pdfDoc.save()
}
