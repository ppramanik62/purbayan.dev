import { useState } from "react"
import { Link } from "react-router-dom"
import github from "@/data/github.json"
import { intro, openTo } from "@/data/site"
import { blogPosts, type BlogPost } from "@/data/blog"
import { HOME_PROJECTS, projects } from "@/data/projects"
import { latestPullRequests, iconPath } from "@/data/open-source"
import { SOCIAL } from "@/data/social-links"
import { isOngoing, monthYear, shortDate, spanLabel } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { usePageMeta } from "@/hooks/use-page-meta"
import { Gap, Heading, Row } from "@/components/notebook"
import { Heatmap } from "@/components/heatmap"

/** How many posts and PRs "Recently" shows. */
const RECENT = 3

function Photo() {
  return (
    <span className="relative mt-1 inline-block -rotate-3 bg-card p-1.5 pb-[18px] shadow-[0_1px_3px_rgba(60,45,20,.18)] before:absolute before:-top-[9px] before:left-1/2 before:-ml-[23px] before:h-4 before:w-[46px] before:rotate-[4deg] before:bg-tape">
      <img
        src="/avatar.png"
        alt="Purbayan Pramanik"
        width={104}
        height={104}
        className="block size-[104px] object-cover sepia-[.25] max-[680px]:size-20"
      />
    </span>
  )
}

/**
 * The post's thumbnail from public/og (drawn by `bun run og:posts`). Until it
 * exists, a card in the same style stands in, so a new post never shows a broken image.
 */
function Thumbnail({ post }: { post: BlogPost }) {
  const [missing, setMissing] = useState(false)
  const frame = "block aspect-[1200/630] w-full max-w-[460px] border border-rule"

  if (missing) {
    return (
      <span className={cn(frame, "relative bg-paper")}>
        <span className="absolute inset-y-0 left-[12.5%] w-px bg-pen/40" />
        <span className="absolute inset-x-[17%] top-1/2 -translate-y-1/2 text-[22px] leading-tight font-medium text-pretty italic">
          {post.title}
        </span>
      </span>
    )
  }

  return (
    <img
      src={`/og/${post.slug}.png`}
      alt=""
      loading="lazy"
      onError={() => setMissing(true)}
      className={frame}
    />
  )
}

function RecentProjects() {
  const picked = projects.filter((repo) => (HOME_PROJECTS as readonly string[]).includes(repo.name))
  return picked.map((repo) => {
    const span = { start: repo.created, end: repo.pushed }
    return (
      <a
        key={repo.name}
        href={`https://github.com/ppramanik62/${repo.name}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-baseline gap-4 py-1"
      >
        <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
          <span className="shrink-0 group-hover:text-pen">{repo.name}</span>
          <span className="truncate text-[16px] text-dim">{repo.description}</span>
        </span>
        <span
          className={cn("shrink-0 font-mono text-xs", isOngoing(span) ? "text-pen" : "text-faint")}
        >
          {spanLabel(span)}
        </span>
      </a>
    )
  })
}

function RecentWriting() {
  const [latest, ...rest] = blogPosts.slice(0, RECENT)
  if (!latest) return null

  return (
    <>
      <Link to={`/writing/${latest.slug}`} className="group block">
        <Thumbnail post={latest} />
        <span className="mt-2.5 flex items-baseline justify-between gap-4">
          <span className="font-medium group-hover:text-pen">{latest.title}</span>
          <span className="shrink-0 font-mono text-xs text-faint">{shortDate(latest.date)}</span>
        </span>
      </Link>
      {rest.map((post) => (
        <Link
          key={post.slug}
          to={`/writing/${post.slug}`}
          className="group flex items-baseline justify-between gap-4 py-1"
        >
          <span className="group-hover:text-pen">{post.title}</span>
          <span className="shrink-0 font-mono text-xs text-faint">{shortDate(post.date)}</span>
        </Link>
      ))}
    </>
  )
}

function RecentOpenSource() {
  return latestPullRequests(RECENT).map((pr) => (
    <a
      key={`${pr.repo}#${pr.number}`}
      href={`https://github.com/${pr.repo}/pull/${pr.number}`}
      target="_blank"
      rel="noreferrer"
      className="group grid grid-cols-[20px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 py-1"
    >
      <img
        src={iconPath(pr.repo)}
        alt=""
        width={20}
        height={20}
        className="size-5 translate-y-1 rounded-[4px] border border-rule"
        title={pr.repo}
      />
      <span className="group-hover:text-pen">{pr.title}</span>
      <span className={cn("font-mono text-xs", pr.state === "merged" ? "text-pencil" : "text-pen")}>
        {pr.state}
      </span>
    </a>
  ))
}

export default function HomePage() {
  usePageMeta({
    description:
      "Purbayan Pramanik, software engineer. Building onyxdb, a SQL database in Rust, while learning how databases work inside.",
  })

  const { profile, contributions } = github

  return (
    <>
      <Gap />
      <Row margin={<Photo />}>
        <p className="mb-3.5 text-[21px] leading-normal">{intro[0]}</p>
        {intro.slice(1).map((paragraph) => (
          <p key={paragraph} className="mb-3.5 max-w-[60ch] text-dim">
            {paragraph}
          </p>
        ))}
        <p className="mb-3.5 max-w-[60ch] text-dim">
          {openTo} Write to me at{" "}
          <a href={SOCIAL.email.url} className="ink-link">
            {SOCIAL.email.display}
          </a>
          .
        </p>
        <p className="mt-[18px] font-mono text-[12.5px] text-faint">
          <a
            href={SOCIAL.github.url}
            target="_blank"
            rel="noreferrer"
            className="text-pen hover:underline"
          >
            github.com/{profile.login}
          </a>{" "}
          · since {monthYear(profile.since)} · {profile.publicRepos} repos
        </p>
      </Row>

      <Gap />
      <Row
        pen
        margin={
          <>
            {contributions.total.toLocaleString("en-US")}
            <br />
            contributions
          </>
        }
      >
        <Heading>The last twelve months</Heading>
        <Heatmap />
      </Row>

      <Gap />
      <Row>
        <Heading>Recently</Heading>
      </Row>
      <Row
        margin={
          <Link to="/projects" className="hover:text-pen">
            projects
          </Link>
        }
      >
        <RecentProjects />
      </Row>
      <Row
        margin={
          <Link to="/writing" className="hover:text-pen">
            writing
          </Link>
        }
      >
        <RecentWriting />
      </Row>
      <Row
        margin={
          <Link to="/open-source" className="hover:text-pen">
            open source
          </Link>
        }
      >
        <RecentOpenSource />
      </Row>
    </>
  )
}
