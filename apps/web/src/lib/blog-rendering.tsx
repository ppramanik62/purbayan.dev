import type { ReactNode } from "react"
import type { ContentBlock, Sidenote } from "@/data/blog"
import { Link } from "react-router-dom"
import { CodeBlock } from "@/components/blog/code-block"
import { PostFigure } from "@/components/blog/post-figure"

export function renderInlineText(text: string, notes: readonly Sidenote[] = []): ReactNode[] {
  const parts: ReactNode[] = []
  // Bold, inline code, a sidenote reference [^id], or a link [text](url). The sidenote comes
  // before the link so [^id] is never read as link text.
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\[\^([\w-]+)\]|\[([^\]]+)\]\(([^)\s]+)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
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
    parts.push(text.slice(lastIndex))
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
      return (
        <h2 key={index} className="pt-4 font-serif text-2xl font-normal italic text-ink">
          {block.text}
        </h2>
      )
    case "code":
      return <CodeBlock key={index} language={block.language} code={block.code} />
    case "image":
      return <PostFigure key={index} src={block.src} alt={block.alt} caption={block.caption} />
    case "list":
      return (
        <ul key={index} className="max-w-[64ch] list-none p-0">
          {block.items.map((item, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <li
              key={i}
              className="relative my-1.5 pl-[26px] text-dim before:absolute before:left-1.5 before:text-faint before:content-['–']"
            >
              {renderInlineText(item, notes)}
            </li>
          ))}
        </ul>
      )
  }
}
