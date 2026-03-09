import type { MenuType, MenuCategory } from '@/lib/types'
import { getMonday } from '@/lib/date-utils'

export interface DishInput {
  id: string
  category: MenuCategory
  nameEs: string
  nameEn: string
  nameFr: string
  sortOrder: number
}

export interface MenuFormData {
  type: MenuType
  weekStart: string
  weekEnd: string | null
  activeDays: string[]
  title: string
  price: string
  dishes: DishInput[]
}

// "Primeros" and "Segundos" are the chooseable sections (customer picks 1 from each)
// "Postre" and "Bebida" are included with the menu (not a choice)
export const CHOOSEABLE_CATEGORIES: { value: MenuCategory; label: string; helpText: string }[] = [
  { value: 'starter', label: 'Primeros', helpText: 'A elegir' },
  { value: 'main', label: 'Segundos', helpText: 'A elegir' },
]

export const INCLUDED_CATEGORIES: { value: MenuCategory; label: string }[] = [
  { value: 'dessert', label: 'Postre' },
  { value: 'drink', label: 'Bebida' },
]

// All categories for display purposes (review, detail pages)
export const CATEGORIES: { value: MenuCategory; label: string }[] = [
  { value: 'starter', label: 'Primeros' },
  { value: 'main', label: 'Segundos' },
  { value: 'dessert', label: 'Postre' },
  { value: 'drink', label: 'Bebida' },
  { value: 'other', label: 'Otro' },
]

export const DEFAULT_ACTIVE_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
]

function getCurrentWeekMonday(): string {
  const monday = getMonday(new Date())
  return monday.toISOString().split('T')[0]
}

export const INITIAL_FORM_DATA: MenuFormData = {
  type: 'weekly',
  weekStart: getCurrentWeekMonday(),
  weekEnd: null,
  activeDays: [...DEFAULT_ACTIVE_DAYS],
  title: '',
  price: '',
  dishes: [],
}

export function createInitialFormData(): MenuFormData {
  return {
    ...INITIAL_FORM_DATA,
    weekStart: getCurrentWeekMonday(),
    activeDays: [...DEFAULT_ACTIVE_DAYS],
    dishes: [],
  }
}

export function createInitialDish(category: MenuCategory): DishInput {
  return {
    id: crypto.randomUUID(),
    category,
    nameEs: '',
    nameEn: '',
    nameFr: '',
    sortOrder: 0,
  }
}

/**
 * Validates a step of the multi-step menu form.
 * Step 0: weekStart must be set; if type=event, title must be non-empty.
 * Step 1: at least 1 dish with non-empty nameEs, price must be non-empty.
 * Step 2: always true (review step).
 */
export function validateStep(step: number, data: MenuFormData): boolean {
  switch (step) {
    case 0: {
      if (!data.weekStart) return false
      if (data.type === 'event' && !data.title.trim()) return false
      return true
    }
    case 1: {
      if (!data.price.trim()) return false
      const hasValidDish = data.dishes.some((d) => d.nameEs.trim().length > 0)
      return hasValidDish
    }
    case 2:
      return true
    default:
      return false
  }
}
