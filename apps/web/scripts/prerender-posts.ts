/**
 * Runs after `vite build`. Writes dist/writing/<slug>.html for each post: the
 * same app shell, with that post's title, description and thumbnail in the
 * preview tags. Link-preview crawlers don't run JavaScript, so this is the only
 * way X, LinkedIn and Slack see the post instead of the site.
 *
 * Cloudflare Pages serves /writing/<slug> from that file. Every other path falls
 * back to index.html through Pages' single-page-app mode, so there must be no
 * catch-all rule in public/_redirects and no top-level 404.html.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { readPosts } from "./posts"

const SITE = "https://purbayan.me"
const dist = join(import.meta.dir, "../dist")
const shell = readFileSync(join(dist, "index.html"), "utf8")

const attr = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

/** Sets the content of one <meta> tag, failing loudly if index.html no longer has it. */
function setMeta(html: string, key: "name" | "property", id: string, value: string) {
  const pattern = new RegExp(`(<meta\\s+${key}="${id}"\\s+content=")[^"]*(")`)
  const multiline = new RegExp(`(<meta\\s+${key}="${id}"\\s*\\n\\s*content=")[^"]*(")`)
  const re = pattern.test(html) ? pattern : multiline
  if (!re.test(html)) throw new Error(`index.html has no <meta ${key}="${id}">`)
  return html.replace(re, `$1${attr(value)}$2`)
}

mkdirSync(join(dist, "writing"), { recursive: true })

for (const post of readPosts()) {
  const url = `${SITE}/writing/${post.slug}`
  const image = `${SITE}/og/${post.slug}.png`
  const title = `${post.title} — Purbayan Pramanik`

  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`)
  html = setMeta(html, "name", "description", post.summary)
  html = setMeta(html, "property", "og:type", "article")
  html = setMeta(html, "property", "og:title", post.title)
  html = setMeta(html, "property", "og:description", post.summary)
  html = setMeta(html, "property", "og:url", url)
  html = setMeta(html, "property", "og:image", image)
  html = setMeta(html, "property", "og:image:alt", post.title)
  html = setMeta(html, "name", "twitter:title", post.title)
  html = setMeta(html, "name", "twitter:description", post.summary)
  html = setMeta(html, "name", "twitter:image", image)
  html = setMeta(html, "name", "twitter:image:alt", post.title)

  writeFileSync(join(dist, "writing", `${post.slug}.html`), html)
}

console.log(`prerendered ${readPosts().length} post previews`)
