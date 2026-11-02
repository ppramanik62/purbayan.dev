# purbayan.me

My personal site, kept like a paper notebook: projects, experience, writing, reading and open source.

Live at [purbayan.me](https://purbayan.me). The code is in [`apps/web`](apps/web).

## stack

- React 19, TypeScript, Vite, React Router
- Tailwind CSS 4
- Newsreader and Spline Sans Mono
- Cloudflare Pages

## run locally

Needs [Bun](https://bun.sh).

```sh
bun install
bun run dev:web
```

## build

```sh
bun run build:web
```

The build also writes a page per post, so link previews show the post's title and thumbnail.

## content

Everything the site says lives in `apps/web/src/data/`. Posts are Markdown in `apps/web/src/content/blog/`.

Projects, open-source pull requests and the contribution heatmap come from GitHub. A daily workflow (`.github/workflows/sync-github.yml`) refreshes them and commits only when something changed.

More in [`apps/web/README.md`](apps/web/README.md).
