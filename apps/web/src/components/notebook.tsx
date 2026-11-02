import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * One line of the notebook: a note in the margin, the writing beside it.
 * Below 680px the margin note sits on top instead.
 */
export function Row({
  margin,
  pen = false,
  dense = false,
  children,
  className,
}: {
  margin?: ReactNode
  /** Write the margin note in red pen instead of pencil grey. */
  pen?: boolean
  /** Tight spacing, for one-line entries in a list. */
  dense?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[var(--margin)_minmax(0,1fr)] gap-x-[var(--gutter)]",
        dense ? "py-1 max-[680px]:py-1.5" : "py-3.5 max-[680px]:py-2.5",
        "max-[680px]:grid-cols-1",
        className,
      )}
    >
      <div
        className={cn(
          "text-right font-mono text-xs leading-[1.9] max-[680px]:text-left",
          pen ? "text-pen" : "text-faint",
        )}
      >
        {margin}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function Gap() {
  return <div className="h-[26px]" />
}

export function Rule() {
  return <div className="border-t border-dashed border-rule" />
}

export function Heading({ as: Tag = "h2", children }: { as?: "h1" | "h2"; children: ReactNode }) {
  return <Tag className="m-0 font-serif text-2xl leading-snug font-normal italic">{children}</Tag>
}

/** A page's title row: the italic heading, an optional line under it, then a dashed rule. */
export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <Gap />
      <Row>
        <Heading as="h1">{title}</Heading>
        {children && <p className="mt-2 max-w-[60ch] text-dim">{children}</p>}
      </Row>
      <Rule />
    </>
  )
}

/** A dash-bulleted list, as written by hand. */
export function Dashes({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-2 list-none p-0">
      {items.map((item) => (
        <li
          key={item}
          className="relative my-1.5 pl-[26px] text-[16.5px] text-dim before:absolute before:left-1.5 before:text-faint before:content-['–']"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
