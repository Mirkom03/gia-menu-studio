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
import { LanguagePicker } from '@/components/language-picker'
import { formatRangeSpanish, formatDateSpanish } from '@/lib/date-utils'
import type { UserPreferences } from '@/lib/actions/preference-actions'
import type { Menu, MenuItem, MenuImage, Style, Language } from '@/lib/types'

interface GenerateFlowProps {
  menu: Menu
  items: MenuItem[]
  styles: Style[]
  defaultLanguage?: Language
  defaultPreferences?: UserPreferences
}

export function GenerateFlow({ menu, items, styles, defaultLanguage = 'es', defaultPreferences }: GenerateFlowProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [customStylePrompt, setCustomStylePrompt] = useState('')
  const [selectedRatio, setSelectedRatio] = useState(defaultPreferences?.defaultAspectRatio ?? 'instagram')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLanguage)
  const [loading, setLoading] = useState(false)
  const [loadingEn, setLoadingEn] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<MenuImage | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generatedImageEn, setGeneratedImageEn] = useState<MenuImage | null>(null)
  const [imageUrlEn, setImageUrlEn] = useState<string | null>(null)

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
      // Translate first if non-Spanish
      if (selectedLanguage !== 'es') {
        toast.info('Traduciendo platos...')
        const translateRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menuId: menu.id,
            targetLanguage: selectedLanguage,
          }),
        })

        const translateData = await translateRes.json()

        if (!translateRes.ok) {
          toast.error(translateData.error ?? 'Error al traducir platos')
          return
        }

        if (translateData.count > 0) {
          toast.success(`${translateData.count} platos traducidos`)
        }
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menu.id,
          style_id: selectedStyle,
          aspectRatio: selectedRatio,
          customStylePrompt: customStylePrompt || undefined,
          language: selectedLanguage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al generar imagen')
        return
      }

      setGeneratedImage(data.image)
      setImageUrl(data.signedUrl)
      // Reset EN image on new ES generation
      setGeneratedImageEn(null)
      setImageUrlEn(null)
    } catch {
      toast.error('Error de conexion al generar imagen')
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveAndGenerateEn() {
    if (!selectedStyle) return
    setLoadingEn(true)
    try {
      // Translate first
      toast.info('Traduciendo platos al inglés...')
      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId: menu.id, targetLanguage: 'en' }),
      })
      if (!translateRes.ok) {
        const err = await translateRes.json()
        toast.error(err.error ?? 'Error al traducir')
        return
      }

      toast.info('Generando imagen en inglés...')
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menu.id,
          style_id: selectedStyle,
          aspectRatio: selectedRatio,
          customStylePrompt: customStylePrompt || undefined,
          language: 'en',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al generar imagen en inglés')
        return
      }
      setGeneratedImageEn(data.image)
      setImageUrlEn(data.signedUrl)
      toast.success('Imagen en inglés generada')
    } catch {
      toast.error('Error de conexion')
    } finally {
      setLoadingEn(false)
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

      {/* Language selection */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Idioma</h2>
        <LanguagePicker
          selected={selectedLanguage}
          onSelect={setSelectedLanguage}
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
          <div className={generatedImageEn && imageUrlEn ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
            <div className="space-y-2">
              <p className="text-xs font-medium text-center text-muted-foreground">Español</p>
              <img
                src={imageUrl}
                alt="Menu en español"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            {generatedImageEn && imageUrlEn && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-center text-muted-foreground">English</p>
                <img
                  src={imageUrlEn}
                  alt="Menu in English"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {!generatedImageEn && (
              <Button
                size="lg"
                className="w-full lg:w-auto"
                onClick={handleApproveAndGenerateEn}
                disabled={loadingEn}
              >
                {loadingEn ? (
                  <><span className="animate-spin mr-2">⏳</span>Generando en inglés...</>
                ) : (
                  'Aprobar y generar en inglés'
                )}
              </Button>
            )}
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
