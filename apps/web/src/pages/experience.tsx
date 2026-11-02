import { experiences } from "@/data/experience"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Dashes, Gap, PageHead, Row } from "@/components/notebook"

export default function ExperiencePage() {
  usePageMeta({ title: "Experience", description: "Where I've worked, and what I built there." })

  return (
    <>
      <PageHead title="Experience" />
      {experiences.map((job) => (
        <div key={`${job.company}-${job.period}`}>
          <Row
            margin={job.period.split(" – ").map((part, i) => (
              <span key={part} className="block">
                {i > 0 && "– "}
                {part}
              </span>
            ))}
          >
            <div>
              <span className="font-medium">{job.role}</span>,{" "}
              <a href={job.url} target="_blank" rel="noreferrer" className="ink-link">
                {job.company}
              </a>
            </div>
            <span className="block text-[16.5px] text-dim">{job.summary}</span>
            <Dashes items={job.work} />
          </Row>
          <Gap />
        </div>
      ))}
    </>
  )
}
