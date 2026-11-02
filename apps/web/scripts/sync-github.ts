/**
 * Refreshes the GitHub snapshot the site renders: the project repos, the
 * contribution calendar, profile counts and the avatar.
 *
 *   bun run sync:github
 *
 * Needs the GitHub CLI, logged in.
 */
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { PROJECT_REPOS } from "../src/data/projects"
import { OSS_REPOS, iconPath } from "../src/data/open-source"

const LOGIN = "ppramanik62"
const root = join(import.meta.dir, "..")

function gh(query: string): any {
  const run = Bun.spawnSync(["gh", "api", "graphql", "-f", `query=${query}`], {
    env: { ...process.env, MISE_QUIET: "1" },
  })
  if (run.exitCode !== 0) throw new Error(run.stderr.toString())
  return JSON.parse(run.stdout.toString()).data
}

const repoFields = PROJECT_REPOS.map(
  (name, i) =>
    `r${i}: repository(owner: "${LOGIN}", name: "${name}") { name description primaryLanguage { name } stargazerCount homepageUrl createdAt pushedAt }`,
).join("\n")

// Search wants one query per repo; aliases keep it to a single request.
const prFields = OSS_REPOS.map(
  ({ repo }, i) =>
    `p${i}: search(query: "repo:${repo} type:pr author:${LOGIN}", type: ISSUE, first: 100) { nodes { ... on PullRequest { number title state createdAt mergedAt } } }`,
).join("\n")

const data = gh(`{
  ${repoFields}
  ${prFields}
  user(login: "${LOGIN}") {
    login
    createdAt
    avatarUrl(size: 320)
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`)

const repos = PROJECT_REPOS.map((_, i) => data[`r${i}`])
  .map((r) => ({
    name: r.name as string,
    description: (r.description ?? "") as string,
    language: (r.primaryLanguage?.name ?? "") as string,
    stars: r.stargazerCount as number,
    homepage: (r.homepageUrl ?? "") as string,
    created: (r.createdAt as string).slice(0, 10),
    pushed: (r.pushedAt as string).slice(0, 10),
    pushedAt: r.pushedAt as string,
  }))
  .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
  .map(({ pushedAt: _, ...r }) => r)

const user = data.user
const calendar = user.contributionsCollection.contributionCalendar
const days = calendar.weeks.flatMap((w: any) => w.contributionDays)

const oss = OSS_REPOS.map(({ repo }, i) => ({
  repo,
  prs: (data[`p${i}`].nodes as any[])
    .filter((pr) => pr.state !== "CLOSED")
    .map((pr) => ({
      number: pr.number as number,
      title: pr.title as string,
      state: pr.state === "MERGED" ? "merged" : "open",
      opened: (pr.createdAt as string).slice(0, 10),
      merged: pr.mergedAt ? (pr.mergedAt as string).slice(0, 10) : null,
    }))
    .sort((a, b) => b.opened.localeCompare(a.opened) || b.number - a.number),
}))

const snapshot = {
  profile: {
    login: (user.login as string).toLowerCase(),
    since: (user.createdAt as string).slice(0, 10),
    publicRepos: user.repositories.totalCount as number,
  },
  contributions: {
    total: calendar.totalContributions as number,
    start: days[0].date as string,
    counts: days.map((d: any) => d.contributionCount as number),
  },
  repos,
  oss,
}

writeFileSync(join(root, "src/data/github.json"), JSON.stringify(snapshot, null, 2) + "\n")

const avatar = await fetch(user.avatarUrl)
if (!avatar.ok) throw new Error(`avatar: ${avatar.status}`)
await Bun.write(join(root, "public/avatar.png"), await avatar.arrayBuffer())

// An icon per open-source project: its own if set, else the owner's GitHub avatar.
for (const { repo, icon } of OSS_REPOS) {
  const url = icon ?? `https://github.com/${repo.split("/")[0]}.png?size=64`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${repo} icon: ${res.status}`)
  await Bun.write(join(root, `public${iconPath(repo)}`), await res.arrayBuffer())
}

console.log(
  `synced ${repos.length} repos, ${oss.reduce((n, o) => n + o.prs.length, 0)} PRs, ${snapshot.contributions.total} contributions, avatar`,
)
