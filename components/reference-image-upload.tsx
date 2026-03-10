'use client'

import { useState, useRef, useCallback } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const MAX_DIMENSION = 1500

/**
 * Resize an image file using canvas so the longest side is at most MAX_DIMENSION.
 * Returns a base64 string (no data URI prefix).
 */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Only resize if larger than limit
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_DIMENSION / width))
          width = MAX_DIMENSION
        } else {
          width = Math.round(width * (MAX_DIMENSION / height))
          height = MAX_DIMENSION
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // JPEG at 0.85 quality keeps size well under Vercel's 4.5MB limit
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      const base64 = dataUrl.split(',')[1]
      if (!base64) {
        reject(new Error('Failed to encode image'))
        return
      }
      resolve(base64)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

interface ReferenceImageUploadProps {
  value: string | null
  onChange: (base64: string | null) => void
}

export function ReferenceImageUpload({ value, onChange }: ReferenceImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo no es una imagen.')
        return
      }

      setProcessing(true)
      try {
        const base64 = await resizeImage(file)
        onChange(base64)
      } catch {
        toast.error('Error al procesar la imagen.')
      } finally {
        setProcessing(false)
      }
    },
    [onChange]
  )

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  if (value) {
    return (
      <div className="relative inline-block rounded-lg overflow-hidden border shadow-sm">
        <img
          src={`data:image/jpeg;base64,${value}`}
          alt="Referencia de estilo"
          className="h-32 w-auto object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 size-6 rounded-full"
          onClick={() => onChange(null)}
        >
          <X className="size-3.5" />
        </Button>
        <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
          Referencia de estilo
        </p>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 cursor-pointer transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
    >
      <ImagePlus className="size-6 text-muted-foreground" />
      <p className="text-sm font-medium text-center">
        {processing ? 'Procesando imagen...' : 'Usar imagen como referencia de estilo'}
      </p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Arrastra una imagen aqui o haz clic para subir. La IA usara el estilo visual (colores, layout, tipografia) para generar el menu.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
