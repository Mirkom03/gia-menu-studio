'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Download,
  FileText,
  RefreshCw,
  Copy,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DownloadDialog } from '@/components/download-dialog'
import { deleteMenuWithImages } from '@/lib/actions/menu-actions'
import type { Language } from '@/lib/types'

const LANG_OPTIONS: { id: Language; label: string; flag: string }[] = [
  { id: 'es', label: 'Espanol', flag: 'ES' },
  { id: 'en', label: 'English', flag: 'EN' },
  { id: 'fr', label: 'Francais', flag: 'FR' },
]

interface MenuDetailActionsProps {
  menuId: string
  imagePath: string
  menuTitle?: string
  styleId?: string | null
  currentLanguage?: Language
  aspectRatio?: string
}

export function MenuDetailActions({
  menuId,
  imagePath,
  menuTitle,
  styleId,
  currentLanguage = 'es',
  aspectRatio = 'instagram',
}: MenuDetailActionsProps) {
  const router = useRouter()
  const [pngOpen, setPngOpen] = React.useState(false)
  const [pdfOpen, setPdfOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [translatingLang, setTranslatingLang] = React.useState<Language | null>(null)

  async function handleLanguageGenerate(lang: Language) {
    if (translatingLang) return
    setTranslatingLang(lang)

    try {
      // Translate dishes first if not Spanish
      if (lang !== 'es') {
        toast.info('Traduciendo platos...')
        const translateRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menuId, targetLanguage: lang }),
        })
        if (!translateRes.ok) {
          const err = await translateRes.json()
          toast.error(err.error ?? 'Error al traducir')
          return
        }
      }

      toast.info(`Generando menu en ${LANG_OPTIONS.find(l => l.id === lang)?.label}...`)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menuId,
          style_id: styleId || undefined,
          aspectRatio,
          language: lang,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al generar')
        return
      }

      toast.success('Menu generado')
      router.refresh()
    } catch {
      toast.error('Error de conexion')
    } finally {
      setTranslatingLang(null)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteMenuWithImages(menuId)
      router.push('/history')
    } catch (error) {
      console.error('Error al eliminar:', error)
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Language selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Idioma:</span>
        <div className="flex gap-1.5">
          {LANG_OPTIONS.map((lang) => (
            <button
              key={lang.id}
              disabled={translatingLang !== null}
              onClick={() => handleLanguageGenerate(lang.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                lang.id === currentLanguage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              } disabled:opacity-50`}
            >
              {translatingLang === lang.id ? (
                <Loader2 className="size-3 animate-spin inline mr-1" />
              ) : null}
              {lang.flag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Download PNG */}
        <Button variant="outline" size="sm" onClick={() => setPngOpen(true)}>
          <Download data-icon="inline-start" />
          Descargar PNG
        </Button>

        {/* Download PDF */}
        <Button variant="outline" size="sm" onClick={() => setPdfOpen(true)}>
          <FileText data-icon="inline-start" />
          Descargar PDF
        </Button>

        {/* Regenerate */}
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/menu/${menuId}/generate`} />}
        >
          <RefreshCw data-icon="inline-start" />
          Regenerar
        </Button>

        {/* Duplicate */}
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/create?duplicate=${menuId}`} />}
        >
          <Copy data-icon="inline-start" />
          Duplicar
        </Button>

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 data-icon="inline-start" />
          Eliminar
        </Button>
      </div>

      {/* Download PNG Dialog */}
      <DownloadDialog
        imagePath={imagePath}
        menuTitle={menuTitle}
        defaultFormat="png"
        open={pngOpen}
        onOpenChange={setPngOpen}
      />

      {/* Download PDF Dialog */}
      <DownloadDialog
        imagePath={imagePath}
        menuTitle={menuTitle}
        defaultFormat="pdf"
        open={pdfOpen}
        onOpenChange={setPdfOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar menu</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminaran el menu, sus platos
              y todas las imagenes generadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 data-icon="inline-start" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
