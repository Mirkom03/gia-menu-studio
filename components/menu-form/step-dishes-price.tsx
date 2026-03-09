'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DishList } from '@/components/menu-form/dish-list'
import { createInitialDish } from '@/lib/menu-helpers'
import type { MenuFormData, DishInput } from '@/lib/menu-helpers'

interface StepDishesPriceProps {
  data: MenuFormData
  onChange: (data: MenuFormData) => void
}

export function StepDishesPrice({ data, onChange }: StepDishesPriceProps) {
  function handlePriceChange(value: string) {
    onChange({ ...data, price: value })
  }

  function handleDishesChange(dishes: DishInput[]) {
    onChange({ ...data, dishes })
  }

  function seedDishes() {
    const starter = createInitialDish('starter')
    const main = createInitialDish('main')
    onChange({ ...data, dishes: [starter, main] })
  }

  const hasDishes = data.dishes.length > 0

  return (
    <div className="space-y-6">
      {/* Price input */}
      <div>
        <label className="text-sm font-medium mb-2 block">Precio (EUR)</label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            &euro;
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={data.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="16.00"
            className="pl-7"
          />
        </div>
      </div>

      {/* Dishes */}
      {hasDishes ? (
        <DishList dishes={data.dishes} onChange={handleDishesChange} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Agrega al menos un plato para continuar
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={seedDishes}
              type="button"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Agregar entrante y principal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
