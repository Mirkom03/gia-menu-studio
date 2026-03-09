'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { es } from 'react-day-picker/locale'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getMonday, getWeekEnd, formatWeekRangeSpanish, formatEventDateSpanish } from '@/lib/date-utils'
import { DEFAULT_ACTIVE_DAYS } from '@/lib/menu-helpers'
import type { MenuFormData } from '@/lib/menu-helpers'
import type { MenuType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StepTypeWeekProps {
  data: MenuFormData
  onChange: (data: MenuFormData) => void
}

const DAY_LABELS = [
  { value: 'monday', short: 'L' },
  { value: 'tuesday', short: 'M' },
  { value: 'wednesday', short: 'X' },
  { value: 'thursday', short: 'J' },
  { value: 'friday', short: 'V' },
  { value: 'saturday', short: 'S' },
  { value: 'sunday', short: 'D' },
]

export function StepTypeWeek({ data, onChange }: StepTypeWeekProps) {
  const [weekPickerOpen, setWeekPickerOpen] = useState(false)
  const [eventDateOpen, setEventDateOpen] = useState(false)

  function handleTypeSelect(type: MenuType) {
    onChange({ ...data, type })
  }

  function handleWeekSelect(day: Date | undefined) {
    if (!day) return
    const monday = getMonday(day)
    const iso = monday.toISOString().split('T')[0]
    const weekEndDate = getWeekEnd(monday, data.activeDays)
    const weekEnd = weekEndDate.toISOString().split('T')[0]
    onChange({ ...data, weekStart: iso, weekEnd })
    setWeekPickerOpen(false)
  }

  function toggleDay(dayValue: string) {
    const current = data.activeDays
    let newDays: string[]
    if (current.includes(dayValue)) {
      newDays = current.filter((d) => d !== dayValue)
      if (newDays.length === 0) return // keep at least 1
    } else {
      newDays = [...current, dayValue]
    }
    const monday = new Date(data.weekStart + 'T00:00:00')
    const weekEndDate = getWeekEnd(monday, newDays)
    const weekEnd = weekEndDate.toISOString().split('T')[0]
    onChange({ ...data, activeDays: newDays, weekEnd })
  }

  function handleEventDateSelect(day: Date | undefined) {
    if (!day) return
    onChange({ ...data, weekStart: day.toISOString().split('T')[0] })
    setEventDateOpen(false)
  }

  // Week highlight dates for calendar
  const selectedMonday = data.weekStart ? new Date(data.weekStart + 'T00:00:00') : null
  const weekDates = selectedMonday
    ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(selectedMonday)
        d.setDate(d.getDate() + i)
        return d
      })
    : []

  const weekEndStr = selectedMonday
    ? getWeekEnd(selectedMonday, DEFAULT_ACTIVE_DAYS).toISOString().split('T')[0]
    : ''

  return (
    <div className="space-y-6">
      {/* Type toggle */}
      <div className="flex rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={() => handleTypeSelect('weekly')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            data.type === 'weekly'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          Menu del Dia
        </button>
        <button
          type="button"
          onClick={() => handleTypeSelect('event')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors border-l',
            data.type === 'event'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          Menu de Evento
        </button>
      </div>

      {/* Weekly: week picker + day chips */}
      {data.type === 'weekly' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Semana</label>
            <Popover open={weekPickerOpen} onOpenChange={setWeekPickerOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="w-full justify-start text-left font-normal" />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.weekStart
                  ? formatWeekRangeSpanish(data.weekStart, weekEndStr)
                  : 'Seleccionar semana'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={selectedMonday ?? undefined}
                  onSelect={handleWeekSelect}
                  modifiers={weekDates.length ? { selectedWeek: weekDates } : undefined}
                  modifiersClassNames={{
                    selectedWeek: 'bg-primary/15 text-foreground rounded-none',
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Dias</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    'h-9 w-9 rounded-full text-sm font-medium transition-colors',
                    data.activeDays.includes(day.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event: date + title */}
      {data.type === 'event' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Fecha del evento</label>
            <Popover open={eventDateOpen} onOpenChange={setEventDateOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="w-full justify-start text-left font-normal" />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.weekStart
                  ? formatEventDateSpanish(data.weekStart)
                  : 'Seleccionar fecha'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={
                    data.weekStart ? new Date(data.weekStart + 'T00:00:00') : undefined
                  }
                  onSelect={handleEventDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Titulo del evento</label>
            <Input
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="Ej: Cena de San Valentin"
            />
          </div>
        </div>
      )}
    </div>
  )
}
