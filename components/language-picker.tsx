'use client'

import { Button } from '@/components/ui/button'
import { LANGUAGE_OPTIONS } from '@/lib/constants'
import type { Language } from '@/lib/types'

interface LanguagePickerProps {
  selected: Language
  onSelect: (lang: Language) => void
}

export function LanguagePicker({ selected, onSelect }: LanguagePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {LANGUAGE_OPTIONS.map((lang) => (
        <Button
          key={lang.id}
          type="button"
          variant={selected === lang.id ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onSelect(lang.id)}
        >
          <span className="font-bold">{lang.flag}</span>
          <span className="ml-1.5">{lang.label}</span>
        </Button>
      ))}
    </div>
  )
}
