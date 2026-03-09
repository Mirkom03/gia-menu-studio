'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { es } from 'react-day-picker/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { WeekPicker } from '@/components/menu-form/week-picker'
import { DaySelector } from '@/components/menu-form/day-selector'
import { getWeekEnd, formatEventDateSpanish } from '@/lib/date-utils'
import type { MenuFormData } from '@/lib/menu-helpers'
import type { MenuType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StepTypeWeekProps {
  data: MenuFormData
  onChange: (data: MenuFormData) => void
}

export function StepTypeWeek({ data, onChange }: StepTypeWeekProps) {
  const [eventDateOpen, setEventDateOpen] = useState(false)

  function handleTypeSelect(type: MenuType) {
    onChange({ ...data, type })
  }

  function handleWeekChange(isoDate: string) {
    const monday = new Date(isoDate + 'T00:00:00')
    const weekEndDate = getWeekEnd(monday, data.activeDays)
    const weekEnd = weekEndDate.toISOString().split('T')[0]
    onChange({ ...data, weekStart: isoDate, weekEnd })
  }

  function handleDaysChange(days: string[]) {
    const monday = new Date(data.weekStart + 'T00:00:00')
    const weekEndDate = getWeekEnd(monday, days)
    const weekEnd = weekEndDate.toISOString().split('T')[0]
    onChange({ ...data, activeDays: days, weekEnd })
  }

  function handleEventDateSelect(day: Date | undefined) {
    if (!day) return
    const iso = day.toISOString().split('T')[0]
    onChange({ ...data, weekStart: iso })
    setEventDateOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Type selection */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className={cn(
            'cursor-pointer transition-colors',
            data.type === 'weekly'
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'hover:bg-muted/50'
          )}
          onClick={() => handleTypeSelect('weekly')}
        >
          <CardContent className="flex flex-col items-center justify-center py-4 text-center">
            <span className="text-2xl mb-1">📅</span>
            <span className="text-sm font-medium">Menu del Dia</span>
            <span className="text-xs text-muted-foreground mt-1">Semanal</span>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-colors',
            data.type === 'event'
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'hover:bg-muted/50'
          )}
          onClick={() => handleTypeSelect('event')}
        >
          <CardContent className="flex flex-col items-center justify-center py-4 text-center">
            <span className="text-2xl mb-1">🎉</span>
            <span className="text-sm font-medium">Menu de Evento</span>
            <span className="text-xs text-muted-foreground mt-1">Fecha unica</span>
          </CardContent>
        </Card>
      </div>

      {/* Weekly fields */}
      {data.type === 'weekly' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Semana</label>
            <WeekPicker value={data.weekStart} onChange={handleWeekChange} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Dias activos</label>
            <DaySelector value={data.activeDays} onChange={handleDaysChange} />
          </div>
        </div>
      )}

      {/* Event fields */}
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
                    data.weekStart
                      ? new Date(data.weekStart + 'T00:00:00')
                      : undefined
                  }
                  onSelect={handleEventDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Titulo del evento
            </label>
            <Input
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="Ej: Boda Garcia-Martinez"
            />
          </div>
        </div>
      )}
    </div>
  )
}
