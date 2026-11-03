import { assertUniqueSlugs, parsePostFile } from "./post-file"
import { imageDir, isImageLine, parseImageLine, type PostImage } from "./post-image"

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] }
  | ({ type: "image" } & PostImage)

export interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  summary: string
  readingTime: string
  content: ContentBlock[]
  /** Sidenotes, numbered in the order they're first referenced. */
  notes: Sidenote[]
}

export interface Sidenote {
  id: string
  number: number
  text: string
}

/** `[^id]` in the text points at a `[^id]: note` line elsewhere in the post. */
export const NOTE_REF = /\[\^([\w-]+)\]/g
const NOTE_DEF = /^\[\^([\w-]+)\]:\s+(.+)$/

interface BlogFrontmatter {
  title: string
  tags: string[]
  summary: string
  readingTime: string
}

const rawPosts = import.meta.glob<string>("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
})

function parseScalar(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed) as string
  }
  return trimmed
}

function parseFrontmatterValue(value: string): string | string[] {
  const trimmed = value.trim()
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return JSON.parse(trimmed) as string[]
  }
  return parseScalar(trimmed)
}

function parseFrontmatter(source: string): { metadata: BlogFrontmatter; body: string } {
  if (!source.startsWith("---\n")) {
    throw new Error("Blog post is missing frontmatter")
  }

  const end = source.indexOf("\n---", 4)
  if (end === -1) {
    throw new Error("Blog post has unterminated frontmatter")
  }

  const frontmatter = source.slice(4, end).trim()
  const body = source.slice(end + "\n---".length).trim()
  const values: Record<string, string | string[]> = {}

  for (const line of frontmatter.split("\n")) {
    const separator = line.indexOf(":")
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1)
    values[key] = parseFrontmatterValue(value)
  }

  const metadata = {
    title: requireString(values, "title"),
    tags: requireStringArray(values, "tags"),
    summary: requireString(values, "summary"),
    readingTime: requireString(values, "readingTime"),
  }

  return { metadata, body }
}

function requireString(values: Record<string, string | string[]>, key: string): string {
  const value = values[key]
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Blog post frontmatter requires string "${key}"`)
  }
  return value
}

function requireStringArray(values: Record<string, string | string[]>, key: string): string[] {
  const value = values[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Blog post frontmatter requires string array "${key}"`)
  }
  return value
}

function parseMarkdownBody(source: string): { blocks: ContentBlock[]; notes: Sidenote[] } {
  const blocks: ContentBlock[] = []
  const definitions = new Map<string, string>()
  let inFence = false
  const lines = source.split("\n").filter((line) => {
    if (line.trim().startsWith("```")) inFence = !inFence
    const def = inFence ? null : line.trim().match(NOTE_DEF)
    if (!def) return true
    if (definitions.has(def[1])) throw new Error(`Sidenote [^${def[1]}] is defined twice`)
    definitions.set(def[1], def[2].trim())
    return false
  })
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (trimmed === "") {
      index++
      continue
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || "text"
      const codeLines: string[] = []
      index++

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index])
        index++
      }

      if (index >= lines.length) {
        throw new Error("Blog post has unterminated code fence")
      }

      blocks.push({ type: "code", language, code: codeLines.join("\n") })
      index++
      continue
    }

    if (isImageLine(trimmed)) {
      blocks.push({ type: "image", ...parseImageLine(trimmed) })
      index++
      continue
    }

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", text: trimmed.slice(3).trim() })
      index++
      continue
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = []

      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2).trim())
        index++
      }

      blocks.push({ type: "list", items })
      continue
    }

    const paragraphLines = [trimmed]
    index++

    while (index < lines.length) {
      const next = lines[index].trim()
      if (
        next === "" ||
        next.startsWith("## ") ||
        next.startsWith("```") ||
        next.startsWith("- ") ||
        isImageLine(next)
      ) {
        break
      }
      paragraphLines.push(next)
      index++
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") })
  }

  return { blocks, notes: numberNotes(blocks, definitions) }
}

/** The text in a block that can hold sidenote references. Code and images hold none. */
function textsIn(block: ContentBlock): readonly string[] {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return [block.text]
    case "list":
      return block.items
    case "code":
    case "image":
      return []
  }
}

/** Every reference needs a definition and every definition a reference, or the post fails to build. */
function numberNotes(blocks: ContentBlock[], definitions: Map<string, string>): Sidenote[] {
  const notes: Sidenote[] = []
  for (const block of blocks) {
    for (const text of textsIn(block)) {
      for (const [, id] of text.matchAll(NOTE_REF)) {
        if (notes.some((note) => note.id === id)) continue
        const note = definitions.get(id)
        if (!note) throw new Error(`Sidenote [^${id}] has no definition`)
        notes.push({ id, number: notes.length + 1, text: note })
      }
    }
  }
  for (const id of definitions.keys()) {
    if (!notes.some((note) => note.id === id)) throw new Error(`Sidenote [^${id}] is never used`)
  }
  return notes
}

/** The sidenotes a block references, in order. */
export function notesIn(block: ContentBlock, notes: readonly Sidenote[]): Sidenote[] {
  const ids = new Set(
    textsIn(block).flatMap((text) => [...text.matchAll(NOTE_REF)].map((m) => m[1])),
  )
  return notes.filter((note) => ids.has(note.id))
}

export const blogPosts: BlogPost[] = Object.entries(rawPosts)
  .map(([path, rawPost]) => {
    try {
      const { date, slug } = parsePostFile(path.split("/").pop() ?? path)
      const { metadata, body } = parseFrontmatter(rawPost)
      const { blocks, notes } = parseMarkdownBody(body)
      for (const block of blocks) {
        if (block.type === "image" && !block.src.startsWith(imageDir(slug))) {
          throw new Error(`Image ${block.src} must live in public${imageDir(slug)}`)
        }
      }
      return {
        slug,
        date,
        ...metadata,
        content: blocks,
        notes,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`${path}: ${error.message}`)
      }
      throw error
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

assertUniqueSlugs(blogPosts)
