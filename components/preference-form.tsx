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
      <div className="rounded-lg border p-4">
        <label className="mb-2 block text-sm font-medium">Idioma por defecto</label>
        <LanguagePicker selected={language} onSelect={setLanguage} />
      </div>

      {/* Default aspect ratio */}
      <div className="rounded-lg border p-4">
        <label className="mb-2 block text-sm font-medium">Formato por defecto</label>
        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {ratioOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} ({r.ratio})
            </option>
          ))}
        </select>
      </div>

      {/* Default DPI */}
      <div className="rounded-lg border p-4">
        <label className="mb-2 block text-sm font-medium">DPI por defecto</label>
        <select
          value={dpi}
          onChange={(e) => setDpi(Number(e.target.value))}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}
