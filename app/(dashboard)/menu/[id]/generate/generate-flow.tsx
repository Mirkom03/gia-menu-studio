'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StyleGallery } from '@/components/style-gallery'
import { AspectRatioPicker } from '@/components/aspect-ratio-picker'
import { GenerateButton } from '@/components/generate-button'
import { LanguagePicker } from '@/components/language-picker'
import { ReferenceImageUpload } from '@/components/reference-image-upload'
import { ImageEditor } from '@/components/image-editor'
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
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingEn, setLoadingEn] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<MenuImage | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null)
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
          oneoff_reference_base64: referenceImage || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al generar imagen')
        return
      }

      setGeneratedImage(data.image)
      setImageUrl(data.signedUrl)
      setGeneratedImageBase64(data.imageBase64 ?? null)
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
          oneoff_reference_base64: referenceImage || undefined,
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

  const handleSaveEditedImage = useCallback(
    async (base64: string) => {
      const res = await fetch('/api/save-edited', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menu.id,
          image_base64: base64,
          original_image_id: generatedImage?.id,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
    },
    [menu.id, generatedImage?.id]
  )

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/menu/${menu.id}`} />}
      >
        <ArrowLeft data-icon="inline-start" />
        Volver al menú
      </Button>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Generar Imagen</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Reference image upload */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Referencia de estilo (opcional)
        </h2>
        <ReferenceImageUpload
          value={referenceImage}
          onChange={setReferenceImage}
        />
      </section>

      {referenceImage && (
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">o elige un estilo predefinido</span>
          <Separator className="flex-1" />
        </div>
      )}

      {/* Style selection */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estilo</h2>
        <StyleGallery
          styles={styles}
          selected={selectedStyle}
          onSelect={handleStyleSelect}
        />
      </section>

      <Separator />

      {/* Aspect ratio selection */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formato</h2>
        <AspectRatioPicker
          selected={selectedRatio}
          onSelect={setSelectedRatio}
        />
      </section>

      <Separator />

      {/* Language selection */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Idioma</h2>
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

      {/* Generated image display with editor */}
      {imageUrl && generatedImage && (
        <section className="space-y-5">
          <Separator />

          {generatedImageBase64 ? (
            <ImageEditor
              initialImageBase64={generatedImageBase64}
              menuId={menu.id}
              imagePath={generatedImage.image_url}
              menuTitle={subtitle}
              onSave={handleSaveEditedImage}
            />
          ) : (
            <div className={generatedImageEn && imageUrlEn ? 'grid grid-cols-1 sm:grid-cols-2 gap-5' : ''}>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">Español</p>
                <div className="overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={imageUrl}
                    alt="Menu en español"
                    className="w-full"
                  />
                </div>
              </div>
              {generatedImageEn && imageUrlEn && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">English</p>
                  <div className="overflow-hidden rounded-xl shadow-lg">
                    <img
                      src={imageUrlEn}
                      alt="Menu in English"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
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
              Volver al menú
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
