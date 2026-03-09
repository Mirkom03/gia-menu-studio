'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Style } from '@/lib/types'

interface StyleGalleryProps {
  styles: Style[]
  selected: string | null
  onSelect: (styleId: string, customPrompt?: string) => void
}

/**
 * Returns a CSS gradient string from a style's colors object.
 * Falls back to a neutral muted gradient if no colors are provided.
 */
function buildGradient(colors: Record<string, string>): string {
  const values = Object.values(colors)
  if (values.length === 0) {
    return 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)/0.2) 100%)'
  }
  if (values.length === 1) {
    return `linear-gradient(135deg, ${values[0]} 0%, ${values[0]}88 100%)`
  }
  const step = 100 / (values.length - 1)
  const stops = values.map((c, i) => `${c} ${Math.round(step * i)}%`).join(', ')
  return `linear-gradient(135deg, ${stops})`
}

export function StyleGallery({ styles, selected, onSelect }: StyleGalleryProps) {
  const [customPrompt, setCustomPrompt] = useState('')

  const selectedStyle = styles.find((s) => s.id === selected)
  const isCustom = selectedStyle?.name === 'Personalizado'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {styles.map((style) => {
          const isSelected = style.id === selected

          return (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelect(style.id)}
            >
              {/* Preview area */}
              {style.preview_url ? (
                <img
                  src={style.preview_url}
                  alt={style.name}
                  className="aspect-[3/4] w-full object-cover rounded-t-lg"
                />
              ) : (
                <div
                  className="aspect-[3/4] w-full rounded-t-lg flex items-center justify-center"
                  style={{ background: buildGradient(style.colors ?? {}) }}
                >
                  <span className="text-lg font-bold text-white/80 drop-shadow-sm text-center px-2">
                    {style.name}
                  </span>
                </div>
              )}

              <CardContent className="p-3 space-y-0.5">
                <p className="font-medium text-sm">{style.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {style.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {isCustom && (
        <div className="space-y-2">
          <label
            htmlFor="custom-style-prompt"
            className="text-sm font-medium"
          >
            Estilo personalizado
          </label>
          <textarea
            id="custom-style-prompt"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe el estilo que deseas..."
            value={customPrompt}
            onChange={(e) => {
              setCustomPrompt(e.target.value)
              onSelect(selected!, e.target.value)
            }}
          />
        </div>
      )}
    </div>
  )
}
