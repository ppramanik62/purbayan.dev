export type ReadingKind = "book" | "paper" | "article"

export interface ReadingItem {
  title: string
  url: string
  kind: ReadingKind
  /** Who wrote it, or where it was published. */
  by?: string
  /** The day it went on this list, YYYY-MM-DD. */
  added: string
}

export interface ReadingSection {
  title: string
  items: readonly ReadingItem[]
}

/** What I've read, grouped into sections. Each section collapses on /reading. */
export const reading: readonly ReadingSection[] = []
