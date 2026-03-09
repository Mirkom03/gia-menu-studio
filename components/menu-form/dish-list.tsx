'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CATEGORIES, createInitialDish } from '@/lib/menu-helpers'
import type { DishInput } from '@/lib/menu-helpers'
import type { MenuCategory } from '@/lib/types'

interface DishListProps {
  dishes: DishInput[]
  onChange: (dishes: DishInput[]) => void
}

export function DishList({ dishes, onChange }: DishListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function addDish(category: MenuCategory) {
    const newDish = createInitialDish(category)
    onChange([...dishes, newDish])
  }

  function removeDish(id: string) {
    onChange(dishes.filter((d) => d.id !== id))
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function updateDish(id: string, field: keyof DishInput, value: string) {
    onChange(
      dishes.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      )
    )
  }

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat, catIdx) => {
        const categoryDishes = dishes.filter((d) => d.category === cat.value)

        return (
          <div key={cat.value}>
            {catIdx > 0 && <Separator className="mb-4" />}
            <h3 className="text-sm font-medium text-foreground mb-3">
              {cat.label}
            </h3>

            <div className="space-y-3">
              {categoryDishes.map((dish) => (
                <div key={dish.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={dish.nameEs}
                      onChange={(e) =>
                        updateDish(dish.id, 'nameEs', e.target.value)
                      }
                      placeholder="Nombre del plato en espanol"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleExpand(dish.id)}
                      className="shrink-0 text-xs text-muted-foreground"
                      type="button"
                    >
                      {expandedIds.has(dish.id) ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeDish(dish.id)}
                      className="shrink-0 text-destructive hover:text-destructive"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {expandedIds.has(dish.id) && (
                    <div className="ml-0 space-y-2 pl-0">
                      <Input
                        value={dish.nameEn}
                        onChange={(e) =>
                          updateDish(dish.id, 'nameEn', e.target.value)
                        }
                        placeholder="English name (optional)"
                      />
                      <Input
                        value={dish.nameFr}
                        onChange={(e) =>
                          updateDish(dish.id, 'nameFr', e.target.value)
                        }
                        placeholder="Nom en francais (optional)"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => addDish(cat.value)}
              className="mt-2 text-muted-foreground"
              type="button"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Agregar {cat.label.toLowerCase()}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
