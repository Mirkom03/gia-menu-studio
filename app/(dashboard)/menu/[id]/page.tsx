import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getMenuById } from '@/lib/actions/menu-actions'
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

  const isWeekly = menu.type === 'weekly'

  const dateLabel = isWeekly
    ? formatRangeSpanish(menu.week_start, menu.week_end ?? menu.week_start)
    : formatDateSpanish(menu.week_start)

  // Group items by category
  const grouped = new Map<string, MenuItem[]>()
  for (const item of items) {
    const list = grouped.get(item.category) ?? []
    list.push(item)
    grouped.set(item.category, list)
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" render={<Link href="/history" />} className="mb-4">
        <ArrowLeft data-icon="inline-start" />
        Volver al historial
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant={isWeekly ? 'default' : 'secondary'}>
              {isWeekly ? 'Menu del Dia' : 'Menu de Evento'}
            </Badge>
            <Badge variant="outline">
              {STATUS_LABELS[menu.status] ?? menu.status}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-2">
            {!isWeekly && menu.title ? menu.title : dateLabel}
          </CardTitle>
          {!isWeekly && menu.title && (
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {menu.price != null && (
            <div>
              <span className="text-sm font-medium">Precio: </span>
              <span className="text-sm">{menu.price} EUR</span>
            </div>
          )}

          <Separator />

          {/* Dishes grouped by category */}
          {CATEGORIES.map(({ value, label }) => {
            const categoryItems = grouped.get(value)
            if (!categoryItems || categoryItems.length === 0) return null
            return (
              <div key={value}>
                <h3 className="text-sm font-semibold mb-2">{label}</h3>
                <ul className="space-y-1.5">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="text-sm">
                      <span>{item.name_es}</span>
                      {(item.name_en || item.name_fr) && (
                        <span className="text-muted-foreground ml-1">
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
              No hay platos en este menu.
            </p>
          )}

          <Separator />

          <Button
            variant="default"
            size="lg"
            className="w-full"
            render={<Link href={`/menu/${id}/generate`} />}
          >
            <Sparkles data-icon="inline-start" />
            Generar Imagen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
