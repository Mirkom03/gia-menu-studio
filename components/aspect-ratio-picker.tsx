'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ASPECT_RATIOS } from '@/lib/constants'

interface AspectRatioPickerProps {
  selected: string
  onSelect: (id: string) => void
}

/**
 * Computes preview rectangle dimensions based on aspect ratio string.
 * Returns { width, height } where the largest dimension is maxSize.
 */
function getPreviewDimensions(ratio: string | null, maxSize = 48): { w: number; h: number } {
  if (!ratio) return { w: maxSize * 0.6, h: maxSize * 0.6 }
  const [rw, rh] = ratio.split(':').map(Number)
  if (rw > rh) {
    return { w: maxSize, h: Math.round((rh / rw) * maxSize) }
  }
  return { w: Math.round((rw / rh) * maxSize), h: maxSize }
}

export function AspectRatioPicker({ selected, onSelect }: AspectRatioPickerProps) {
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')

  const isCustomSelected = selected === 'custom'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {ASPECT_RATIOS.map((ar) => {
          const isSelected = ar.id === selected
          const { w, h } = getPreviewDimensions(ar.ratio)

          return (
            <button
              key={ar.id}
              type="button"
              onClick={() => onSelect(ar.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all hover:shadow-sm ${
                isSelected
                  ? 'ring-2 ring-primary bg-accent border-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Ratio preview rectangle */}
              <div className="flex items-center justify-center h-[52px]">
                {ar.ratio ? (
                  <div
                    className="rounded-sm border-2 border-muted-foreground/40 bg-muted"
                    style={{ width: `${w}px`, height: `${h}px` }}
                  />
                ) : (
                  <div
                    className="rounded-sm border-2 border-dashed border-muted-foreground/40 bg-muted flex items-center justify-center"
                    style={{ width: `${w}px`, height: `${h}px` }}
                  >
                    <span className="text-sm font-medium text-muted-foreground">?</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-xs font-medium leading-tight text-center">
                {ar.label}
              </span>

              {/* Dimensions */}
              {ar.width && ar.height ? (
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {ar.width}x{ar.height}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Libre
                </span>
              )}
            </button>
          )
        })}
      </div>

      {isCustomSelected && (
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="custom-width" className="text-xs">
              Ancho (px)
            </Label>
            <Input
              id="custom-width"
              type="number"
              min={100}
              max={4096}
              placeholder="1080"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              className="w-28"
            />
          </div>
          <span className="pb-2 text-muted-foreground">x</span>
          <div className="space-y-1.5">
            <Label htmlFor="custom-height" className="text-xs">
              Alto (px)
            </Label>
            <Input
              id="custom-height"
              type="number"
              min={100}
              max={4096}
              placeholder="1350"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
              className="w-28"
            />
          </div>
        </div>
      )}
    </div>
  )
}
