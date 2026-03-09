'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GalleryFiltersProps {
  currentType?: string
  currentSearch?: string
  currentDateFrom?: string
  currentDateTo?: string
  currentLanguage?: string
}

const TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'event', label: 'Evento' },
] as const

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
] as const

export function GalleryFilters({
  currentType = '',
  currentSearch = '',
  currentDateFrom = '',
  currentDateTo = '',
  currentLanguage = '',
}: GalleryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(overrides)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }

      const qs = params.toString()
      router.push(qs ? `/history?${qs}` : '/history')
    },
    [router, searchParams]
  )

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      navigate({ search: value })
    }, 300)
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Type toggles + Language toggles */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        {/* Type toggles */}
        <div className="flex gap-1">
          {TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={currentType === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate({ type: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Language toggles */}
        <div className="flex gap-1">
          {LANGUAGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={currentLanguage === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate({ language: opt.value })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Row 2: Date range */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="dateFrom" className="text-sm text-muted-foreground whitespace-nowrap">
            Desde
          </label>
          <Input
            id="dateFrom"
            type="date"
            value={currentDateFrom}
            onChange={(e) => navigate({ dateFrom: e.target.value })}
            className="w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dateTo" className="text-sm text-muted-foreground whitespace-nowrap">
            Hasta
          </label>
          <Input
            id="dateTo"
            type="date"
            value={currentDateTo}
            onChange={(e) => navigate({ dateTo: e.target.value })}
            className="w-auto"
          />
        </div>
      </div>

      {/* Row 3: Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por plato o evento..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  )
}
