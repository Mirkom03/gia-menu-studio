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
