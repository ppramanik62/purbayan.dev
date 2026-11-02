# purbayan.me

My personal site, kept like a paper notebook: projects, experience, writing, reading and open source.

## stack

- React 19, TypeScript, Vite, React Router
- Tailwind CSS 4
- Newsreader and Spline Sans Mono

## run locally

```sh
bun install
bun dev
```

## build

```sh
bun run build
bun preview
```

The build also writes `dist/writing/<slug>.html` for every post, so link previews show the post's title and thumbnail.

## content

Everything the site says lives in `src/data/`.

Projects, open-source PRs, the contribution heatmap and the avatar come from GitHub. A daily workflow refreshes them; to do it by hand, run `bun run sync:github` (needs `gh` logged in).

Posts live in `src/content/blog/*.md`. The filename becomes the slug:

```md
---
title: "Post title"
date: "2026-06-21"
tags: ["tag"]
summary: "Short description."
readingTime: "4 min read"
---
```

Run `bun run og:posts` to draw its thumbnail. Sidenotes are `[^id]` in the text and `[^id]: the note` on its own line.

## deployment

Cloudflare Pages. Paths without a file fall back to `index.html` through Pages' single-page-app mode, so there is no `_redirects` catch-all and no `404.html`; either would hide the prerendered posts.

## license

MIT
