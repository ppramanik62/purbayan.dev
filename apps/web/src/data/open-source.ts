import github from "./github.json"
import type { Span } from "@/lib/dates"

/**
 * Other people's projects I've sent pull requests to. The PRs themselves, their
 * states and dates come from GitHub through `bun run sync:github`.
 *
 * Each project shows its owner's GitHub avatar, unless `icon` points at a better one.
 */
export const OSS_REPOS: readonly { repo: string; what: string; icon?: string }[] = [
  { repo: "tursodatabase/turso", what: "SQLite rewritten in Rust" },
  {
    repo: "liliu-z/stashbase",
    what: "a local knowledge base for writing with AI agents",
    icon: "https://stashbase.ai/apple-touch-icon.png",
  },
  {
    repo: "Bot-Holder/stashbase-web",
    what: "the stashbase.ai website",
    icon: "https://stashbase.ai/apple-touch-icon.png",
  },
  { repo: "mastra-ai/mastra", what: "a TypeScript AI agent framework" },
  { repo: "langfuse/langfuse", what: "an LLM observability platform" },
  { repo: "apache/echarts", what: "a charting library" },
]

export interface PullRequest {
  number: number
  title: string
  state: "merged" | "open"
  /** YYYY-MM-DD. */
  opened: string
  merged: string | null
}

export interface Contribution {
  repo: string
  what: string
  /** Newest first. Closed-without-merging PRs are left out. */
  prs: readonly PullRequest[]
  mergedCount: number
  openCount: number
  /** From the first PR opened to the last one opened or merged. */
  span: Span
}

const synced = new Map(
  github.oss.map((entry) => [entry.repo, entry.prs as unknown as PullRequest[]]),
)

/** Most recently active first. */
export const contributions: readonly Contribution[] = OSS_REPOS.map(({ repo, what }) => {
  const prs = synced.get(repo) ?? []
  const dates = prs.flatMap((pr) => (pr.merged ? [pr.opened, pr.merged] : [pr.opened])).sort()
  return {
    repo,
    what,
    prs,
    mergedCount: prs.filter((pr) => pr.state === "merged").length,
    openCount: prs.filter((pr) => pr.state === "open").length,
    span: { start: dates[0], end: dates[dates.length - 1] },
  }
})
  .filter((c) => c.prs.length > 0)
  .sort((a, b) => b.span.end.localeCompare(a.span.end))

/** Where the sync saves a project's icon. */
export const iconPath = (repo: string) => `/oss/${repo.replace("/", "--")}.png`

/** The latest PRs across every project, by when they were opened or merged. */
export function latestPullRequests(limit: number): (PullRequest & { repo: string })[] {
  return contributions
    .flatMap((c) => c.prs.map((pr) => ({ ...pr, repo: c.repo })))
    .sort((a, b) => (b.merged ?? b.opened).localeCompare(a.merged ?? a.opened))
    .slice(0, limit)
}
