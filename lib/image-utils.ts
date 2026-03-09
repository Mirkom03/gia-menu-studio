import sharp from 'sharp'
import { SupabaseClient } from '@supabase/supabase-js'

export async function createThumbnail(
  imageBuffer: Buffer,
  width: number = 400
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(width, null, { fit: 'inside' })
    .png({ quality: 80, compressionLevel: 6 })
    .toBuffer()
}

export async function uploadImage(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  buffer: Buffer
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: 'image/png',
      upsert: false,
    })
  if (error) throw new Error(`Error al subir imagen: ${error.message}`)
  return path
}

export async function getSignedUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error || !data) throw new Error(`Error al generar URL: ${error?.message}`)
  return data.signedUrl
}
