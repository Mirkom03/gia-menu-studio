export type MenuType = 'weekly' | 'event'
export type MenuStatus = 'draft' | 'generated' | 'final'
export type MenuCategory = 'starter' | 'main' | 'dessert' | 'drink' | 'other'
export type Language = 'es' | 'en' | 'fr'
export type ImageFormat = 'png' | 'pdf'

export interface Style {
  id: string
  name: string
  description: string
  prompt_template: string
  preview_url: string | null
  colors: Record<string, string>
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Menu {
  id: string
  created_at: string
  type: MenuType
  week_start: string
  week_end: string | null
  active_days: string[]
  title: string | null
  price: number | null
  style_id: string | null
  source_menu_id: string | null
  status: MenuStatus
  notes: string | null
  user_id: string
}

export interface MenuItem {
  id: string
  menu_id: string
  category: MenuCategory
  name_es: string
  name_en: string | null
  name_fr: string | null
  description_es: string | null
  description_en: string | null
  description_fr: string | null
  sort_order: number
}

export interface MenuImage {
  id: string
  menu_id: string
  language: Language
  image_url: string
  format: ImageFormat
  width: number | null
  height: number | null
  size_bytes: number | null
  prompt_used: string | null
  created_at: string
}
