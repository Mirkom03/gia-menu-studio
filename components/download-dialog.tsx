'use client'

import * as React from 'react'
import { Download, FileImage, FileText, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DPI_OPTIONS, PAPER_SIZES } from '@/lib/constants'

interface DownloadDialogProps {
  imagePath: string
  menuTitle?: string
}

type Format = 'png' | 'pdf'

export function DownloadDialog({ imagePath, menuTitle }: DownloadDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [format, setFormat] = React.useState<Format>('png')
  const [dpi, setDpi] = React.useState(150)
  const [paperSize, setPaperSize] = React.useState('a4')
  const [customWidth, setCustomWidth] = React.useState(210)
  const [customHeight, setCustomHeight] = React.useState(297)
  const [loading, setLoading] = React.useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_path: imagePath,
          format,
          ...(format === 'png' ? { dpi } : {}),
          ...(format === 'pdf'
            ? {
                paper_size: paperSize,
                ...(paperSize === 'custom'
                  ? { custom_width: customWidth, custom_height: customHeight }
                  : {}),
              }
            : {}),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al descargar')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const baseName = menuTitle ? menuTitle.replace(/\s+/g, '-').toLowerCase() : 'menu'
      a.download =
        format === 'png' ? `${baseName}-${dpi}dpi.png` : `${baseName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setOpen(false)
    } catch (error) {
      console.error('Error en descarga:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" />}
      >
        <Download data-icon="inline-start" />
        Descargar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Descargar imagen</DialogTitle>
          <DialogDescription>
            Selecciona el formato y las opciones de descarga.
          </DialogDescription>
        </DialogHeader>

        {/* Format selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormat('png')}
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
              format === 'png'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            <FileImage className="size-4" />
            PNG
          </button>
          <button
            type="button"
            onClick={() => setFormat('pdf')}
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
              format === 'pdf'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            <FileText className="size-4" />
            PDF
          </button>
        </div>

        {/* PNG options */}
        {format === 'png' && (
          <div className="space-y-2">
            <Label>Resolucion (DPI)</Label>
            <div className="space-y-1">
              {DPI_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                    dpi === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="dpi"
                    value={opt.value}
                    checked={dpi === opt.value}
                    onChange={() => setDpi(opt.value)}
                    className="sr-only"
                  />
                  <div>
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {opt.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* PDF options */}
        {format === 'pdf' && (
          <div className="space-y-2">
            <Label>Tamano de papel</Label>
            <div className="space-y-1">
              {PAPER_SIZES.map((size) => (
                <label
                  key={size.id}
                  className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                    paperSize === size.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="paper_size"
                    value={size.id}
                    checked={paperSize === size.id}
                    onChange={() => setPaperSize(size.id)}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium">{size.label}</div>
                  {size.widthMm && size.heightMm && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {size.widthMm} x {size.heightMm} mm
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* Custom dimensions */}
            {paperSize === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label htmlFor="custom-width">Ancho (mm)</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    min={50}
                    max={1000}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-height">Alto (mm)</Label>
                  <Input
                    id="custom-height"
                    type="number"
                    min={50}
                    max={1000}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Preparando...
              </>
            ) : (
              <>
                <Download data-icon="inline-start" />
                Descargar {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
