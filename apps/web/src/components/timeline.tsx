import { isOngoing, spanLabel, type Span, type Timeline } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { Row } from "@/components/notebook"

/** Month labels across the top of a list of timeline rows. Hidden on phones, like the bars. */
export function TimelineAxis({ axis }: { axis: Timeline }) {
  return (
    <Row className="max-[680px]:hidden">
      <div className="relative h-4 font-mono text-[10.5px] text-faint">
        {/* The last month would hang off the edge, and ongoing bars already reach "now". */}
        {axis.months
          .filter((m) => m.at < 94)
          .map((m) => (
            <span
              key={`${m.label}-${m.at}`}
              className="absolute top-0"
              style={{ left: `${m.at}%` }}
            >
              {m.label}
            </span>
          ))}
      </div>
    </Row>
  )
}

/** A pencil line under a row, placed on the shared axis. Red while the work is ongoing. */
export function TimelineBar({ axis, span }: { axis: Timeline; span: Span }) {
  const bar = axis.bar(span)
  return (
    <div className="relative mt-2.5 h-2.5 border-b border-dotted border-rule">
      <span
        className={cn(
          "absolute -bottom-px h-[3px] rounded-full",
          isOngoing(span) ? "bg-pen" : "bg-pencil/70",
        )}
        style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
      />
    </div>
  )
}

/** "Mar" over "– Aug 2026", for the margin. */
export function SpanMargin({ span }: { span: Span }) {
  return spanLabel(span)
    .split(" – ")
    .map((part, i) => (
      <span key={part} className="block">
        {i > 0 && "– "}
        {part}
      </span>
    ))
}
