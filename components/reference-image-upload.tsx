'use client'

import { useState, useRef, useCallback } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ReferenceImageUploadProps {
  value: string | null // base64 string or null
  onChange: (base64: string | null) => void
}

export function ReferenceImageUpload({ value, onChange }: ReferenceImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error('Formato no soportado. Usa JPG, PNG o WebP.')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Strip "data:image/...;base64," prefix to get raw base64
        const base64 = result.split(',')[1]
        onChange(base64)
      }
      reader.onerror = () => toast.error('Error al leer la imagen.')
      reader.readAsDataURL(file)
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
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  if (value) {
    return (
      <div className="relative inline-block rounded-lg overflow-hidden border shadow-sm">
        <img
          src={`data:image/png;base64,${value}`}
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
        Usar imagen como referencia de estilo
      </p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Arrastra una imagen aqui o haz clic para subir. La IA usara el estilo visual (colores, layout, tipografia) para generar el menu.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
