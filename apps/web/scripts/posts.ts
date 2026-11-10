/** Reads blog post frontmatter for the build scripts (thumbnails, prerendered previews). */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { assertUniqueSlugs, parsePostFile } from "../src/data/post-file"
import { isImageLine, parseImageLine } from "../src/data/post-image"

export interface PostMeta {
  slug: string
  title: string
  date: string
  summary: string
  readingTime: string
  /** "part 1 of Buffer Managers 101" for a post in a series, else null. */
  seriesLabel: string | null
}

const postsDir = join(import.meta.dir, "../src/content/blog")
const publicDir = join(import.meta.dir, "../public")

/** Fails if a post points at an image that isn't in public/. Lines inside code fences are skipped. */
function checkImages(file: string, source: string) {
  let inFence = false
  for (const line of source.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence
    if (inFence || !isImageLine(line)) continue
    let src: string
    try {
      src = parseImageLine(line).src
    } catch (error) {
      throw new Error(`${file}: ${error instanceof Error ? error.message : error}`)
    }
    if (!existsSync(join(publicDir, src)))
      throw new Error(`${file}: image public${src} does not exist`)
  }
}

function frontmatter(source: string): Record<string, string> {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ""
  return Object.fromEntries(
    block
      .split("\n")
      .map((line) => line.match(/^(\w+):\s*"?(.*?)"?\s*$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2]]),
  )
}

export function readPosts(): PostMeta[] {
  const posts = readdirSync(postsDir)
    // Skip hidden files, like the `.#name.md` lock files editors leave beside an open file.
    .filter((file) => file.endsWith(".md") && !file.startsWith("."))
    .map((file) => {
      const { date, slug } = parsePostFile(file)
      const source = readFileSync(join(postsDir, file), "utf8")
      checkImages(file, source)
      const fm = frontmatter(source)
      for (const key of ["title", "summary", "readingTime"]) {
        if (!fm[key]) throw new Error(`${file}: frontmatter needs "${key}"`)
      }
      return {
        slug,
        title: fm.title,
        date,
        summary: fm.summary,
        readingTime: fm.readingTime,
        seriesLabel: fm.series && fm.part ? `part ${fm.part} of ${fm.series}` : null,
      }
    })
  assertUniqueSlugs(posts)
  return posts
}
