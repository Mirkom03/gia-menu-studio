'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { es } from 'react-day-picker/locale'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { formatDateSpanish, formatRangeSpanish } from '@/lib/date-utils'
import type { MenuFormData } from '@/lib/menu-helpers'
import type { MenuType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StepTypeWeekProps {
  data: MenuFormData
  onChange: (data: MenuFormData) => void
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

function DatePickerInline({
  label,
  value,
  onSelect,
  disabled,
}: {
  label: string
  value: string | undefined
  onSelect: (day: Date) => void
  disabled?: (date: Date) => boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref}>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm text-left transition-colors hover:bg-muted',
          !value && 'text-muted-foreground'
        )}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {value ? formatDateSpanish(value) : 'Seleccionar fecha'}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-lg border bg-background p-1 shadow-sm">
          <Calendar
            locale={es}
            mode="single"
            required
            selected={value ? parseDate(value) : undefined}
            onSelect={(day) => {
              if (!day) return
              onSelect(day)
              setOpen(false)
            }}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}

export function StepTypeWeek({ data, onChange }: StepTypeWeekProps) {
  function handleTypeSelect(type: MenuType) {
    onChange({ ...data, type })
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
          <DatePickerInline
            label="Desde"
            value={data.weekStart}
            onSelect={(day) => {
              const iso = toISO(day)
              const newEnd = iso > data.weekEnd ? iso : data.weekEnd
              onChange({ ...data, weekStart: iso, weekEnd: newEnd })
            }}
          />

          <DatePickerInline
            label="Hasta"
            value={data.weekEnd}
            onSelect={(day) => {
              onChange({ ...data, weekEnd: toISO(day) })
            }}
            disabled={(date) => date < parseDate(data.weekStart)}
          />

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
          <DatePickerInline
            label="Fecha del evento"
            value={data.weekStart}
            onSelect={(day) => {
              const iso = toISO(day)
              onChange({ ...data, weekStart: iso, weekEnd: iso })
            }}
          />
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
