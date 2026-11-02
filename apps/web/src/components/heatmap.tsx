import github from "@/data/github.json"

/** Paper to red pen, empty to busiest. */
const LEVELS = ["#e6dfcf", "#cfc0a6", "#c09a7c", "#b8644f", "#9c3626"] as const
const CELL = 10
const GAP = 3
const STEP = CELL + GAP
const DAY = 24 * 60 * 60 * 1000

/** The last year of GitHub contributions, one square per day, weeks as columns. */
export function Heatmap() {
  const { counts, start, total } = github.contributions
  const startTime = Date.parse(`${start}T00:00:00Z`)
  const offset = new Date(startTime).getUTCDay()
  const max = Math.max(...counts, 1)
  const level = (n: number) =>
    n === 0 ? 0 : n <= max * 0.15 ? 1 : n <= max * 0.35 ? 2 : n <= max * 0.6 ? 3 : 4
  const columns = Math.ceil((counts.length + offset) / 7)

  return (
    <svg
      viewBox={`0 0 ${columns * STEP - GAP} ${7 * STEP - GAP}`}
      className="mt-3.5 block w-full"
      role="img"
      aria-label={`${total} GitHub contributions in the last year`}
    >
      {counts.map((n, i) => {
        const slot = i + offset
        const date = new Date(startTime + i * DAY).toISOString().slice(0, 10)
        return (
          <rect
            key={date}
            x={Math.floor(slot / 7) * STEP}
            y={(slot % 7) * STEP}
            width={CELL}
            height={CELL}
            rx={2}
            fill={LEVELS[level(n)]}
          >
            <title>{`${n} on ${date}`}</title>
          </rect>
        )
      })}
    </svg>
  )
}
