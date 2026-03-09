'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { LanguagePicker } from '@/components/language-picker'
import { updateUserPreferences } from '@/lib/actions/preference-actions'
import type { UserPreferences } from '@/lib/actions/preference-actions'
import { ASPECT_RATIOS, DPI_OPTIONS } from '@/lib/constants'
import type { Language } from '@/lib/types'

interface PreferenceFormProps {
  initialPreferences: UserPreferences
}

export function PreferenceForm({ initialPreferences }: PreferenceFormProps) {
  const [language, setLanguage] = useState<Language>(initialPreferences.defaultLanguage)
  const [aspectRatio, setAspectRatio] = useState(initialPreferences.defaultAspectRatio)
  const [dpi, setDpi] = useState(initialPreferences.defaultDpi)
  const [saving, setSaving] = useState(false)

  const ratioOptions = ASPECT_RATIOS.filter((r) => r.id !== 'custom')

  async function handleSave() {
    setSaving(true)
    try {
      await updateUserPreferences({
        defaultLanguage: language,
        defaultAspectRatio: aspectRatio,
        defaultDpi: dpi,
      })
      toast.success('Preferencias guardadas')
    } catch {
      toast.error('Error al guardar preferencias')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Default language */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Idioma por defecto</label>
        <LanguagePicker selected={language} onSelect={setLanguage} />
      </div>

      {/* Default aspect ratio */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formato por defecto</label>
        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ratioOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} ({r.ratio})
            </option>
          ))}
        </select>
      </div>

      {/* Default DPI */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">DPI por defecto</label>
        <select
          value={dpi}
          onChange={(e) => setDpi(Number(e.target.value))}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {DPI_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label} — {d.description}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}
