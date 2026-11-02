import { reading } from "@/data/reading"
import { shortDate } from "@/lib/dates"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Gap, PageHead, Row } from "@/components/notebook"

export default function ReadingPage() {
  usePageMeta({ title: "Reading", description: "Books, papers and articles I've read." })

  return (
    <>
      <PageHead title="Reading">Books, papers and articles I&rsquo;ve read, newest first.</PageHead>

      {reading.length === 0 && (
        <Row>
          <p className="text-dim">The list is on its way.</p>
        </Row>
      )}

      {reading.map((section) => (
        <details key={section.title} open className="group">
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <Row
              margin={`${section.items.length} ${section.items.length === 1 ? "item" : "items"}`}
              className="pt-6"
            >
              <span className="inline-flex items-baseline gap-2.5 text-xl italic group-hover:text-pen">
                <span
                  aria-hidden="true"
                  className="inline-block font-mono text-xs text-faint not-italic transition-transform group-open:rotate-90"
                >
                  ▸
                </span>
                {section.title}
              </span>
            </Row>
          </summary>

          {[...section.items]
            .sort((a, b) => b.added.localeCompare(a.added))
            .map((item) => (
              <Row dense key={item.url} margin={shortDate(item.added)}>
                <a href={item.url} target="_blank" rel="noreferrer" className="group/item block">
                  <span className="group-hover/item:text-pen">{item.title}</span>
                  <span className="ml-2 font-mono text-xs text-faint">{item.kind}</span>
                  {item.by && <span className="block text-[16px] text-dim">{item.by}</span>}
                </a>
              </Row>
            ))}
        </details>
      ))}
      <Gap />
    </>
  )
}
