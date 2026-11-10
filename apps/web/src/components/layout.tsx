import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { NavLink, Outlet, useLocation, Link } from "react-router-dom"
import { SOCIAL } from "@/data/social-links"
import { clock, todayLong } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/error-boundary"

const NAV = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Experience", to: "/experience" },
  { label: "Writing", to: "/writing" },
  { label: "Reading", to: "/reading" },
  { label: "Open source", to: "/open-source" },
] as const

const FOOT_LINKS = [
  { label: "github", href: SOCIAL.github.url },
  { label: "linkedin", href: SOCIAL.linkedin.url },
  { label: "x", href: SOCIAL.x.url },
  { label: "email", href: SOCIAL.email.url },
  { label: "resume", href: "/resume/resume.pdf" },
] as const

/**
 * Kolkata time. When the minute turns, the digits that changed pop in (transitions.dev's
 * number pop-in). Keying each digit by its place and value remounts only the changed ones,
 * which replays their animation; the first render doesn't animate.
 */
function Clock() {
  const [time, setTime] = useState(clock)
  const [ticked, setTicked] = useState(false)
  useEffect(() => {
    const id = setInterval(() => {
      const next = clock()
      setTime((prev) => {
        if (prev !== next) setTicked(true)
        return next
      })
    }, 30_000)
    return () => clearInterval(id)
  }, [])
  const chars = [...time]
  return (
    <span>
      <span className={ticked ? "t-digit-group is-animating" : "t-digit-group"}>
        {chars.map((ch, i) => (
          <span
            key={`${i}${ch}`}
            className="t-digit"
            data-stagger={i === chars.length - 2 ? "1" : i === chars.length - 1 ? "2" : undefined}
          >
            {ch}
          </span>
        ))}
      </span>{" "}
      IST
    </span>
  )
}

/**
 * The pen underline under the current tab slides to the new one on navigation
 * (transitions.dev's tabs sliding). It snaps into place on first paint and on resize,
 * and fades out on pages outside the tabs.
 */
function useNavUnderline(pathname: string) {
  const nav = useRef<HTMLElement>(null)
  const line = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  // Put the line under the current tab: sliding there, or snapping (first paint, resize).
  const move = (animate: boolean) => {
    const bar = line.current
    const active = nav.current?.querySelector<HTMLElement>('a[aria-current="page"]')
    if (!bar) return
    if (!active) {
      bar.style.opacity = "0"
      return
    }
    if (!animate) bar.style.transition = "none"
    bar.style.opacity = "1"
    bar.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop + active.offsetHeight - 1.5}px)`
    bar.style.width = `${active.offsetWidth}px`
    if (!animate) {
      void bar.offsetWidth
      bar.style.transition = ""
    }
  }

  useLayoutEffect(() => {
    move(placed.current)
    placed.current = true
  }, [pathname])

  useEffect(() => {
    const snap = () => move(false)
    window.addEventListener("resize", snap)
    // Webfonts change the tabs' widths once they load.
    void document.fonts.ready.then(snap)
    return () => window.removeEventListener("resize", snap)
  }, [])

  return { nav, line }
}

export function Layout() {
  const { pathname } = useLocation()
  const underline = useNavUnderline(pathname)

  // A new page starts at the top, or at the section its link names (`/writing/post#section`).
  useEffect(() => {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="mx-auto flex min-h-dvh max-w-[860px] flex-col px-5 pt-14 pb-10 max-[680px]:pt-8">
      <header className="grid grid-cols-[var(--margin)_minmax(0,1fr)] items-end gap-x-[var(--gutter)] border-b border-rule pb-[22px] max-[680px]:grid-cols-1">
        <div className="pb-1.5 text-right max-[680px]:pb-1 max-[680px]:text-left">
          {/* Long dates are wider than the margin; keep them on one line, overflowing left. */}
          <span className="flex justify-end text-[17px] leading-tight whitespace-nowrap text-dim italic max-[680px]:justify-start">
            {todayLong()}
          </span>
          <span className="mt-0.5 block font-mono text-[11.5px] text-faint">
            Kolkata · <Clock />
          </span>
        </div>
        <Link
          to="/"
          className="font-serif text-[clamp(30px,5vw,44px)] leading-[1.05] font-medium tracking-[-0.01em] italic hover:text-pen"
        >
          Purbayan Pramanik
        </Link>
        <nav
          ref={underline.nav}
          className="relative col-start-2 mt-4 flex flex-wrap gap-x-[22px] gap-y-1 text-[17px] max-[680px]:col-start-1"
        >
          <span
            ref={underline.line}
            aria-hidden
            className="t-tabs-pill h-[1.5px] bg-pen opacity-0"
          />
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "pb-[3.5px] transition-colors duration-(--tabs-dur) ease-(--tabs-ease)",
                  isActive ? "text-ink" : "text-dim hover:text-ink",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* The red margin rule runs down the page between the margin notes and the writing. */}
      <main className="relative flex-1 before:absolute before:inset-y-0 before:left-[calc(var(--margin)+var(--gutter)/2)] before:w-px before:bg-pen/35 max-[680px]:before:hidden">
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="mt-14 grid grid-cols-[var(--margin)_minmax(0,1fr)] gap-x-[var(--gutter)] border-t border-rule pt-[18px] font-mono text-[12.5px] text-faint max-[680px]:grid-cols-1 max-[680px]:gap-y-2">
        <span className="max-[680px]:hidden" />
        <div className="flex flex-wrap justify-between gap-2.5">
          <span>Written by hand, more or less.</span>
          <span className="flex flex-wrap gap-4">
            {FOOT_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-pen"
              >
                {l.label}
              </a>
            ))}
          </span>
        </div>
      </footer>
    </div>
  )
}
