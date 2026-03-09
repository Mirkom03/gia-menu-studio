'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MenuWithItemCount } from '@/lib/actions/menu-actions'
import { formatRangeSpanish, formatDateSpanish } from '@/lib/date-utils'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  generated: 'Generado',
  final: 'Final',
}

export function MenuCard({ menu }: { menu: MenuWithItemCount }) {
  const isWeekly = menu.type === 'weekly'
  const itemCount =
    menu.menu_items?.[0]?.count ?? 0

  const dateLabel = isWeekly
    ? formatRangeSpanish(menu.week_start, menu.week_end ?? menu.week_start)
    : formatDateSpanish(menu.week_start)

  return (
    <Link href={`/menu/${menu.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {dateLabel}
          </CardTitle>
          <CardAction>
            <Badge variant={isWeekly ? 'default' : 'secondary'}>
              {isWeekly ? 'Semanal' : 'Evento'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {!isWeekly && menu.title && (
            <p className="font-semibold">{menu.title}</p>
          )}
          <div className="flex items-center gap-3 text-sm">
            {menu.price != null && (
              <span>{menu.price} EUR</span>
            )}
            <span className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'plato' : 'platos'}
            </span>
          </div>
          <Badge variant="outline" className="mt-1">
            {STATUS_LABELS[menu.status] ?? menu.status}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
