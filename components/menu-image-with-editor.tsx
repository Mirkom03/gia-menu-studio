'use client'

import { useState, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageEditor } from '@/components/image-editor'

interface MenuImageWithEditorProps {
  menuId: string
  imagePath: string
  imageId: string
  signedUrl: string
  menuTitle?: string
}

export function MenuImageWithEditor({
  menuId,
  imagePath,
  imageId,
  signedUrl,
  menuTitle,
}: MenuImageWithEditorProps) {
  const [editing, setEditing] = useState(false)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [loadingBase64, setLoadingBase64] = useState(false)

  async function handleStartEditing() {
    if (imageBase64) {
      setEditing(true)
      return
    }

    setLoadingBase64(true)
    try {
      // Fetch the signed URL image and convert to base64
      const res = await fetch(signedUrl)
      const blob = await res.blob()
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      setImageBase64(base64)
      setEditing(true)
    } catch {
      // Fallback: show image without editing
    } finally {
      setLoadingBase64(false)
    }
  }

  const handleSave = useCallback(
    async (base64: string) => {
      const res = await fetch('/api/save-edited', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menuId,
          image_base64: base64,
          original_image_id: imageId,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
    },
    [menuId, imageId]
  )

  if (editing && imageBase64) {
    return (
      <div className="space-y-3">
        <ImageEditor
          initialImageBase64={imageBase64}
          menuId={menuId}
          imagePath={imagePath}
          menuTitle={menuTitle}
          onSave={handleSave}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(false)}
          className="w-full"
        >
          Cerrar editor
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl shadow-lg">
        <img
          src={signedUrl}
          alt={menuTitle ?? 'Menu'}
          className="w-full"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStartEditing}
        disabled={loadingBase64}
        className="w-full"
      >
        <Pencil className="size-3.5 mr-1.5" />
        {loadingBase64 ? 'Cargando...' : 'Modificar imagen'}
      </Button>
    </div>
  )
}
