import { contributions, iconPath } from "@/data/open-source"
import { isOngoing, timeline } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Gap, PageHead, Row } from "@/components/notebook"
import { SpanMargin, TimelineAxis, TimelineBar } from "@/components/timeline"

const MARK = { merged: "✓", open: "○" } as const
/** Longer histories show their latest PRs here and link to the rest. */
const SHOWN = 5

const count = (n: number, word: string) => `${n} ${word}`

export default function OpenSourcePage() {
  usePageMeta({ title: "Open source", description: "Pull requests to other people's projects." })

  const axis = timeline(contributions.map((c) => c.span))
  const merged = contributions.reduce((n, c) => n + c.mergedCount, 0)
  const open = contributions.reduce((n, c) => n + c.openCount, 0)

  return (
    <>
      <PageHead title="Open source" />

      <Row margin="in all" pen>
        <p className="font-mono text-[13px] text-dim">
          <span className="text-pencil">{count(merged, "merged")}</span> ·{" "}
          <span className="text-pen">{count(open, "open")}</span> · {contributions.length} projects
        </p>
      </Row>

      <TimelineAxis axis={axis} />

      {contributions.map((c) => {
        const all = `https://github.com/${c.repo}/pulls?q=is%3Apr+author%3Appramanik62`
        return (
          <div key={c.repo}>
            <Row pen={isOngoing(c.span)} margin={<SpanMargin span={c.span} />}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="inline-flex items-center gap-2.5">
                  <img
                    src={iconPath(c.repo)}
                    alt=""
                    width={22}
                    height={22}
                    className="size-[22px] rounded-[5px] border border-rule"
                  />
                  <a
                    href={`https://github.com/${c.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ink-link font-medium"
                  >
                    {c.repo}
                  </a>
                </span>
                <span className="font-mono text-xs">
                  {c.mergedCount > 0 && (
                    <span className="text-pencil">{count(c.mergedCount, "merged")}</span>
                  )}
                  {c.mergedCount > 0 && c.openCount > 0 && <span className="text-faint"> · </span>}
                  {c.openCount > 0 && (
                    <span className="text-pen">{count(c.openCount, "open")}</span>
                  )}
                </span>
              </div>
              <span className="block text-[16.5px] text-dim">{c.what}</span>
              <TimelineBar axis={axis} span={c.span} />

              <div className="mt-2.5">
                {c.prs.slice(0, SHOWN).map((pr) => (
                  <a
                    key={pr.number}
                    href={`https://github.com/${c.repo}/pull/${pr.number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="grid grid-cols-[18px_minmax(0,1fr)_auto] gap-2.5 py-1 text-base text-dim hover:text-ink"
                  >
                    <span
                      className={cn(
                        "font-mono text-[13px]",
                        pr.state === "merged" ? "text-pencil" : "text-pen",
                      )}
                      aria-label={pr.state}
                    >
                      {MARK[pr.state]}
                    </span>
                    <span>{pr.title}</span>
                    <span className="font-mono text-xs leading-loose text-faint">#{pr.number}</span>
                  </a>
                ))}
                {c.prs.length > SHOWN && (
                  <a
                    href={all}
                    target="_blank"
                    rel="noreferrer"
                    className="ink-link mt-1 ml-7 inline-block text-[15px] text-dim"
                  >
                    and {c.prs.length - SHOWN} more on GitHub
                  </a>
                )}
              </div>
            </Row>
            <Gap />
          </div>
        )
      })}
    </>
  )
}
