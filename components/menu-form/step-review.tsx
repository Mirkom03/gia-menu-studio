'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  formatWeekRangeSpanish,
  formatEventDateSpanish,
  formatActiveDaysLabel,
} from '@/lib/date-utils'
import { getWeekEnd } from '@/lib/date-utils'
import { CHOOSEABLE_CATEGORIES, INCLUDED_CATEGORIES, CATEGORIES } from '@/lib/menu-helpers'
import type { MenuFormData } from '@/lib/menu-helpers'

interface StepReviewProps {
  data: MenuFormData
  onSubmit: () => void
  isSubmitting: boolean
}

export function StepReview({ data, onSubmit, isSubmitting }: StepReviewProps) {
  const weekEndDate = getWeekEnd(
    new Date(data.weekStart + 'T00:00:00'),
    data.activeDays
  )
  const weekEndStr = weekEndDate.toISOString().split('T')[0]

  const categoriesWithDishes = CATEGORIES.filter((cat) =>
    data.dishes.some((d) => d.category === cat.value)
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Resumen del Menu
            <Badge variant="secondary">
              {data.type === 'weekly' ? 'Menu del Dia' : 'Menu de Evento'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Date info */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Fecha</p>
            <p className="text-sm">
              {data.type === 'weekly'
                ? formatWeekRangeSpanish(data.weekStart, weekEndStr)
                : formatEventDateSpanish(data.weekStart)}
            </p>
          </div>

          {/* Active days (weekly only) */}
          {data.type === 'weekly' && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Dias activos
              </p>
              <p className="text-sm">
                {formatActiveDaysLabel(data.activeDays)}
              </p>
            </div>
          )}

          {/* Event title (event only) */}
          {data.type === 'event' && data.title && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Evento</p>
              <p className="text-sm">{data.title}</p>
            </div>
          )}

          {/* Price */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Precio</p>
            <p className="text-sm font-medium">{data.price} EUR</p>
          </div>

          <Separator />

          {/* Dishes by category */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Platos</p>
            {categoriesWithDishes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Sin platos
              </p>
            ) : (
              <div className="space-y-3">
                {categoriesWithDishes.map((cat) => {
                  const dishes = data.dishes.filter(
                    (d) => d.category === cat.value
                  )
                  return (
                    <div key={cat.value}>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        {cat.label}
                      </p>
                      <ul className="space-y-1">
                        {dishes.map((dish) => {
                          const extras = [dish.nameEn, dish.nameFr]
                            .filter(Boolean)
                            .join(', ')
                          return (
                            <li key={dish.id} className="text-sm">
                              {dish.nameEs}
                              {extras && (
                                <span className="text-muted-foreground">
                                  {' '}
                                  ({extras})
                                </span>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
        type="button"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar Menu'
        )}
      </Button>
    </div>
  )
}
