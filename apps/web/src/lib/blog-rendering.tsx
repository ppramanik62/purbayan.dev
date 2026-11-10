import { Fragment, type ReactNode } from "react"
import type { ContentBlock, List, Sidenote } from "@/data/blog"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { CodeBlock } from "@/components/blog/code-block"
import { PostFigure } from "@/components/blog/post-figure"

/**
 * Browsers may break a line right after a slash, splitting "I/O" into "I/" and "O".
 * Short slashed words like I/O or read/write are kept whole.
 */
function keepSlashesWhole(text: string, key: number): ReactNode {
  const parts = text.split(/(\w+(?:\/\w+)+)/)
  if (parts.length === 1) return text
  return (
    <Fragment key={key}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </Fragment>
  )
}

export function renderInlineText(text: string, notes: readonly Sidenote[] = []): ReactNode[] {
  const parts: ReactNode[] = []
  // Bold, inline code, a sidenote reference [^id], a link [text](url), or *italic* / _italic_.
  // The sidenote comes before the link so [^id] is never read as link text, and bold before
  // italic so **x** is never read as two italics. The formatter rewrites *x* as _x_ on commit;
  // an underscore inside a word, as in write_all, isn't italics.
  const regex =
    /(\*\*(.+?)\*\*|`([^`]+)`|\[\^([\w-]+)\]|\[([^\]]+)\]\(([^)\s]+)\)|\*(?!\s)([^*]+?)\*|(?<!\w)_(?!\s)([^_]+?)_(?!\w))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(keepSlashesWhole(text.slice(lastIndex, match.index), lastIndex))
    }

    if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-medium text-ink">
          {match[2]}
        </strong>,
      )
    } else if (match[4]) {
      const number = notes.find((note) => note.id === match![4])?.number
      parts.push(
        <sup key={match.index} className="ml-px font-mono text-[0.65em] text-pen">
          {number}
        </sup>,
      )
    } else if (match[5]) {
      parts.push(renderLink(match[5], match[6], match.index, notes))
    } else if (match[7] || match[8]) {
      parts.push(<em key={match.index}>{renderInlineText(match[7] ?? match[8], notes)}</em>)
    } else if (match[3]) {
      parts.push(
        <code
          key={match.index}
          className="rounded-xs bg-card px-1 py-0.5 font-code text-[0.85em] text-pen"
        >
          {match[3]}
        </code>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(keepSlashesWhole(text.slice(lastIndex), lastIndex))
  }

  return parts
}

/** Links to this site stay in the app; anything else opens in a new tab. */
function renderLink(text: string, href: string, key: number, notes: readonly Sidenote[]) {
  const children = renderInlineText(text, notes)
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link key={key} to={href} className="ink-link">
        {children}
      </Link>
    )
  }
  return (
    <a key={key} href={href} target="_blank" rel="noreferrer" className="ink-link">
      {children}
    </a>
  )
}

export function renderBlock(
  block: ContentBlock,
  index: number,
  notes: readonly Sidenote[] = [],
): ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className="max-w-[64ch] text-dim">
          {renderInlineText(block.text, notes)}
        </p>
      )
    case "heading":
      return block.level === 2 ? (
        <h2
          key={index}
          id={block.id}
          className="scroll-mt-8 pt-4 font-serif text-2xl font-normal italic text-ink"
        >
          {block.text}
        </h2>
      ) : (
        <h3
          key={index}
          id={block.id}
          className="scroll-mt-8 pt-2 font-serif text-xl font-medium text-ink"
        >
          {block.text}
        </h3>
      )
    case "code":
      return <CodeBlock key={index} language={block.language} code={block.code} />
    case "image":
      return <PostFigure key={index} src={block.src} alt={block.alt} caption={block.caption} />
    case "rule":
      return <hr key={index} className="my-4 w-24 border-0 border-t border-rule" />
    case "table":
      // Wide tables scroll sideways inside their own box instead of widening the page.
      return (
        <div key={index} className="max-w-[64ch] overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left text-[0.92em] leading-snug text-dim">
            <thead>
              <tr className="border-b border-ink/40">
                {block.head.map((cell, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <th
                    key={i}
                    className="py-1.5 pr-5 align-bottom font-mono text-[11px] font-medium tracking-widest text-faint uppercase"
                  >
                    {renderInlineText(cell, notes)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={r} className="border-b border-rule">
                  {row.map((cell, c) => (
                    <td
                      // eslint-disable-next-line react/no-array-index-key
                      key={c}
                      className={cn("py-2 pr-5 align-top", c === 0 && "text-ink")}
                    >
                      {renderInlineText(cell, notes)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case "list":
      return <ListView key={index} list={block} notes={notes} />
  }
}

/** A `-` or numbered list. A sub-list sits indented under its item, without the gap above it. */
function ListView({
  list,
  notes,
  nested = false,
}: {
  list: List
  notes: readonly Sidenote[]
  nested?: boolean
}) {
  const Tag = list.ordered ? "ol" : "ul"
  return (
    <Tag className={cn("max-w-[64ch] list-none p-0", !nested && "-mt-3")}>
      {list.items.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className="relative my-0.5 pl-[26px] text-dim">
          <span
            aria-hidden
            className={cn(
              "absolute text-faint",
              list.ordered ? "left-0 w-[19px] text-right" : "left-1.5",
            )}
          >
            {list.ordered ? `${i + 1}.` : "–"}
          </span>
          {renderInlineText(item.text, notes)}
          {item.sub && <ListView list={item.sub} notes={notes} nested />}
        </li>
      ))}
    </Tag>
  )
}
