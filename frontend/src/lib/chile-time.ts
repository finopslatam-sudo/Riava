const CHILE_TZ = 'America/Santiago'

function getTimeZoneOffsetMillis(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, {} as Record<string, string>)
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second)
  return asUTC - date.getTime()
}

/** Convierte una hora "pared" de Chile (ej. 2026-07-30 09:30) al instante real (UTC),
 *  respetando el horario de verano en vez de asumir un offset fijo. */
export function chileWallTimeToInstant(dateStr: string, timeStr: string): Date {
  const naiveUTC = new Date(`${dateStr}T${timeStr}:00Z`)
  const chileOffsetMillis = getTimeZoneOffsetMillis(naiveUTC, CHILE_TZ)
  return new Date(naiveUTC.getTime() - chileOffsetMillis)
}

export function isChileWallTimePast(dateStr: string, timeStr: string): boolean {
  return chileWallTimeToInstant(dateStr, timeStr).getTime() <= Date.now()
}
