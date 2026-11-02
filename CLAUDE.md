# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

Bun workspaces with two apps:

- `apps/web` — Main portfolio (React 19 + Vite + TypeScript)
- `apps/vault` — Knowledge base (Astro 5 + Markdown content)

## Commands

All commands run from repo root unless noted.

```bash
# Install dependencies
bun install

# Development
bun run dev:web       # React portfolio on localhost
bun run dev:vault     # Astro vault on localhost

# Build
bun run build:web     # Typecheck then vite build
bun run build:vault   # Astro build

# Linting / Formatting (runs automatically on commit via lint-staged)
bunx oxlint           # Lint TS/JS
bunx oxfmt            # Format all files
```

From within an app directory:

```bash
cd apps/web && bun run typecheck   # Type-check only
cd apps/vault && bun run preview   # Preview production build
```

## Tooling

- **Formatter:** oxfmt — config in `.oxfmtrc.jsonc` (100 char width, no semis, double quotes, trailing commas, 2-space tabs)
- **Linter:** oxlint
- **Pre-commit:** Husky runs `bunx lint-staged` automatically

## Web App Architecture (`apps/web`)

**Routing:** React Router DOM v7. Routes defined in `src/App.tsx`.

**Data layer:** All content lives as TypeScript files in `src/data/`. No CMS or runtime API calls. The GitHub snapshot (`src/data/github.json`, `public/avatar.png`) is regenerated with `bun run sync:github` from `apps/web`. Post thumbnails come from `bun run og:posts`. A daily workflow (`.github/workflows/sync-github.yml`) runs both. Details in `apps/web/CLAUDE.md`.

**Path alias:** `@` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

**Design:** a paper notebook. `src/components/layout.tsx` draws the dated header, the red margin rule and the footer; pages are built from `Row` (`src/components/notebook.tsx`), a margin note beside the writing.

**Styling:** Tailwind CSS 4. The palette lives as `--c-*` custom properties in `src/index.css` and is exposed through `@theme inline` (`bg-paper`, `text-ink`, `text-dim`, `text-faint`, `border-rule`, `text-pen`, `text-pencil`). Light only. Use `cn()` from `src/lib/utils.ts` for conditional classnames.

## Vault App Architecture (`apps/vault`)

**Content:** Markdown files in `src/content/vault/<category>/<slug>.md`. Each file needs a `title` frontmatter field. The index page automatically groups docs by category directory name.

**Routing:** Astro file-based. `src/pages/[category]/[...slug].astro` handles all doc pages. `src/pages/index.astro` builds the file explorer index.

**Syntax highlighting:** Shiki with `tokyo-night` theme (configured in `astro.config.mjs`).

## Design Conventions

- **Theme:** `apps/web` is a light paper notebook. `apps/vault` is still on Tokyo Night and has not been migrated yet. The two intentionally diverge for now.
- **Typography:** Newsreader (body, `font-serif`) and Spline Sans Mono (margin notes, `font-mono`), self-hosted via `@fontsource-variable`. Code blocks use the system monospace.
- **Motion:** CSS transitions only. The global `prefers-reduced-motion` rule in `index.css` covers them.
- **No new dependencies** without good reason — the stack is intentionally lean
