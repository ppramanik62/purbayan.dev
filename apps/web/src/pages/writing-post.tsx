import type { ReactNode } from "react"
import { useParams, Link } from "react-router-dom"
import { blogPosts, notesIn, type Sidenote } from "@/data/blog"
import { shortDate } from "@/lib/dates"
import { renderBlock, renderInlineText } from "@/lib/blog-rendering"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Gap, Row } from "@/components/notebook"

/**
 * One block of a post, with its sidenotes in the margin beside it. On phones the
 * margin is gone, so the notes follow the block instead.
 */
function Block({ notes, children }: { notes: Sidenote[]; children: ReactNode }) {
  return (
    <div className="mb-5 grid grid-cols-[var(--margin)_minmax(0,1fr)] gap-x-[var(--gutter)] max-[680px]:grid-cols-1">
      {/* On desktop the notes hang in the margin without adding height, so a long note never pushes the text apart. */}
      <div className="relative max-[680px]:order-2">
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

export default function WritingPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)

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
      <Gap />
      <Row
        pen
        margin={
          <>
            {shortDate(post.date)}
            <br />
            {post.readingTime}
          </>
        }
      >
        <h1 className="m-0 max-w-[24ch] font-serif text-[clamp(28px,4.4vw,38px)] leading-[1.15] font-medium italic">
          {post.title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-dim">{post.summary}</p>
        <p className="mt-2 font-mono text-xs text-faint">{post.tags.join(" · ")}</p>
      </Row>
      <div className="py-3.5">
        {post.content.map((block, i) => (
          <Block key={i} notes={notesIn(block, post.notes)}>
            {renderBlock(block, i, post.notes)}
          </Block>
        ))}
      </div>
      <Gap />
      <Row>
        <Link to="/writing" className="ink-link text-dim">
          All writing
        </Link>
      </Row>
    </>
  )
}
