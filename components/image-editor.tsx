'use client'

import { useState, useRef } from 'react'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MAX_EDITS = 5

const QUICK_EDITS = [
  {
    label: 'Texto mas grande',
    instruction: 'Make all text significantly larger and more readable while maintaining the same layout',
  },
  {
    label: 'Fondo mas oscuro',
    instruction: 'Make the background color darker while keeping all text clearly readable',
  },
  {
    label: 'Fondo mas claro',
    instruction: 'Make the background lighter and brighter while keeping the same style',
  },
  {
    label: 'Mas espacio',
    instruction: 'Add more vertical spacing between all sections and between individual dishes',
  },
]

interface ImageVersion {
  base64: string
  label: string
}

interface ChatTurn {
  role: string
  parts: unknown[]
}

interface ImageEditorProps {
  initialImageBase64: string
  menuId: string
  imagePath: string
  menuTitle?: string
  /** Called after the user saves a version, with the base64 to persist */
  onSave?: (base64: string) => Promise<void>
}

export function ImageEditor({
  initialImageBase64,
  menuId,
  imagePath,
  menuTitle,
  onSave,
}: ImageEditorProps) {
  const [versions, setVersions] = useState<ImageVersion[]>([
    { base64: initialImageBase64, label: 'Original' },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([])
  const [editCount, setEditCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const currentImage = versions[currentIndex]
  const limitReached = editCount >= MAX_EDITS

  async function handleEdit(instruction: string) {
    if (limitReached || isEditing || !instruction.trim()) return
    setIsEditing(true)

    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: versions[currentIndex].base64,
          edit_instruction: instruction,
          chat_history: chatHistory,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al editar imagen')
        return
      }

      if (!data.image_base64) {
        toast.error('La IA no genero una imagen editada. Intenta con otra instruccion.')
        return
      }

      const newVersion: ImageVersion = {
        base64: data.image_base64,
        label: `Edicion ${editCount + 1}`,
      }

      setVersions((prev) => [...prev, newVersion])
      setCurrentIndex(versions.length) // point to newly added

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/png', data: versions[currentIndex].base64 } },
            { text: instruction },
          ],
        },
        data.chat_turn,
      ])

      setEditCount((prev) => prev + 1)
      setEditText('')
    } catch {
      toast.error('Error de conexion al editar imagen')
    } finally {
      setIsEditing(false)
    }
  }

  function handleQuickEdit(instruction: string) {
    handleEdit(instruction)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editText.trim()) return
    // Prepend Spanish interpretation hint for custom user input
    const instruction = `The following instruction is in Spanish. Apply it to the menu image: ${editText.trim()}`
    handleEdit(instruction)
  }

  async function handleSave() {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave(versions[currentIndex].base64)
      toast.success('Imagen guardada')
    } catch {
      toast.error('Error al guardar imagen')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Main image display */}
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <img
          src={`data:image/png;base64,${currentImage.base64}`}
          alt={menuTitle ?? 'Menu generado'}
          className="w-full"
        />
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-white text-sm">
              <Loader2 className="size-4 animate-spin" />
              Aplicando cambios...
            </div>
          </div>
        )}
      </div>

      {/* Version strip */}
      {versions.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Versiones
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {versions.map((v, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                  i === currentIndex
                    ? 'border-primary shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={`data:image/png;base64,${v.base64}`}
                  alt={v.label}
                  className="h-16 w-auto object-cover"
                />
                <p className="text-[9px] text-center py-0.5 bg-muted">{v.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit panel */}
      <div className="rounded-lg border p-4 space-y-3">
        <p className="text-sm font-medium">Modificar imagen</p>

        {/* Quick edit pills */}
        {!limitReached && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_EDITS.map((qe) => (
              <button
                key={qe.label}
                disabled={isEditing}
                onClick={() => handleQuickEdit(qe.instruction)}
                className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted disabled:opacity-50"
              >
                {qe.label}
              </button>
            ))}
          </div>
        )}

        {/* Text input */}
        {!limitReached ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Ej: Haz el precio mas grande"
              disabled={isEditing}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isEditing || !editText.trim()}
            >
              <Send className="size-4" />
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">
            Limite de ediciones alcanzado. Puedes Regenerar desde cero o Guardar esta version.
          </p>
        )}

        {/* Edit counter */}
        <p className="text-xs text-muted-foreground">
          Ediciones: {editCount}/{MAX_EDITS}
        </p>
      </div>

      {/* Save button */}
      {onSave && (
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar esta version'
          )}
        </Button>
      )}
    </div>
  )
}
