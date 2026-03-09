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
      className={`rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 ${
        !style.is_active ? 'opacity-50' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{style.name}</h3>
            {!style.is_active && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Desactivado
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {style.description}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onEdit(style)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-accent active:scale-[0.97]"
          >
            Editar
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.97] ${
              style.is_active
                ? 'border hover:bg-accent'
                : 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-accent/30 p-5">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Mi estilo personalizado"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descripción</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Breve descripción del estilo"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompt</label>
        <textarea
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          rows={3}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Instrucciones de estilo para la generación de imágenes..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? 'Guardando...' : initial ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent active:scale-[0.98]"
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
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            Añadir estilo
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
