/**
 * A post's file is `<yyyy-mm-dd>-<slug>.md`, like `2026-06-17-before-mmap.md`. The date is
 * the publish date and the slug is the URL (`/writing/before-mmap`). The site and the build
 * scripts both read posts through this, so they agree on both.
 */

const POST_FILE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/

export interface PostFile {
  date: string
  slug: string
}

export function parsePostFile(filename: string): PostFile {
  const match = filename.match(POST_FILE)
  if (!match) {
    throw new Error(
      `${filename}: post files are named <yyyy-mm-dd>-<slug>.md, with a lowercase, dash-separated slug`,
    )
  }
  const [, date, slug] = match
  // Round-trip through Date to reject days that don't exist, like 2026-02-30.
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${filename}: ${date} is not a real date`)
  }
  return { date, slug }
}

/** Two files with the same slug would fight over one URL. */
export function assertUniqueSlugs(posts: readonly { slug: string }[]): void {
  const seen = new Set<string>()
  for (const { slug } of posts) {
    if (seen.has(slug)) throw new Error(`Two posts share the slug "${slug}"`)
    seen.add(slug)
  }
}
