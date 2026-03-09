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

export const CATEGORIES: { value: MenuCategory; label: string }[] = [
  { value: 'starter', label: 'Entrante' },
  { value: 'main', label: 'Principal' },
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
