import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import type { ContentBlock } from "@/data/blog"
import { cn } from "@/lib/utils"

export type OutlineEntry = Extract<ContentBlock, { type: "heading" }>

/** A `## ` heading with the `### ` headings under it. */
interface Section {
  head: OutlineEntry
  subs: OutlineEntry[]
}

function sectionsOf(entries: readonly OutlineEntry[]): Section[] {
  const sections: Section[] = []
  for (const entry of entries) {
    if (entry.level === 2 || sections.length === 0) sections.push({ head: entry, subs: [] })
    else sections[sections.length - 1].subs.push(entry)
  }
  return sections
}

/** Short posts don't need a table of contents. */
export function hasOutline(entries: readonly OutlineEntry[]): boolean {
  return entries.length >= 3
}

/** A heading counts as the current section once its top passes this far down the window. */
const READING_LINE = 140

/** The id of the heading being read: the last one above the reading line. */
function useCurrentHeading(entries: readonly OutlineEntry[]): string | null {
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let found: string | null = null
      for (const entry of entries) {
        const el = document.getElementById(entry.id)
        if (el && el.getBoundingClientRect().top <= READING_LINE) found = entry.id
      }
      // At the very bottom the last short sections can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        found = entries.at(-1)?.id ?? found
      }
      setCurrent(found)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [entries])

  return current
}

/** Where each heading starts on the page, and where the page ends. Re-measured as images load. */
function useHeadingOffsets(entries: readonly OutlineEntry[]) {
  const [offsets, setOffsets] = useState<{
    tops: Map<string, number>
    end: number
    /** Where the tab strip sits on the page before it sticks. */
    stripTop: number
  } | null>(null)

  useEffect(() => {
    const measure = () => {
      const tops = new Map<string, number>()
      for (const entry of entries) {
        const el = document.getElementById(entry.id)
        if (el) tops.set(entry.id, el.getBoundingClientRect().top + window.scrollY)
      }
      const strip = document.getElementById(STRIP_ID)
      const stripTop = strip ? strip.getBoundingClientRect().top + window.scrollY : 0
      setOffsets({ tops, end: document.documentElement.scrollHeight, stripTop })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [entries])

  return offsets
}

/** The window's height and scroll position, updated once per frame. */
function useViewport(): { height: number; scrollY: number } {
  const [viewport, setViewport] = useState(() => ({
    height: window.innerHeight,
    scrollY: window.scrollY,
  }))
  useEffect(() => {
    let frame = 0
    const update = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setViewport({ height: window.innerHeight, scrollY: window.scrollY })
      })
    }
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])
  return viewport
}

/** Scroll to the heading and put its id in the address bar, without a router navigation. */
function jump(id: string) {
  document.getElementById(id)?.scrollIntoView()
  history.replaceState(history.state, "", `#${id}`)
}

const STRIP_ID = "outline-tabs"
/** Space the tab strip leaves above and below itself once it sticks. */
const STICK_TOP = 32
const STICK_BOTTOM = 48
const TAB_GAP = 5
/** Tall enough for its number, however short the section. */
const MIN_TAB = 34

/**
 * Tab heights in px: each section's share of the post, with short sections raised to
 * MIN_TAB and the long ones shrunk to make room.
 */
function tabHeights(lengths: number[], room: number): number[] {
  const total = lengths.reduce((a, b) => a + b, 0) || 1
  const raw = lengths.map((length) => (length / total) * room)
  const short = raw.filter((h) => h < MIN_TAB).length
  const longTotal = raw.filter((h) => h >= MIN_TAB).reduce((a, b) => a + b, 0) || 1
  const spare = room - short * MIN_TAB
  return raw.map((h) => (h < MIN_TAB ? MIN_TAB : (h / longTotal) * spare))
}

/**
 * The table of contents for wide screens: divider tabs beside the page, one per `## ` section,
 * each as tall as its share of the post. Ticks inside a tab mark where its subsections start.
 * The current tab sticks out and shows its title and subsections; hovering another shows
 * just its title.
 * Place it inside a `relative` box around the post: it starts level with the title, then
 * stays in view.
 */
