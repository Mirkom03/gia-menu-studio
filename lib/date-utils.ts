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

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTHS_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

export function formatRangeEnglish(start: string, end: string): string {
  const s = parseDate(start)
  const e = parseDate(end)
  const sDay = s.getDate()
  const eDay = e.getDate()
  const sMonth = MONTHS_EN[s.getMonth()]
  const eMonth = MONTHS_EN[e.getMonth()]
  const year = e.getFullYear()

  if (start === end) {
    return `${sMonth} ${sDay}, ${year}`
  }

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${sMonth} ${sDay}-${eDay}, ${year}`
  }

  return `${sMonth} ${sDay} - ${eMonth} ${eDay}, ${year}`
}

export function formatDateEnglish(date: string): string {
  const d = parseDate(date)
  const month = MONTHS_EN[d.getMonth()]
  return `${month} ${d.getDate()}, ${d.getFullYear()}`
}

export function formatRangeFrench(start: string, end: string): string {
  const s = parseDate(start)
  const e = parseDate(end)
  const sDay = s.getDate()
  const eDay = e.getDate()
  const sMonth = MONTHS_FR[s.getMonth()]
  const eMonth = MONTHS_FR[e.getMonth()]
  const year = e.getFullYear()

  if (start === end) {
    return `${sDay} ${sMonth} ${year}`
  }

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `Du ${sDay} au ${eDay} ${eMonth} ${year}`
  }

  return `Du ${sDay} ${sMonth} au ${eDay} ${eMonth} ${year}`
}

export function formatDateFrench(date: string): string {
  const d = parseDate(date)
  const month = MONTHS_FR[d.getMonth()]
  return `${d.getDate()} ${month} ${d.getFullYear()}`
}
