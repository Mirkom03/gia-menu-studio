'use client'

import { Input } from '@/components/ui/input'
import { DishList } from '@/components/menu-form/dish-list'
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

  return (
    <div className="space-y-6">
      {/* Price */}
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
      <DishList dishes={data.dishes} onChange={handleDishesChange} />
    </div>
  )
}
