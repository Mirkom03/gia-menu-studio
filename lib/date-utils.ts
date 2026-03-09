export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DAYS_ES_FULL = [
  'Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado',
]

export const DAYS_ES_SHORT = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

const DAY_NAME_TO_OFFSET: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
}

/**
 * Returns the Monday of the week containing the given date.
 * Sets time to 00:00:00.000.
 */
export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday is 0 => go back 6 days; otherwise go back (day - 1) days
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Returns the actual date of the last active day in the week starting from Monday.
 * If activeDays is empty, defaults to Friday (offset 4).
 */
export function getWeekEnd(monday: Date, activeDays: string[]): Date {
  let maxOffset = 4 // default to friday
  if (activeDays.length > 0) {
    maxOffset = Math.max(
      ...activeDays.map((day) => DAY_NAME_TO_OFFSET[day] ?? 4)
    )
  }
  const end = new Date(monday)
  end.setDate(end.getDate() + maxOffset)
  end.setHours(0, 0, 0, 0)
  return end
}

/**
 * Parse a date string safely, avoiding timezone shifts.
 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/**
 * Format as "Semana del {startDay} al {endDay} de {Month}, {Year}".
 * If months differ: "Semana del 28 de Febrero al 4 de Marzo, 2026".
 */
export function formatWeekRangeSpanish(
  weekStart: string,
  weekEnd: string
): string {
  const start = parseDate(weekStart)
  const end = parseDate(weekEnd)
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = MONTHS_ES[start.getMonth()]
  const endMonth = MONTHS_ES[end.getMonth()]
  const year = end.getFullYear()

  if (start.getMonth() === end.getMonth()) {
    return `Semana del ${startDay} al ${endDay} de ${endMonth}, ${year}`
  }
  return `Semana del ${startDay} de ${startMonth} al ${endDay} de ${endMonth}, ${year}`
}

/**
 * Format as "Sabado, 14 de Marzo de 2026".
 */
export function formatEventDateSpanish(date: string): string {
  const d = parseDate(date)
  const dayName = DAYS_ES_FULL[d.getDay()]
  const dayNum = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  const year = d.getFullYear()
  return `${dayName}, ${dayNum} de ${month} de ${year}`
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const ALL_DAYS = DAY_ORDER

const DAY_TO_SHORT: Record<string, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mie',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sab',
  sunday: 'Dom',
}

/**
 * If all 5 weekdays: "Lunes a Viernes".
 * If all 7 days: "Lunes a Domingo".
 * Otherwise: abbreviated list "Lun · Mar · Jue".
 */
export function formatActiveDaysLabel(activeDays: string[]): string {
  const sorted = [...activeDays].sort(
    (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
  )

  const isAllWeekdays =
    sorted.length === 5 && WEEKDAYS.every((d) => sorted.includes(d))
  if (isAllWeekdays) return 'Lunes a Viernes'

  const isAllDays =
    sorted.length === 7 && ALL_DAYS.every((d) => sorted.includes(d))
  if (isAllDays) return 'Lunes a Domingo'

  return sorted.map((d) => DAY_TO_SHORT[d] ?? d).join(' \u00B7 ')
}
