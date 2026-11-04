/**
 * Draws a 2400×1260 thumbnail for each blog post at public/og/<slug>.png, in the
 * notebook style. Posts that already have one are skipped; pass --force to redraw.
 *
 *   bun run og:posts
 *
 * Needs Chromium or Chrome on PATH (set CHROME to point at another binary).
 */
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readPosts } from "./posts"

const root = join(import.meta.dir, "..")
const outDir = join(root, "public/og")
const force = process.argv.includes("--force")

const fonts = (pkg: string) => join(root, "node_modules/@fontsource-variable", pkg, "files")
const serif = fonts("newsreader")
const mono = fonts("spline-sans-mono")

function chrome(): string {
  const candidates = [
    process.env.CHROME,
    "chromium",
    "chromium-browser",
    "google-chrome",
    "google-chrome-stable",
  ]
  for (const bin of candidates) {
    if (bin && Bun.which(bin)) return bin
  }
  throw new Error("No Chromium or Chrome found. Set CHROME to its path.")
}

const escape = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function page(title: string, meta: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:N;font-style:italic;font-weight:200 800;src:url(file://${serif}/newsreader-latin-opsz-italic.woff2)}
@font-face{font-family:M;font-weight:300 700;src:url(file://${mono}/spline-sans-mono-latin-wght-normal.woff2)}
html,body{margin:0;width:1200px;height:630px;background:#f3eee3;overflow:hidden}
body{position:relative;color:#24211c}
.rule{position:absolute;top:0;bottom:0;left:150px;width:2px;background:rgba(180,67,47,.38)}
.line{position:absolute;left:0;right:0;height:1px;background:#ddd4c2}
.meta{position:absolute;left:200px;top:38px;font:22px M;color:#b4432f}
h1{position:absolute;left:200px;right:90px;top:50%;transform:translateY(-50%);margin:0;font:italic 500 76px/1.08 N;letter-spacing:-.01em;text-wrap:pretty}
.url{position:absolute;left:200px;bottom:40px;font:22px M;color:#8a8170}
</style></head><body>
<div class="line" style="top:92px"></div><div class="line" style="bottom:92px"></div><div class="rule"></div>
<div class="meta">${escape(meta)}</div>
<h1>${escape(title)}</h1>
<div class="url">purbayan.me</div>
</body></html>`
}

mkdirSync(outDir, { recursive: true })
const work = mkdtempSync(join(tmpdir(), "og-posts-"))
const bin = chrome()
let drawn = 0

for (const post of readPosts()) {
  const out = join(outDir, `${post.slug}.png`)
  if (existsSync(out) && !force) continue

  const html = join(work, `${post.slug}.html`)
  writeFileSync(html, page(post.title, `${shortDate(post.date)} · ${post.readingTime}`))

  const run = Bun.spawnSync([
    bin,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--force-device-scale-factor=2",
    "--virtual-time-budget=4000",
    "--window-size=1200,630",
    `--screenshot=${out}`,
    `file://${html}`,
  ])
  if (!existsSync(out)) throw new Error(`${post.slug}: ${run.stderr.toString()}`)
  drawn++
}

console.log(`drew ${drawn} post thumbnail${drawn === 1 ? "" : "s"}`)
