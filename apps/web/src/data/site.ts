import { ageToday } from "@/lib/dates"

/** 7 March 2005. The intro's age is worked out from it on each visit. */
const BIRTHDAY = "2005-03-07"

/** The home page intro, one string per paragraph. The first one is set larger. */
export const intro: readonly string[] = [
  `I'm ${ageToday(BIRTHDAY)}, software engineer, currently deep into database internals.`,
  "Most of what I've built so far is product work in TypeScript: editors, canvases, and the backends behind them. Currently, I'm reading books, research papers, and articles on databases, and trying to build what I learn myself in onyxdb, a SQL database in Rust that uses only the standard library. I only picked up Rust recently, so onyxdb is also me learning Rust the slow way.",
  "I contribute to open-source projects that are in my interests, and I write about what I learn along the way.",
  "Away from that, I'm usually watching cricket or playing it, rebuilding my Hyprland setup for no good reason, or playing sim games to unwind.",
]

export const openTo = "I'm currently open to full-time or contract roles."

/** Reading notes published in database-papers, one per onyxdb layer. */
export const notes = [
  {
    title: "vfs",
    what: "how a database talks to files, and what a crash does to them",
    url: "https://github.com/ppramanik62/database-papers/tree/main/1-vfs",
    reading: false,
  },
  {
    title: "pagefile",
    what: "how a database stores data in fixed-size pages",
    url: "https://github.com/ppramanik62/database-papers/tree/main/2-pagefile",
    reading: false,
  },
  {
    title: "bufpool",
    what: "how a database keeps pages in memory, and when it writes them back",
    url: "https://github.com/ppramanik62/database-papers/tree/main/3-bufpool",
    reading: true,
  },
] as const
