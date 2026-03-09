'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MenuWithItemCount } from '@/lib/actions/menu-actions'
import {
  formatWeekRangeSpanish,
  formatEventDateSpanish,
  formatActiveDaysLabel,
} from '@/lib/date-utils'

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
    ? formatWeekRangeSpanish(menu.week_start, menu.week_end ?? menu.week_start)
    : formatEventDateSpanish(menu.week_start)

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
          {isWeekly && menu.active_days && menu.active_days.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatActiveDaysLabel(menu.active_days)}
            </p>
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
