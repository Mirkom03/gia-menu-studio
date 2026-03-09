'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MenuWithImages } from '@/lib/actions/menu-actions'
import { formatRangeSpanish, formatDateSpanish } from '@/lib/date-utils'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  generated: 'Generado',
  final: 'Final',
}

const DAY_ABBREVIATIONS: Record<string, string> = {
  monday: 'L',
  tuesday: 'M',
  wednesday: 'X',
  thursday: 'J',
  friday: 'V',
  saturday: 'S',
  sunday: 'D',
}

interface MenuCardProps {
  menu: MenuWithImages
  thumbnailUrl?: string
}

export function MenuCard({ menu, thumbnailUrl }: MenuCardProps) {
  const isWeekly = menu.type === 'weekly'
  const itemCount =
    menu.menu_items?.[0]?.count ?? 0

  const dateLabel = isWeekly
    ? formatRangeSpanish(menu.week_start, menu.week_end ?? menu.week_start)
    : formatDateSpanish(menu.week_start)

  // Get unique languages from menu_images
  const languages = [
    ...new Set(menu.menu_images?.map((img) => img.language) ?? []),
  ]

  return (
    <Link href={`/menu/${menu.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        {thumbnailUrl ? (
          <div className="overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={isWeekly ? `Menu semanal ${dateLabel}` : (menu.title ?? 'Evento')}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
            <span className="font-display text-lg text-muted-foreground/60">Sin imagen</span>
          </div>
        )}
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
        <CardContent className="space-y-2">
          {!isWeekly && menu.title && (
            <p className="font-semibold">{menu.title}</p>
          )}

          {/* Active days pills (weekly menus only) */}
          {isWeekly && menu.active_days && menu.active_days.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {menu.active_days.map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground"
                >
                  {DAY_ABBREVIATIONS[day] ?? day}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            {menu.price != null && (
              <span className="font-medium">{menu.price} EUR</span>
            )}
            <span className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'plato' : 'platos'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {STATUS_LABELS[menu.status] ?? menu.status}
            </Badge>

            {/* Language flags */}
            {languages.length > 0 && (
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary"
                  >
                    {lang.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
