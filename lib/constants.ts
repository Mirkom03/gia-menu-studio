export const APP_NAME = 'Gia Menu Studio'

export const NAV_ITEMS = [
  { href: '/', label: 'Inicio', icon: 'Home' },
  { href: '/create', label: 'Crear', icon: 'PlusCircle' },
  { href: '/history', label: 'Historial', icon: 'Clock' },
  { href: '/settings', label: 'Ajustes', icon: 'Settings' },
] as const

export const ASPECT_RATIOS = [
  { id: 'instagram', label: 'Instagram', ratio: '4:5', width: 1080, height: 1350 },
  { id: 'screen', label: 'Pantalla/TV', ratio: '16:9', width: 1920, height: 1080 },
  { id: 'stories', label: 'Stories', ratio: '9:16', width: 1080, height: 1920 },
  { id: 'a4', label: 'A4 Vertical', ratio: '3:4', width: 2480, height: 3508 },
  { id: 'a5', label: 'A5', ratio: '3:4', width: 1748, height: 2480 },
  { id: 'custom', label: 'Personalizado', ratio: null, width: null, height: null },
] as const

export type AspectRatioId = typeof ASPECT_RATIOS[number]['id']

export const DPI_OPTIONS = [
  { value: 72, label: 'Estandar (72 DPI)', description: 'Para pantalla' },
  { value: 150, label: 'Alta (150 DPI)', description: 'Para impresion basica' },
  { value: 300, label: 'Maxima (300 DPI)', description: 'Para impresion profesional' },
] as const

export const PAPER_SIZES = [
  { id: 'a4', label: 'A4', widthMm: 210, heightMm: 297 },
  { id: 'a5', label: 'A5', widthMm: 148, heightMm: 210 },
  { id: 'custom', label: 'Personalizado', widthMm: null, heightMm: null },
] as const

export type PaperSizeId = typeof PAPER_SIZES[number]['id']

export const LANGUAGE_OPTIONS = [
  { id: 'es' as const, label: 'Espanol', flag: 'ES' },
  { id: 'en' as const, label: 'English', flag: 'EN' },
  { id: 'fr' as const, label: 'Francais', flag: 'FR' },
] as const
