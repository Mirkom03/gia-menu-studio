import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MenuDetailActions } from '@/components/menu-detail-actions'
import { MenuImageWithEditor } from '@/components/menu-image-with-editor'
import { getMenuById, getMenuImages } from '@/lib/actions/menu-actions'
import { getSignedUrl } from '@/lib/image-utils'
import { createClient } from '@/lib/supabase/server'
import { formatRangeSpanish, formatDateSpanish } from '@/lib/date-utils'
import { CATEGORIES } from '@/lib/menu-helpers'
import type { MenuItem } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  generated: 'Generado',
  final: 'Final',
}

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let menu, items: MenuItem[]
  try {
    const result = await getMenuById(id)
    menu = result.menu
    items = result.items
  } catch {
    notFound()
  }

  const images = await getMenuImages(id)
  const latestImage = images[0] ?? null

  // Generate signed URL for the latest image
  let signedImageUrl: string | null = null
  if (latestImage) {
    try {
      const supabase = await createClient()
      signedImageUrl = await getSignedUrl(supabase, 'menu-images', latestImage.image_url)
    } catch {
      // Failed to generate signed URL -- show fallback
    }
  }

  const isWeekly = menu.type === 'weekly'

  const dateLabel = isWeekly
    ? formatRangeSpanish(menu.week_start, menu.week_end ?? menu.week_start)
    : formatDateSpanish(menu.week_start)

  const menuTitle = !isWeekly && menu.title ? menu.title : dateLabel

  // Group items by category
  const grouped = new Map<string, MenuItem[]>()
  for (const item of items) {
    const list = grouped.get(item.category) ?? []
    list.push(item)
    grouped.set(item.category, list)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/history" />}>
        <ArrowLeft data-icon="inline-start" />
        Volver al historial
      </Button>

      {/* Full image display with editor */}
      {latestImage && signedImageUrl ? (
        <div className="space-y-4">
          <MenuImageWithEditor
            menuId={id}
            imagePath={latestImage.image_url}
            imageId={latestImage.id}
            signedUrl={signedImageUrl}
            menuTitle={menuTitle}
          />
          <MenuDetailActions
            menuId={id}
            imagePath={latestImage.image_url}
            menuTitle={menuTitle}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed p-10 grain-overlay">
          <p className="text-muted-foreground mb-5">No hay imágenes generadas</p>
          <Button render={<Link href={`/menu/${id}/generate`} />}>
            <Sparkles data-icon="inline-start" />
            Generar Imagen
          </Button>
        </div>
      )}

      {/* Menu details card */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant={isWeekly ? 'default' : 'secondary'}>
              {isWeekly ? 'Menú del Día' : 'Menú de Evento'}
            </Badge>
            <Badge variant="outline">
              {STATUS_LABELS[menu.status] ?? menu.status}
            </Badge>
          </div>
          <CardTitle className="font-display text-xl mt-3">
            {menuTitle}
          </CardTitle>
          {!isWeekly && menu.title && (
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          {menu.price != null && (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-muted-foreground">Precio</span>
              <span className="font-display text-lg font-medium">{menu.price} EUR</span>
            </div>
          )}

          <Separator />

          {/* Dishes grouped by category */}
          {CATEGORIES.map(({ value, label }) => {
            const categoryItems = grouped.get(value)
            if (!categoryItems || categoryItems.length === 0) return null
            return (
              <div key={value}>
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">{label}</h3>
                <ul className="space-y-2">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="text-sm leading-relaxed">
                      <span className="font-medium">{item.name_es}</span>
                      {(item.name_en || item.name_fr) && (
                        <span className="text-muted-foreground ml-1.5">
                          (
                          {[item.name_en, item.name_fr]
                            .filter(Boolean)
                            .join(' / ')}
                          )
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay platos en este menú.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
