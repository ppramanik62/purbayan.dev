export type ReadingKind = "book" | "paper" | "article"

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

/** What I've read, grouped into sections on /reading. */
export const reading: readonly ReadingSection[] = [
  {
    title: "Databases",
    items: [
      {
        title: "Files are hard",
        url: "https://danluu.com/file-consistency/",
        kind: "article",
        tags: ["vfs", "crash-safety"],
      },
      {
        title: "All File Systems Are Not Created Equal",
        url: "https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-pillai.pdf",
        kind: "paper",
        tags: ["vfs", "crash-safety"],
      },
      {
        title: "Can Applications Recover from fsync Failures?",
        url: "https://www.usenix.org/system/files/atc20-rebello.pdf",
        kind: "paper",
        tags: ["vfs", "fsync"],
      },
      {
        title: "A Painless Guide to CRC Error Detection Algorithms",
        url: "http://www.ross.net/crc/download/crc_v3.txt",
        kind: "article",
        tags: ["checksums"],
      },
      {
        title: "The Internals of PostgreSQL, ch. 8: Buffer Manager",
        url: "https://www.interdb.jp/pg/pgsql08.html",
        kind: "article",
        tags: ["buffer-pool", "postgres"],
      },
      {
        title: "Are You Sure You Want to Use MMAP in Your DBMS?",
        url: "https://db.cs.cmu.edu/papers/2022/cidr2022-p13-crotty.pdf",
        kind: "paper",
        tags: ["buffer-pool", "mmap"],
      },
      {
        title: "The LRU-K Page Replacement Algorithm for Database Disk Buffering",
        url: "https://www.cs.cmu.edu/~christos/courses/721-resources/p297-o_neil.pdf",
        kind: "paper",
        tags: ["buffer-pool", "eviction"],
      },
    ],
  },
]