export function OutlineTabs({ entries }: { entries: readonly OutlineEntry[] }) {
  const current = useCurrentHeading(entries)
  const offsets = useHeadingOffsets(entries)
  const viewport = useViewport()
  const [hovered, setHovered] = useState<string | null>(null)

  const sections = sectionsOf(entries)
  const currentSection = current
    ? sections.find((s) => s.head.id === current || s.subs.some((sub) => sub.id === current))
    : undefined
  const shownId = hovered ?? currentSection?.head.id ?? null
  // While the panel fades out it keeps showing the last section, not an empty box.
  const lastShown = useRef<string | null>(null)
  if (shownId) lastShown.current = shownId
  const panelSection = sections.find((s) => s.head.id === lastShown.current)

  // The panel slides between tabs while it's showing; appearing from hidden, it snaps to its
  // tab first so only the fade plays (as the transitions.dev tooltip does).
  const panel = useRef<HTMLDivElement>(null)
  const wasShown = useRef(false)
  useLayoutEffect(() => {
    const el = panel.current
    if (el && shownId && !wasShown.current) {
      el.style.transition = "none"
      void el.offsetWidth
      el.style.transition = ""
    }
    wasShown.current = shownId !== null
  }, [shownId])

  if (!offsets) return <div id={STRIP_ID} className="absolute top-[42px]" />
  const start = (entry: OutlineEntry) => offsets.tops.get(entry.id) ?? 0
  const ends = sections.map((_, i) => (sections[i + 1] ? start(sections[i + 1].head) : offsets.end))
  // Near the top of the page the strip sits lower, beside the title; it fills whatever is
  // visible below that, and grows to full height as it reaches the top and sticks.
  const stripTop = Math.max(STICK_TOP, offsets.stripTop - viewport.scrollY)
  const room = viewport.height - stripTop - STICK_BOTTOM - TAB_GAP * sections.length
  const heights = tabHeights(
    sections.map((s, i) => ends[i] - start(s.head)),
    room,
  )
  const tops = heights.map((_, i) => heights.slice(0, i).reduce((sum, h) => sum + h + TAB_GAP, 0))
  const panelIndex = panelSection ? sections.indexOf(panelSection) : 0

  return (
    <div className="absolute inset-y-0 left-[calc(100%+2px)] hidden pt-[42px] min-[1280px]:block">
      <div id={STRIP_ID} />
      <nav
        aria-label="Contents"
        style={{ top: STICK_TOP, height: room + TAB_GAP * sections.length }}
        className="sticky"
        onMouseLeave={() => setHovered(null)}
      >
        {sections.map((section, i) => {
          const height = heights[i]
          const id = section.head.id
          const active = id === currentSection?.head.id
          const length = ends[i] - start(section.head) || 1
          return (
            <button
              key={id}
              type="button"
              onClick={() => jump(id)}
              onMouseEnter={() => setHovered(id)}
              onFocus={() => setHovered(id)}
              onBlur={() => setHovered(null)}
              aria-label={`${section.head.number} ${section.head.text}`}
              aria-current={active ? "location" : undefined}
              style={{ top: tops[i], height }}
              className={cn(
                "absolute left-0 flex cursor-pointer flex-col items-center rounded-r-[5px] border border-l-0 bg-card pt-1.5 font-mono text-[10.5px] shadow-[0_1px_2px_rgba(60,45,20,.12)]",
                "transition-[width,border-color,color] duration-(--duration-fast) ease-(--ease-smooth-out)",
                active
                  ? "w-[38px] border-pen/50 text-pen"
                  : "w-[30px] border-rule text-faint hover:w-[34px] hover:text-ink",
              )}
            >
              {section.head.number}
              {section.subs.map((sub) => {
                const at = (start(sub) - start(section.head)) / length
                // A tick under the number or on the bottom edge would be hidden or crowded.
                if (at * height < 22 || at * height > height - 4) return null
                return (
                  <span
                    key={sub.id}
                    aria-hidden
                    style={{ top: `${at * 100}%` }}
                    className={cn(
                      "absolute left-0 h-px transition-[width,background-color] duration-(--duration-fast) ease-(--ease-smooth-out)",
                      sub.id === current ? "w-3 bg-pen" : "w-2 bg-faint/60",
                    )}
                  />
                )
              })}
            </button>
          )
        })}

        <div
          ref={panel}
          data-show={shownId !== null}
          style={{ "--tt-y": `${(tops[panelIndex] ?? 0) + 2}px` } as CSSProperties}
          className="t-tt left-12 w-[clamp(150px,calc(50vw-500px),230px)] font-serif text-[14px] leading-[1.25]"
        >
          {panelSection && (
            <>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => jump(panelSection.head.id)}
                className={cn(
                  "block cursor-pointer text-left text-pretty",
                  panelSection === currentSection ? "text-ink" : "text-dim hover:text-ink",
                )}
              >
                {panelSection.head.text}
              </button>
              {/* Hovering another tab only names it; the subsections list is for the one being read. */}
              {panelSection === currentSection && panelSection.subs.length > 0 && (
                <ol className="mt-1.5 list-none border-l border-rule p-0">
                  {panelSection.subs.map((sub) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => jump(sub.id)}
                        className={cn(
                          "-ml-px block cursor-pointer border-l py-[3px] pl-2.5 text-left text-[13px] text-pretty transition-colors",
                          sub.id === current
                            ? "border-pen text-ink"
                            : "border-transparent text-faint hover:text-ink",
                        )}
                      >
                        {sub.text}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  )
}

/**
 * Below 1280px there's no room beside the page, so the contents fold under the title
 * (transitions.dev's accordion: the list grows open and the chevron flips).
 */
export function OutlineDetails({ entries }: { entries: readonly OutlineEntry[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="t-acc mt-4 min-[1280px]:hidden" data-open={open}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="post-contents"
        onClick={() => setOpen((o) => !o)}
        className="t-acc-head flex cursor-pointer items-center gap-1.5 font-mono text-[11px] tracking-widest text-faint uppercase hover:text-ink"
      >
        Contents
        <span className="t-acc-chevron" aria-hidden>
          <svg viewBox="0 0 16 16" className="size-3 fill-none stroke-current stroke-[1.5]">
            <path d="M4 6.5L8 10.5L12 6.5" />
          </svg>
        </span>
      </button>
      <div className="t-acc-panel" id="post-contents">
        <div className="t-acc-panel-inner" inert={!open}>
          <nav aria-label="Contents" className="pt-2 font-serif text-[15px]">
            <ol className="m-0 list-none border-l border-rule p-0">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      jump(entry.id)
                    }}
                    className={cn(
                      "flex gap-2 py-[5px] leading-[1.3] text-pretty text-faint hover:text-ink",
                      entry.level === 2 ? "pl-3" : "pl-6 text-[0.92em]",
                    )}
                  >
                    <span className="shrink-0 font-mono text-[11px] leading-[1.9] text-pen/70">
                      {entry.number}
                    </span>
                    {entry.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  )
}
