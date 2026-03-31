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
      <div className="rounded-xl border-2 border-primary/20 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Modificar imagen</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {editCount}/{MAX_EDITS} ediciones
          </span>
        </div>

        {/* Quick edit pills */}
        {!limitReached && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Ediciones rapidas</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_EDITS.map((qe) => (
                <button
                  key={qe.label}
                  disabled={isEditing}
                  onClick={() => handleQuickEdit(qe.instruction)}
                  className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50 disabled:pointer-events-none"
                >
                  {qe.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text input */}
        {!limitReached ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">O escribe tu propia instruccion</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Ej: Haz el precio mas grande"
                disabled={isEditing}
                className="flex-1 h-11"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isEditing || !editText.trim()}
                className="h-11 w-11 shrink-0"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-sm text-muted-foreground">
              Limite de ediciones alcanzado. Puedes <strong>Regenerar</strong> desde cero o <strong>Guardar</strong> esta version.
            </p>
          </div>
        )}
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
