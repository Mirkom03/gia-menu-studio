import type { MenuType, MenuCategory } from '@/lib/types'

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
  weekEnd: string
  title: string
  price: string
  dishes: DishInput[]
  sourceMenuId?: string
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

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getToday(): string {
  return toISODate(new Date())
}

function getNextFriday(): string {
  const d = new Date()
  const day = d.getDay()
  // days until friday: if today is Mon(1)->4, Tue(2)->3, etc. If already Fri/Sat/Sun, go to next week's Friday
  const daysUntilFri = day <= 5 ? (5 - day) || 7 : 5 + (7 - day)
  d.setDate(d.getDate() + daysUntilFri)
  return toISODate(d)
}

export const INITIAL_FORM_DATA: MenuFormData = {
  type: 'weekly',
  weekStart: getToday(),
  weekEnd: getNextFriday(),
  title: '',
  price: '',
  dishes: [],
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
      if (data.type === 'weekly' && !data.weekEnd) return false
      if (data.type === 'weekly' && data.weekEnd < data.weekStart) return false
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
