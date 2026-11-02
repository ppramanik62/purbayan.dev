/** Reads blog post frontmatter for the build scripts (thumbnails, prerendered previews). */
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

export interface PostMeta {
  slug: string
  title: string
  date: string
  summary: string
  readingTime: string
}

const postsDir = join(import.meta.dir, "../src/content/blog")

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
  return readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fm = frontmatter(readFileSync(join(postsDir, file), "utf8"))
      for (const key of ["title", "date", "summary", "readingTime"]) {
        if (!fm[key]) throw new Error(`${file}: frontmatter needs "${key}"`)
      }
      return {
        slug: file.replace(/\.md$/, ""),
        title: fm.title,
        date: fm.date,
        summary: fm.summary,
        readingTime: fm.readingTime,
      }
    })
}
