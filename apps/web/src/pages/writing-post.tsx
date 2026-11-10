import { useMemo, type ReactNode } from "react"
import { useParams, Link } from "react-router-dom"
import { blogPosts, notesIn, seriesParts, type BlogPost, type Sidenote } from "@/data/blog"
import { shortDate } from "@/lib/dates"
import { renderBlock, renderInlineText } from "@/lib/blog-rendering"
import { cn } from "@/lib/utils"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Gap, Row } from "@/components/notebook"
import {
  hasOutline,
  OutlineDetails,
  OutlineTabs,
  type OutlineEntry,
} from "@/components/blog/post-outline"

/**
 * One block of a post, with its sidenotes in the margin beside it. On phones the
 * margin is gone, so the notes follow the block instead.
 */
function Block({
  notes,
  mark,
  children,
}: {
  notes: Sidenote[]
  mark?: { number: string; level: 2 | 3 }
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "mb-5 grid grid-cols-[var(--margin)_minmax(0,1fr)] gap-x-[var(--gutter)] max-[680px]:grid-cols-1",
        // A heading's number sits on the same baseline as the heading, whatever its size.
        mark && "items-baseline",
      )}
    >
      {/* On desktop the notes hang in the margin without adding height, so a long note never pushes the text apart. */}
      <div className="relative max-[680px]:order-2">
        {mark && (
          <span
            className={cn(
              "block text-right font-mono text-pen max-[680px]:hidden",
              mark.level === 2 ? "text-[13px]" : "text-[12px] text-pen/70",
            )}
          >
            {mark.number}
          </span>
        )}
        {notes.length > 0 && (
          <aside className="absolute inset-x-0 top-1 space-y-2.5 text-[14px] leading-snug text-dim max-[680px]:static max-[680px]:mt-2 max-[680px]:border-l-2 max-[680px]:border-pen/40 max-[680px]:pl-3">
            {notes.map((note) => (
              <p key={note.id} className="m-0">
                <span className="mr-1 font-mono text-[11px] text-pen">{note.number}</span>
                {renderInlineText(note.text)}
              </p>
            ))}
          </aside>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/**
 * The end of a post in a series: every published part, this one marked, then links to the
 * parts either side. Shown once a series has at least two parts out.
 */
function SeriesNav({ post, parts }: { post: BlogPost; parts: BlogPost[] }) {
  const index = parts.indexOf(post)
  const prev = parts[index - 1]
  const next = parts[index + 1]
  return (
    <>
      <Gap />
      <Row margin={post.series?.name} pen>
        <ol className="m-0 list-none p-0">
          {parts.map((part) => (
            <li key={part.slug} className="flex gap-3 py-0.5">
              <span className="w-5 shrink-0 text-right font-mono text-xs leading-[2.4] text-faint">
                {part.series?.part}.
              </span>
              {part === post ? (
                <span className="text-ink">
                  {part.title} <span className="font-mono text-xs text-pen">· reading</span>
                </span>
              ) : (
                <Link to={`/writing/${part.slug}`} className="text-dim hover:text-ink">
                  {part.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
        {(prev || next) && (
          <p className="mt-4 mb-0 flex flex-wrap justify-between gap-x-6 gap-y-2">
            {prev ? (
              <Link to={`/writing/${prev.slug}`} className="ink-link text-dim">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/writing/${next.slug}`} className="ink-link text-dim">
                {next.title} →
              </Link>
            )}
          </p>
        )}
      </Row>
    </>
  )
}

export default function WritingPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)
  const outline = useMemo(
    () => post?.content.filter((block): block is OutlineEntry => block.type === "heading") ?? [],
    [post],
  )

  const parts = post ? seriesParts(post) : []

  usePageMeta({
    title: post?.title ?? "Not found",
    description: post?.summary ?? "Post not found.",
  })

  if (!post) {
    return (
      <>
        <Gap />
        <Row>
          <p className="text-dim">
            That post doesn&rsquo;t exist.{" "}
            <Link to="/writing" className="ink-link">
              Back to writing
            </Link>
            .
          </p>
        </Row>
      </>
    )
  }

  return (
    <>
      <div className="relative">
        {hasOutline(outline) && <OutlineTabs entries={outline} />}
        <Gap />
        <Row
          pen
          margin={
            <>
              {shortDate(post.date)}
              <br />
              {post.readingTime}
              {post.series && (
                <>
                  <br />
                  part {post.series.part}
                  {parts.length > 1 && ` of ${parts.length}`}
                </>
              )}
            </>
          }
        >
          <h1 className="m-0 font-serif text-pretty text-[clamp(28px,4.4vw,38px)] leading-[1.15] font-medium italic">
            {post.title}
          </h1>
          <p className="mt-3 max-w-[60ch] text-dim">{post.summary}</p>
          <p className="mt-2 font-mono text-xs text-faint">{post.tags.join(" · ")}</p>
          {hasOutline(outline) && <OutlineDetails entries={outline} />}
        </Row>
        <div className="py-3.5">
          {post.content.map((block, i) => (
            <Block
              key={i}
              notes={notesIn(block, post.notes)}
              mark={block.type === "heading" ? block : undefined}
            >
              {renderBlock(block, i, post.notes)}
            </Block>
          ))}
        </div>
      </div>
      {parts.length > 1 && post.series && <SeriesNav post={post} parts={parts} />}
      <Gap />
      <Row>
        <Link to="/writing" className="ink-link text-dim">
          All writing
        </Link>
      </Row>
    </>
  )
}
