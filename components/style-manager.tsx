'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createStyle, updateStyle, toggleStyleActive } from '@/lib/actions/style-actions'
import type { Style } from '@/lib/types'

interface StyleManagerProps {
  initialStyles: Style[]
}

// Seed style names that cannot be deleted (only toggled)
const SEED_STYLE_NAMES = new Set([
  'Clasico Elegante',
  'Moderno Minimalista',
  'Rustico Artesanal',
  'Colorido Tropical',
  'Pizarra Tiza',
  'Mediterraneo',
])

function StyleCard({
  style,
  onEdit,
  onToggle,
}: {
  style: Style
  onEdit: (s: Style) => void
  onToggle: (id: string, active: boolean) => void
}) {
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    try {
      await onToggle(style.id, !style.is_active)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div
      className={`rounded-lg border p-4 transition-opacity ${
        !style.is_active ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{style.name}</h3>
            {!style.is_active && (
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Desactivado
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {style.description}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onEdit(style)}
            className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
          >
            Editar
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`rounded-md px-3 py-1 text-xs ${
              style.is_active
                ? 'border hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {toggling
              ? '...'
              : style.is_active
                ? 'Desactivar'
                : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StyleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Style
  onSave: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [promptTemplate, setPromptTemplate] = useState(initial?.prompt_template ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !promptTemplate.trim()) {
      toast.error('Nombre y prompt son obligatorios')
      return
    }
    setSaving(true)
    try {
      if (initial) {
        await updateStyle(initial.id, { name, description, promptTemplate })
        toast.success('Estilo actualizado')
      } else {
        await createStyle({ name, description, promptTemplate })
        toast.success('Estilo creado')
      }
      onSave()
    } catch {
      toast.error('Error al guardar estilo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Mi estilo personalizado"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Descripcion</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Breve descripcion del estilo"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Prompt</label>
        <textarea
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Instrucciones de estilo para la generacion de imagenes..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function StyleManager({ initialStyles }: StyleManagerProps) {
  const [styles, setStyles] = useState(initialStyles)
  const [editingStyle, setEditingStyle] = useState<Style | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  function handleSaved() {
    // Refresh by reloading page (revalidatePath triggers server refresh)
    setShowAddForm(false)
    setEditingStyle(null)
    window.location.reload()
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      await toggleStyleActive(id, active)
      setStyles((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: active } : s))
      )
      toast.success(active ? 'Estilo activado' : 'Estilo desactivado')
    } catch {
      toast.error('Error al cambiar estado del estilo')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {styles.filter((s) => s.is_active).length} activos de {styles.length} estilos
        </p>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Anadir estilo
          </button>
        )}
      </div>

      {showAddForm && (
        <StyleForm onSave={handleSaved} onCancel={() => setShowAddForm(false)} />
      )}

      {editingStyle && (
        <StyleForm
          initial={editingStyle}
          onSave={handleSaved}
          onCancel={() => setEditingStyle(null)}
        />
      )}

      <div className="space-y-3">
        {styles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            onEdit={setEditingStyle}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  )
}
