const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY = 24 * 60 * 60 * 1000
const TZ = "Asia/Kolkata"

const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const monthOf = (iso: string) => MONTHS[new Date(toTime(iso)).getUTCMonth()]
const yearOf = (iso: string) => new Date(toTime(iso)).getUTCFullYear()

/** A stretch of work, as ISO dates (YYYY-MM-DD). */
export interface Span {
  start: string
  end: string
}

/** Touched in the last two weeks counts as still going. */
export const isOngoing = (span: Span, now = Date.now()) => now - toTime(span.end) < 14 * DAY

/** "Jan – Apr 2026", "Sep 2026", "Oct 2026 – now". */
export function spanLabel(span: Span, now = Date.now()): string {
  const { start, end } = span
  const from = `${monthOf(start)} ${yearOf(start)}`
  if (isOngoing(span, now)) return `${from} – now`
  if (yearOf(start) !== yearOf(end)) return `${from} – ${monthOf(end)} ${yearOf(end)}`
  if (monthOf(start) === monthOf(end)) return from
  return `${monthOf(start)} – ${monthOf(end)} ${yearOf(end)}`
}

export interface Timeline {
  months: { label: string; at: number }[]
  /** Where a span sits on the axis, in percent. */
  bar: (span: Span) => { left: number; width: number }
}

/** One axis from the month the earliest span started to today, shared by every row. */
export function timeline(spans: readonly Span[], now = Date.now()): Timeline {
  const first = new Date(Math.min(...spans.map((s) => toTime(s.start))))
  first.setUTCDate(1)
  const start = +first
  const at = (t: number) => ((t - start) / (now - start)) * 100

  const months = []
  for (const d = new Date(start); +d <= now; d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push({ label: MONTHS[d.getUTCMonth()], at: at(+d) })
  }

  return {
    months,
    bar: (span) => {
      const left = at(toTime(span.start))
      const right = isOngoing(span, now) ? 100 : at(toTime(span.end) + DAY)
      return { left, width: Math.max(right - left, 0.8) }
    },
  }
}

/** Whole years since a YYYY-MM-DD birthday, as of today in Kolkata. */
export function ageToday(birthday: string): number {
  const [by, bm, bd] = birthday.split("-").map(Number)
  const [y, m, d] = new Date().toLocaleDateString("en-CA", { timeZone: TZ }).split("-").map(Number)
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0)
}

/** "Monday 2 November", in Kolkata. */
export const todayLong = () =>
  new Date().toLocaleDateString("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  })

/** "2 Nov 2026". */
export const shortDate = (iso: string) =>
  new Date(toTime(iso)).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

/** "Mar 2023". */
export const monthYear = (iso: string) => `${monthOf(iso)} ${yearOf(iso)}`

/** "17:45", in Kolkata. */
export const clock = () =>
  new Date().toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" })
