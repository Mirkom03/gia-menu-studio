'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StyleGallery } from '@/components/style-gallery'
import { AspectRatioPicker } from '@/components/aspect-ratio-picker'
import { GenerateButton } from '@/components/generate-button'
import { formatRangeSpanish, formatDateSpanish } from '@/lib/date-utils'
import type { Menu, MenuItem, MenuImage, Style } from '@/lib/types'

interface GenerateFlowProps {
  menu: Menu
  items: MenuItem[]
  styles: Style[]
}

export function GenerateFlow({ menu, items, styles }: GenerateFlowProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [customStylePrompt, setCustomStylePrompt] = useState('')
  const [selectedRatio, setSelectedRatio] = useState('instagram')
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<MenuImage | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const isWeekly = menu.type === 'weekly'
  const dateLabel = isWeekly
    ? formatRangeSpanish(menu.week_start, menu.week_end ?? menu.week_start)
    : formatDateSpanish(menu.week_start)

  const subtitle = !isWeekly && menu.title ? `${menu.title} — ${dateLabel}` : dateLabel

  function handleStyleSelect(styleId: string, customPrompt?: string) {
    setSelectedStyle(styleId)
    if (customPrompt !== undefined) {
      setCustomStylePrompt(customPrompt)
    }
  }

  async function handleGenerate() {
    if (!selectedStyle) return

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menu.id,
          style_id: selectedStyle,
          aspectRatio: selectedRatio,
          customStylePrompt: customStylePrompt || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al generar imagen')
        return
      }

      setGeneratedImage(data.image)
      setImageUrl(data.signedUrl)
    } catch {
      toast.error('Error de conexion al generar imagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/menu/${menu.id}`} />}
      >
        <ArrowLeft data-icon="inline-start" />
        Volver al menu
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Generar Imagen</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Style selection */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Estilo</h2>
        <StyleGallery
          styles={styles}
          selected={selectedStyle}
          onSelect={handleStyleSelect}
        />
      </section>

      <Separator />

      {/* Aspect ratio selection */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Formato</h2>
        <AspectRatioPicker
          selected={selectedRatio}
          onSelect={setSelectedRatio}
        />
      </section>

      <Separator />

      {/* Generate button */}
      <GenerateButton
        onClick={handleGenerate}
        loading={loading}
        disabled={!selectedStyle}
        regenerate={generatedImage !== null}
      />

      {/* Generated image display */}
      {imageUrl && generatedImage && (
        <section className="space-y-4">
          <Separator />
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Menu generado"
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <GenerateButton
              onClick={handleGenerate}
              loading={loading}
              regenerate
            />
            <Button
              variant="outline"
              size="lg"
              className="w-full lg:w-auto"
              render={<Link href={`/menu/${menu.id}`} />}
            >
              Volver al menu
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
