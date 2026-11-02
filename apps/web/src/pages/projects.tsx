import { projects, type Repo } from "@/data/projects"
import { isOngoing, timeline, type Span } from "@/lib/dates"
import { usePageMeta } from "@/hooks/use-page-meta"
import { PageHead, Row } from "@/components/notebook"
import { SpanMargin, TimelineAxis, TimelineBar } from "@/components/timeline"

const repoUrl = (name: string) => `https://github.com/ppramanik62/${name}`
const spanOf = (repo: Repo): Span => ({ start: repo.created, end: repo.pushed })

export default function ProjectsPage() {
  usePageMeta({
    title: "Projects",
    description: "Things I've built, in the order GitHub lists them.",
  })

  const axis = timeline(projects.map(spanOf))

  return (
    <>
      <PageHead title="Projects" />
      <TimelineAxis axis={axis} />

      {projects.map((repo) => {
        const span = spanOf(repo)
        const meta = [repo.language.toLowerCase(), repo.stars ? `★ ${repo.stars}` : ""]
          .filter(Boolean)
          .join(" · ")

        return (
          <Row key={repo.name} pen={isOngoing(span)} margin={<SpanMargin span={span} />}>
            <a href={repoUrl(repo.name)} target="_blank" rel="noreferrer" className="group block">
              <span className="font-medium group-hover:text-pen">{repo.name}</span>
              {meta && <span className="ml-2 font-mono text-xs text-faint">{meta}</span>}
              <span className="block text-[16.5px] text-dim">{repo.description}</span>
            </a>
            <TimelineBar axis={axis} span={span} />
          </Row>
        )
      })}
    </>
  )
}
