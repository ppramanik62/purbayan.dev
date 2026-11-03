import raw from "../content/reading.json"
import {
  parseArray,
  parseObject,
  parseOneOf,
  parseString,
  parseStringArray,
  parseUrl,
} from "./parse"

const KINDS = ["book", "paper", "article"] as const

export type ReadingKind = (typeof KINDS)[number]

export interface ReadingItem {
  title: string
  url: string
  kind: ReadingKind
  /** What it's about. */
  tags: readonly string[]
}

export interface ReadingSection {
  title: string
  items: readonly ReadingItem[]
}

const FILE = "content/reading.json"

function parseItem(value: unknown, where: string): ReadingItem {
  const item = parseObject(value, where)
  return {
    title: parseString(item.title, `${where}.title`),
    url: parseUrl(item.url, `${where}.url`),
    kind: parseOneOf(item.kind, KINDS, `${where}.kind`),
    tags: parseStringArray(item.tags, `${where}.tags`),
  }
}

function parseSection(value: unknown, where: string): ReadingSection {
  const section = parseObject(value, where)
  return {
    title: parseString(section.title, `${where}.title`),
    items: parseArray(section.items, `${where}.items`).map((item, i) =>
      parseItem(item, `${where}.items[${i}]`),
    ),
  }
}

/** What I've read, grouped into sections on /reading. Edit `src/content/reading.json`. */
export const reading: readonly ReadingSection[] = parseArray(raw, FILE).map((section, i) =>
  parseSection(section, `${FILE} [${i}]`),
)
