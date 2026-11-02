import { reading } from "@/data/reading"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Gap, PageHead, Row } from "@/components/notebook"

export default function ReadingPage() {
  usePageMeta({ title: "Reading", description: "Papers and articles I've read." })

  return (
    <>
      <PageHead title="Reading" />

      {reading.length === 0 && (
        <Row>
          <p className="text-dim">The list is on its way.</p>
        </Row>
      )}

      {reading.map((section) => (
        <section key={section.title}>
          <Row
            margin={`${section.items.length} ${section.items.length === 1 ? "item" : "items"}`}
            className="pt-6"
          >
            <h2 className="m-0 text-xl font-normal italic">{section.title}</h2>
          </Row>

          {section.items.map((item) => (
            <Row dense key={item.url} margin={item.kind}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                title={item.title}
                className="group/item flex items-baseline gap-x-4"
              >
                <span className="min-w-0 truncate group-hover/item:text-pen">{item.title}</span>
                <span className="ml-auto flex shrink-0 gap-2 font-mono text-xs text-pencil">
                  {item.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </span>
              </a>
            </Row>
          ))}
        </section>
      ))}
      <Gap />
    </>
  )
}
