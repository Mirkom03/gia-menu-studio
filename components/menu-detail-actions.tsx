'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Download,
  FileText,
  RefreshCw,
  Copy,
  Languages,
  Trash2,
  Loader2,
} from 'lucide-react'
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

interface MenuDetailActionsProps {
  menuId: string
  imagePath: string
  menuTitle?: string
}

export function MenuDetailActions({
  menuId,
  imagePath,
  menuTitle,
}: MenuDetailActionsProps) {
  const router = useRouter()
  const [pngOpen, setPngOpen] = React.useState(false)
  const [pdfOpen, setPdfOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

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

        {/* Duplicate (disabled -- Phase 5) */}
        <Button variant="outline" size="sm" disabled title="Disponible pronto">
          <Copy data-icon="inline-start" />
          Duplicar
        </Button>

        {/* Generate in another language (disabled -- Phase 5) */}
        <Button variant="outline" size="sm" disabled title="Disponible pronto">
          <Languages data-icon="inline-start" />
          Generar en otro idioma
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
