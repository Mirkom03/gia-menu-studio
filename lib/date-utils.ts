export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DAYS_ES_FULL = [
  'Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado',
]

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/**
 * Format as "Lunes, 14 de Marzo de 2026".
 */
export function formatDateSpanish(date: string): string {
  const d = parseDate(date)
  const dayName = DAYS_ES_FULL[d.getDay()]
  const dayNum = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  const year = d.getFullYear()
  return `${dayName}, ${dayNum} de ${month} de ${year}`
}

/**
 * Format range: "Del 9 al 13 de Junio, 2026" or cross-month "Del 28 de Feb. al 4 de Mar., 2026".
 */
export function formatRangeSpanish(start: string, end: string): string {
  const s = parseDate(start)
  const e = parseDate(end)
  const sDay = s.getDate()
  const eDay = e.getDate()
  const sMonth = MONTHS_ES[s.getMonth()]
  const eMonth = MONTHS_ES[e.getMonth()]
  const year = e.getFullYear()

  if (start === end) {
    return `${sDay} de ${sMonth}, ${year}`
  }

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `Del ${sDay} al ${eDay} de ${eMonth}, ${year}`
  }

  return `Del ${sDay} de ${sMonth} al ${eDay} de ${eMonth}, ${year}`
}
