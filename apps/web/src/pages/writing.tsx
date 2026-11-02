import { Link } from "react-router-dom"
import { blogPosts } from "@/data/blog"
import { notes } from "@/data/site"
import { shortDate } from "@/lib/dates"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Gap, Heading, PageHead, Row } from "@/components/notebook"

export default function WritingPage() {
  usePageMeta({
    title: "Writing",
    description: "Posts, and my notes from reading about how databases work.",
  })

  return (
    <>
      <PageHead title="Writing" />
      {blogPosts.map((post) => (
        <Row dense key={post.slug} margin={shortDate(post.date)}>
          <Link to={`/writing/${post.slug}`} className="group block">
            <span className="font-medium group-hover:text-pen">{post.title}</span>
          </Link>
        </Row>
      ))}

      <Gap />
      <Row pen margin="database-papers">
        <Heading>Reading notes</Heading>
        <p className="mt-2 max-w-[60ch] text-dim">
          One set per onyxdb layer: what I read for it, and what I took from it.
        </p>
      </Row>
      {notes.map((note, i) => (
        <Row
          dense
          key={note.title}
          margin={
            note.reading ? (
              <span className="inline-block -rotate-2 rounded-[3px] border-[1.5px] border-pen px-[7px] py-0.5 text-[11px] font-medium tracking-widest text-pen uppercase">
                reading
              </span>
            ) : (
              `no. ${i + 1}`
            )
          }
        >
          <a href={note.url} target="_blank" rel="noreferrer" className="group block">
            <span className="font-medium group-hover:text-pen">{note.title}</span>
            <span className="block text-[16.5px] text-dim">{note.what}</span>
          </a>
        </Row>
      ))}
    </>
  )
}
