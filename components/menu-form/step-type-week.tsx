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
import { formatDateSpanish, formatRangeSpanish } from '@/lib/date-utils'
import type { MenuFormData } from '@/lib/menu-helpers'
import type { MenuType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StepTypeWeekProps {
  data: MenuFormData
  onChange: (data: MenuFormData) => void
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function parseDate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

export function StepTypeWeek({ data, onChange }: StepTypeWeekProps) {
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [eventDateOpen, setEventDateOpen] = useState(false)

  function handleTypeSelect(type: MenuType) {
    onChange({ ...data, type })
  }

  function handleStartSelect(day: Date | undefined) {
    if (!day) return
    const iso = toISO(day)
    // If new start is after current end, push end to same day
    const newEnd = iso > data.weekEnd ? iso : data.weekEnd
    onChange({ ...data, weekStart: iso, weekEnd: newEnd })
    setStartOpen(false)
  }

  function handleEndSelect(day: Date | undefined) {
    if (!day) return
    onChange({ ...data, weekEnd: toISO(day) })
    setEndOpen(false)
  }

  function handleEventDateSelect(day: Date | undefined) {
    if (!day) return
    onChange({ ...data, weekStart: toISO(day), weekEnd: toISO(day) })
    setEventDateOpen(false)
  }

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

      {/* Weekly: start date + end date */}
      {data.type === 'weekly' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Desde</label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="w-full justify-start text-left font-normal" />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.weekStart
                  ? formatDateSpanish(data.weekStart)
                  : 'Seleccionar fecha'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={data.weekStart ? parseDate(data.weekStart) : undefined}
                  onSelect={handleStartSelect}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Hasta</label>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="w-full justify-start text-left font-normal" />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.weekEnd
                  ? formatDateSpanish(data.weekEnd)
                  : 'Seleccionar fecha'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={data.weekEnd ? parseDate(data.weekEnd) : undefined}
                  onSelect={handleEndSelect}
                  disabled={(date) => date < parseDate(data.weekStart)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {data.weekStart && data.weekEnd && (
            <p className="text-sm text-muted-foreground">
              {formatRangeSpanish(data.weekStart, data.weekEnd)}
            </p>
          )}
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
                  ? formatDateSpanish(data.weekStart)
                  : 'Seleccionar fecha'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={
                    data.weekStart ? parseDate(data.weekStart) : undefined
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
