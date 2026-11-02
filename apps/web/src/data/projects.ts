import github from "./github.json"

/**
 * The repos shown on /projects. Their order, dates and descriptions come from
 * GitHub through `bun run sync:github`, so this list only says which ones.
 */
export const PROJECT_REPOS = [
  "onyxdb",
  "database-papers",
  "purbayan.dev",
  "yc-jev-bench",
  "trovecn",
  "mdt",
  "musializer",
  "4at",
  "seroost",
] as const

/** The projects Home shows under "Recently". */
export const HOME_PROJECTS: readonly (typeof PROJECT_REPOS)[number][] = ["onyxdb", "trovecn"]

export interface Repo {
  name: string
  description: string
  language: string
  stars: number
  homepage: string
  /** ISO dates, YYYY-MM-DD. */
  created: string
  pushed: string
}

/** GitHub's own order: most recently pushed first. */
export const projects: readonly Repo[] = github.repos
