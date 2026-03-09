'use client'

import { useState, useRef, useCallback } from 'react'
import { Plus, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CHOOSEABLE_CATEGORIES, INCLUDED_CATEGORIES, createInitialDish } from '@/lib/menu-helpers'
import type { DishInput } from '@/lib/menu-helpers'
import type { MenuCategory } from '@/lib/types'

interface DishListProps {
  dishes: DishInput[]
  onChange: (dishes: DishInput[]) => void
}

export function DishList({ dishes, onChange }: DishListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set())
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const autoTranslate = useCallback(async (dishId: string, nameEs: string) => {
    if (!nameEs.trim()) return
    setTranslatingIds(prev => new Set(prev).add(dishId))
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nameEs, targetLanguage: 'en' }),
      })
      const data = await res.json()
      if (res.ok && data.translation) {
        onChange(dishes.map(d => d.id === dishId ? { ...d, nameEn: data.translation } : d))
      }
    } catch { /* silent */ }
    finally {
      setTranslatingIds(prev => { const n = new Set(prev); n.delete(dishId); return n })
    }
  }, [dishes, onChange])

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addDish(category: MenuCategory) {
    onChange([...dishes, createInitialDish(category)])
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
    onChange(dishes.map((d) => (d.id === id ? { ...d, [field]: value } : d)))
    // Auto-translate to English on Spanish name change
    if (field === 'nameEs' && value.trim().length >= 3) {
      const existing = debounceTimers.current.get(id)
      if (existing) clearTimeout(existing)
      debounceTimers.current.set(id, setTimeout(() => {
        autoTranslate(id, value)
        debounceTimers.current.delete(id)
      }, 800))
    }
  }

  // Ensure at least one dish exists for included categories
  function ensureIncludedDish(category: MenuCategory) {
    const existing = dishes.find((d) => d.category === category)
    if (!existing) {
      onChange([...dishes, createInitialDish(category)])
    }
  }

  return (
    <div className="space-y-6">
      {/* Chooseable sections: Primeros & Segundos (a elegir) */}
      {CHOOSEABLE_CATEGORIES.map((cat, catIdx) => {
        const categoryDishes = dishes.filter((d) => d.category === cat.value)
        return (
          <div key={cat.value}>
            {catIdx > 0 && <Separator className="mb-4" />}
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="font-display text-sm font-medium">{cat.label}</h3>
              <span className="text-xs text-muted-foreground">({cat.helpText})</span>
            </div>

            <div className="space-y-2">
              {categoryDishes.map((dish) => (
                <div key={dish.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={dish.nameEs}
                      onChange={(e) => updateDish(dish.id, 'nameEs', e.target.value)}
                      placeholder={`Nombre del plato`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpand(dish.id)}
                      className="shrink-0 h-8 w-8 text-muted-foreground"
                      type="button"
                      title="Traducciones EN/FR"
                    >
                      {expandedIds.has(dish.id) ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDish(dish.id)}
                      className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {expandedIds.has(dish.id) && (
                    <div className="space-y-2 pl-0">
                      <div className="relative">
                        <Input
                          value={dish.nameEn}
                          onChange={(e) => updateDish(dish.id, 'nameEn', e.target.value)}
                          placeholder="English name (auto)"
                          className={translatingIds.has(dish.id) ? 'pr-8' : ''}
                        />
                        {translatingIds.has(dish.id) && (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <Input
                        value={dish.nameFr}
                        onChange={(e) => updateDish(dish.id, 'nameFr', e.target.value)}
                        placeholder="Nom en français (optional)"
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
              Agregar plato
            </Button>
          </div>
        )
      })}

      <Separator />

      {/* Included sections: Postre & Bebida */}
      <div>
        <h3 className="font-display text-sm font-medium mb-1">Incluido</h3>
        <p className="text-xs text-muted-foreground mb-3">Postre y bebida incluidos en el precio</p>
        <div className="space-y-3">
          {INCLUDED_CATEGORIES.map((cat) => {
            const categoryDishes = dishes.filter((d) => d.category === cat.value)
            // Auto-create one entry if empty
            if (categoryDishes.length === 0) {
              // We'll show a placeholder that creates on focus
              return (
                <div key={cat.value}>
                  <label className="text-xs text-muted-foreground mb-1 block">{cat.label}</label>
                  <Input
                    placeholder={`Ej: ${cat.value === 'dessert' ? 'Helado casero' : 'Agua, vino o refresco'}`}
                    onFocus={() => ensureIncludedDish(cat.value)}
                  />
                </div>
              )
            }
            return (
              <div key={cat.value}>
                <label className="text-xs text-muted-foreground mb-1 block">{cat.label}</label>
                {categoryDishes.map((dish) => (
                  <Input
                    key={dish.id}
                    value={dish.nameEs}
                    onChange={(e) => updateDish(dish.id, 'nameEs', e.target.value)}
                    placeholder={`Ej: ${cat.value === 'dessert' ? 'Helado casero' : 'Agua, vino o refresco'}`}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
