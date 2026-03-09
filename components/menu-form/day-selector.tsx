'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const DAYS = [
  { value: 'monday', label: 'Lun' },
  { value: 'tuesday', label: 'Mar' },
  { value: 'wednesday', label: 'Mie' },
  { value: 'thursday', label: 'Jue' },
  { value: 'friday', label: 'Vie' },
  { value: 'saturday', label: 'Sab' },
  { value: 'sunday', label: 'Dom' },
] as const

interface DaySelectorProps {
  value: string[]
  onChange: (days: string[]) => void
}

export function DaySelector({ value, onChange }: DaySelectorProps) {
  function handleValueChange(newValue: string[]) {
    // Prevent deselecting the last day
    if (newValue.length === 0) return
    onChange(newValue)
  }

  return (
    <ToggleGroup
      multiple
      value={value}
      onValueChange={handleValueChange}
      variant="outline"
      className="flex flex-wrap gap-1"
      spacing={1}
    >
      {DAYS.map((day) => (
        <ToggleGroupItem
          key={day.value}
          value={day.value}
          className="min-w-[40px] min-h-[40px] text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          {day.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
