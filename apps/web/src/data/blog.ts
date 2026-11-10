import { assertUniqueSlugs, parsePostFile } from "./post-file"
import { imageDir, isImageLine, parseImageLine, type PostImage } from "./post-image"

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | {
      type: "heading"
      level: 2 | 3
      text: string
      /** The anchor for links to this heading, made from its text. */
      id: string
      /** "§2" for a `## ` heading, "§2.1" for a `### ` under it. */
      number: string
    }
  | { type: "code"; language: string; code: string }
  | ({ type: "list" } & List)
  | { type: "table"; head: string[]; rows: string[][] }
  | ({ type: "image" } & PostImage)
  | { type: "rule" }

export interface List {
  ordered: boolean
  items: ListItem[]
}

/** A list item, with the sub-list indented under it, if any. The parser nests one level deep. */
export interface ListItem {
  text: string
  sub: List | null
}

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
/** A table's second line, like `|---|:---:|`. */
const TABLE_DIVIDER = /^\|(\s*:?-+:?\s*\|)+$/

/** `| a | b |` → ["a", "b"]. */
function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim())
}

/** "Why not mmap ??" → "why-not-mmap". A repeated heading gets "-2", "-3" so links stay unique. */
function headingId(text: string, taken: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "-") || "section"
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
  taken.add(id)
  return id
}

/** `- item` or `1. item`. Group 1 is the number, when there is one. */
const LIST_ITEM = /^(?:-|(\d+)\.)\s+/

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
  const headingIds = new Set<string>()
  let section = 0
  let subsection = 0
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

    if (trimmed === "---") {
      blocks.push({ type: "rule" })
      index++
      continue
    }

    if (trimmed.startsWith("# ")) {
      throw new Error(
        `"${trimmed}": the title comes from the frontmatter; use "## " and "### " for headings in the body`,
      )
    }

    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).trim()
      subsection++
      blocks.push({
        type: "heading",
        level: 3,
        text,
        id: headingId(text, headingIds),
        number: `§${section}.${subsection}`,
      })
      index++
      continue
    }

    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).trim()
      section++
      subsection = 0
      blocks.push({
        type: "heading",
        level: 2,
        text,
        id: headingId(text, headingIds),
        number: `§${section}`,
      })
      index++
      continue
    }

    if (trimmed.startsWith("|")) {
      const head = tableCells(trimmed)
      if (!TABLE_DIVIDER.test(lines[index + 1]?.trim().replaceAll(" ", "") ?? "")) {
        throw new Error(`Table "${trimmed}" needs a |---|---| line under its header`)
      }
      index += 2

      const rows: string[][] = []
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const row = tableCells(lines[index])
        if (row.length !== head.length) {
          throw new Error(
            `Table row "${lines[index].trim()}" has ${row.length} cells, not ${head.length}`,
          )
        }
        rows.push(row)
        index++
      }

      blocks.push({ type: "table", head, rows })
      continue
    }

    const listStart = trimmed.match(LIST_ITEM)
    if (listStart) {
      // A list is one kind throughout: `- ` items or numbered items, not a mix. Items
      // indented with spaces belong to a sub-list under the item above them.
      const ordered = listStart[1] !== undefined
      const items: ListItem[] = []

      while (index < lines.length) {
        const line = lines[index]
        const item = line.trim().match(LIST_ITEM)
        if (!item) break
        const text = line.trim().slice(item[0].length).trim()
        const subOrdered = item[1] !== undefined

        if (/^\s/.test(line) && items.length > 0) {
          const parent = items[items.length - 1]
          parent.sub ??= { ordered: subOrdered, items: [] }
          if (parent.sub.ordered !== subOrdered) {
            throw new Error(`List item "${line.trim()}" mixes dashes and numbers in one sub-list`)
          }
          parent.sub.items.push({ text, sub: null })
        } else {
          if (subOrdered !== ordered) break
          items.push({ text, sub: null })
        }
        index++
      }

      blocks.push({ type: "list", ordered, items })
      continue
    }

    const paragraphLines = [trimmed]
    index++

    while (index < lines.length) {
      const next = lines[index].trim()
      if (
        next === "" ||
        next === "---" ||
        next.startsWith("## ") ||
        next.startsWith("### ") ||
        next.startsWith("```") ||
        LIST_ITEM.test(next) ||
        next.startsWith("|") ||
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

/** The text in a block that can hold sidenote references. Code, images and rules hold none. */
function textsIn(block: ContentBlock): readonly string[] {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return [block.text]
    case "list":
      return block.items.flatMap((item) => [
        item.text,
        ...(item.sub?.items ?? []).map((sub) => sub.text),
      ])
    case "table":
      return [...block.head, ...block.rows.flat()]
    case "code":
    case "image":
    case "rule":
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
