'use client'

import { useState, useMemo } from 'react'
import { CalendarIcon } from 'lucide-react'
import { es } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getMonday, getWeekEnd, formatWeekRangeSpanish } from '@/lib/date-utils'
import { DEFAULT_ACTIVE_DAYS } from '@/lib/menu-helpers'

interface WeekPickerProps {
  value: string
  onChange: (isoDate: string) => void
}

export function WeekPicker({ value, onChange }: WeekPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedMonday = useMemo(() => {
    if (!value) return getMonday(new Date())
    return new Date(value + 'T00:00:00')
  }, [value])

  const weekEnd = useMemo(() => {
    return getWeekEnd(selectedMonday, DEFAULT_ACTIVE_DAYS)
  }, [selectedMonday])

  const weekEndStr = weekEnd.toISOString().split('T')[0]
  const displayLabel = value
    ? formatWeekRangeSpanish(value, weekEndStr)
    : 'Seleccionar semana'

  // Build array of dates in the selected week (Mon-Sun) for highlighting
  const weekDates = useMemo(() => {
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(selectedMonday)
      d.setDate(d.getDate() + i)
      dates.push(d)
    }
    return dates
  }, [selectedMonday])

  function handleSelect(day: Date | undefined) {
    if (!day) return
    const monday = getMonday(day)
    const iso = monday.toISOString().split('T')[0]
    onChange(iso)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-full justify-start text-left font-normal" />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {displayLabel}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          locale={es}
          mode="single"
          selected={selectedMonday}
          onSelect={handleSelect}
          modifiers={{ selectedWeek: weekDates }}
          modifiersClassNames={{
            selectedWeek: 'bg-primary/15 text-foreground rounded-none',
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
