import { useEffect, useState } from "react"
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

function Clock() {
  const [time, setTime] = useState(clock)
  useEffect(() => {
    const id = setInterval(() => setTime(clock()), 30_000)
    return () => clearInterval(id)
  }, [])
  return <span>{time} IST</span>
}

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
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
        <nav className="col-start-2 mt-4 flex flex-wrap gap-x-[22px] gap-y-1 text-[17px] max-[680px]:col-start-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "border-b-[1.5px] pb-0.5 transition-colors",
                  isActive ? "border-pen text-ink" : "border-transparent text-dim hover:text-ink",
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
