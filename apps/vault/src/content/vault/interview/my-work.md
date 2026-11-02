---
title: "My Work"
---

# Purbayan Pramanik: The Complete Interview Prep Reference

Everything you need to recall before walking into any technical interview. Every project, every technology, every contribution, with the _why_ behind each one.

---

## 1. Professional Identity

**Name:** Purbayan Pramanik
**Education:** B.Tech Mechanical Engineering, NIT Durgapur (2022-2026, graduated 2026)
**Location:** Kolkata, West Bengal, India

**Links:**

- GitHub: [ppramanik62](https://github.com/ppramanik62)
- Portfolio: [purbayan.me](https://purbayan.me)
- Email: purbayan.dev@gmail.com
- LinkedIn: [Profile](https://linkedin.com/in/ppramanik62)

### Your Story

You're a Mechanical Engineering student who taught yourself to code. Not from a CS background, not from a coding bootcamp. You got into programming through raw curiosity about how things work under the hood. That curiosity didn't stop at "how do I build a website." It pulled you into systems programming, networking, audio processing, search engines, and distributed systems.

The trajectory matters: you didn't just learn React and call it a day. You went deep. You built a TCP chat server from raw sockets in two languages. You wrote an FFT library from scratch in C. You implemented TF-IDF search without a search library. Then you applied that depth to production work at fiddle-factory and, now, to AI-assisted creative production at SamurAI Studios. Since joining SamurAI in April 2026, you have shipped 57 merged PRs across 4 codebases.

> **Interview Angle:** Lead with the non-CS background. It's a strength, not a weakness. It shows you're self-driven, genuinely curious, and capable of learning anything fast. The breadth of your stack (React to Rust to C to Go) proves you don't just follow tutorials. You understand fundamentals.

---

## 2. Technical Stack (With Justification)

For every technology listed here, you can point to a real project where you used it. Nothing is padding.

### Languages

| Language       | Why You Know It                                                                                                                                 | Where You Used It                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **TypeScript** | Your primary language. Type safety matters when you're building complex UIs and shared codebases.                                               | SamurAI Studios, fiddle-factory, portfolio, Canvas Kit   |
| **Rust**       | You wanted to understand memory management, ownership, and zero-cost abstractions. Rust forces you to think about what your code actually does. | 4at TCP chat server, seroost search engine               |
| **Go**         | Clean concurrency model. You built the same TCP chat in Go to compare goroutines vs OS threads.                                                 | 4at (Go version), snippetbox, proglog, DSA practice      |
| **C**          | The foundation. You wrote a real-time audio visualizer with a custom FFT library. No hand-holding from a runtime.                               | musializer (~670 lines, custom FFT, raylib)              |
| **JavaScript** | The web's lingua franca. You know it deeply because TypeScript is built on it.                                                                  | All web projects, early work                             |
| **Shell**      | You daily-drive Fedora with Hyprland. Comfortable with scripting and dotfiles.                                                                  | Dotfile management, shell scripts                        |
| **Python**     | Used for data pipelines and ML work.                                                                                                            | distributed-log-processing-system, video-sentiment-model |

> **Interview Angle:** When asked "what's your strongest language," say TypeScript for production work, but mention Rust and C to show you understand what happens below the abstraction. Interviewers remember candidates who can talk about memory layout and syscalls.

### Frontend

**React 19**
You're on the latest version. Your portfolio runs React 19 with Vite. Canvas Kit uses React 19 with Next.js. At fiddle-factory, you worked with React 19 across the main app and component libraries.

**Next.js 15**
Canvas Kit uses the App Router. You understand server components, the app directory structure, and Vercel deployment. At fiddle-factory, the dashboard repo also uses Next.js patterns.

**Tailwind CSS 4**
Your go-to for styling. Used in the portfolio, fiddle, and Canvas Kit. At fiddle-factory, you migrated the design-engineer repo from Tailwind v3 to v4 (PR #8), which involved real CSS architecture changes, not just a version bump.

**Radix UI + shadcn/ui**
You didn't just use shadcn components. You set up Storybook for ALL 56 UI primitive components in the shadcn-ui repo (PR #1). You understand the headless UI pattern: Radix provides behavior, you provide styling.

**Framer Motion**
Animations in your portfolio site and Canvas Kit panel animations. You know the declarative animation model, layout animations, and exit animations.

**Zustand**
State management in your portfolio (the `stores/` directory) and fiddle-factory work. You chose Zustand over Redux because it's simpler, doesn't require boilerplate, and works well with React's concurrent features.

**React Router DOM v7**
Routing in your portfolio. At fiddle-factory, you also worked with Remix's routing (which shares DNA with React Router). PR #222 replaced a `window.location.pathname` hack with Remix's `useLoaderData`.

> **Interview Angle:** You can talk about the React ecosystem with nuance. You know _why_ you pick each tool. Zustand over Redux? Less boilerplate, better DX. shadcn over a component library? Ownership of the code, customizable. Tailwind over CSS-in-JS? Build-time, no runtime cost.

### Backend

**Node.js / Express.js**
Your server-side JavaScript runtime. Used for production APIs, document-processing services, media workflows, and backend tooling.

**Raw TCP Sockets**
This is the one that turns heads. In 4at, you built a multi-user chat server from raw TCP sockets. In Rust, that's `std::net::TcpListener` and `std::net::TcpStream`. In Go, it's the `net` package. No HTTP, no WebSocket library, no framework. Just raw bytes over TCP.

**HTTP Server From Scratch**
seroost serves its search UI over HTTP using the `tiny_http` crate. The entire project uses only 3 external crates. You understand what an HTTP server actually does at the protocol level.

> **Interview Angle:** Most candidates say "I know Node.js and Express." You can say "I've built servers from raw TCP sockets in two languages, and I've also built production features on Node.js." That's a different conversation entirely.

### Systems & Low-Level

**TCP Networking (4at)**
You built the same chat server in Rust and Go specifically to compare concurrency models. Rust uses OS threads (`std::thread`), Go uses green threads (goroutines). You can talk about the tradeoffs: OS threads are heavier but map 1:1 to kernel threads; goroutines are lightweight but managed by Go's runtime scheduler.

**FFT / Digital Signal Processing (musializer)**
You wrote a header-only FFT library in C. 256 frequency bins at 44.1kHz sample rate. The visualizer renders the frequency spectrum in real-time using raylib. This isn't "I called an FFT function." You implemented the Cooley-Tukey algorithm.

**TF-IDF Search (seroost)**
You built a search engine from scratch. Tokenization, inverted index construction, TF-IDF scoring. No Elasticsearch, no Lucene, no search library. The entire thing runs locally with only 3 Rust crates (tiny_http for serving, xml for parsing, serde_json for serialization).

**Concurrency Models**
4at is a direct comparison: Rust's `std::thread` (OS threads, explicit Arc/Mutex for shared state) vs Go's goroutines (green threads, channels for communication). You understand both models and their tradeoffs.

**Audio Processing (musializer)**
Real-time frequency spectrum visualization. You read raw audio samples, apply FFT, map frequency bins to visual bars, and render at interactive frame rates. All in C, all from scratch.

> **Interview Angle:** This section is your differentiator. When someone asks "tell me about a challenging project," talk about musializer or seroost. These show you can work without frameworks, understand algorithms, and build from first principles.

### Databases

| Database       | Context                                       |
| -------------- | --------------------------------------------- |
| **PostgreSQL** | Production database work                      |
| **MongoDB**    | Document store experience                     |
| **Supabase**   | Used at fiddle-factory (Postgres-backed BaaS) |
| **Firebase**   | Real-time database experience                 |

### DevTools & Infrastructure

| Tool                       | How You Use It                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Git**                    | Daily driver. 57 merged PRs at SamurAI across 4 codebases, plus 48+ PRs at fiddle-factory.                             |
| **Docker**                 | Containerization for development and deployment                                                                        |
| **Linux**                  | Daily driver. Fedora with Hyprland (tiling Wayland compositor). Built mdt — a terminal markdown viewer/editor in Rust. |
| **Zed / Neovim / VS Code** | You use multiple editors. Zed for speed, Neovim for terminal work, VS Code when needed.                                |
| **Bun**                    | Fast JS runtime/bundler. Used in projects.                                                                             |
| **Vercel**                 | Deployment platform. Canvas Kit lives at canvas-kit.vercel.app.                                                        |
| **Postman**                | API testing and development                                                                                            |

> **Interview Angle:** The Linux daily-driver detail matters. It signals you're comfortable in the terminal, you understand the OS, and you're not afraid of configuration. mdt (your markdown viewer/editor) proves it.

---

## 3. Professional Experience at SamurAI Studios

### Software Engineer (Apr 2026 to Present, Remote)

You build production systems for AI-assisted film and advertising workflows. The work spans creative-document ingestion, structured brief extraction, multi-scene storyboards, image and video generation, production frontend/backend, operator tooling, testing, and CI.

Verified GitHub record as of July 6, 2026: **73 PRs authored, 57 merged, across 4 private codebases**.

The complete contribution record, architecture stories, chronological audit, and interview answers are in [SamurAI Contributions](./samurai-contributions).

Key themes:

- Built a story-first creative-brief pipeline for presentation decks, including media extraction, visual captioning, typed schemas, provider abstractions, golden evaluations, and an authenticated operator console.
- Delivered scene-owned storyboard workspaces across the data model, REST APIs, version history, compatibility layer, frontend routes, and regression tests.
- Integrated multi-provider image/video generation with continuity prompts, run monitoring, usage logging, and real-time synchronization.
- Improved media delivery with explicit image roles, WebP previews, preview-aware rendering, and responsive galleries.
- Modernized the product UI with shared compound components, Tailwind CSS v4 design tokens, loading states, and optimistic updates.

> **Interview Angle:** Lead with the multi-scene storyboard architecture for end-to-end ownership, or the creative-brief parser for AI pipeline design and observability. Both stories cross product, backend, frontend, tests, and operations.

---

## 4. Earlier Experience at fiddle-factory

### Role 1: Software Engineer Contractor (Dec 2025 to Apr 2026, Remote)

You work across 6 repositories: **fiddle** (main app), **shadcn-ui**, **eleven-labs-ui**, **design-engineer**, **dashboard**, **repo-build-server**.

This isn't a single-repo internship. You context-switch between frontend components, build infrastructure, auth flows, and canvas rendering systems.

---

#### 3.1 Canvas Rendering System

The core product at fiddle-factory involves a canvas-based editor (built on tldraw). You've shipped significant features here.

**Theme/Mode Switching (PR #241)**
Added theming controls to the preview toolbar. The tricky part: dynamically extracting color themes from repos at runtime. Not hardcoded themes, but pulling actual theme data from the codebase being previewed.

**Auto-Pan to New Shapes (PR #201)**
When a user creates a shape that's off-screen, the canvas now automatically pans to show it. You built a reusable `zoomToNewSelection` utility that other features can hook into.

**Visual Component Grid (PR #236)**
Replaced a text-only MentionMenu with a visual grid showing component thumbnails. This changed the UX from "type and hope you remember the name" to "browse and pick visually."

**Element Inspector**
Canvas inspection tools for debugging and interacting with elements on the canvas.

**Canvas Loading Bug Fixes (PR #246, #259)**
This was a real debugging challenge. New users saw broken canvas states. Root cause: tldraw's `onMount` callback was firing before `projectData` had loaded (cold React Query cache on first visit). Your fix deferred hydration until the data was actually available. Classic race condition, but in a React + tldraw + React Query context.

> **Interview Angle:** The canvas loading bug is a great "tell me about a bug you fixed" story. It touches React lifecycle, third-party library internals (tldraw), caching (React Query), and race conditions. Walk through your debugging process: how you identified the cold cache issue, why it only affected new users, and how deferring hydration solved it cleanly.

---

#### 3.2 Chat Features

**Slash Command Menu (PR #167)**
Added a command menu to the chat input. Type `/` and get a list of available commands. Standard UX pattern, but you built it from scratch within the existing chat architecture.

**Clear Chat (PR #170)**
Sounds simple. Wasn't. Clearing chat means: delete all messages except the starter message, clear editor configurations, and reset the UI state. Multiple systems to coordinate.

**Claude Health Checks (PR #234)**
Built a `/api/health/claude` endpoint for pre-flight availability checks. Before sending a message to Claude, the app now checks if the API is reachable. You also created shared Anthropic error handling utilities so error responses are consistent across the codebase.

**Message Send Performance (PR #227)**
Made message-sending operations non-blocking and added caching to reduce latency. Users were waiting for operations that didn't need to block the UI.

**Clipboard Handling Fix (PR #218)**
Copy wasn't working after users interacted with an iframe. The iframe was stealing focus, which broke the clipboard API. You fixed the focus management and also cleaned up the copied text formatting.

> **Interview Angle:** The performance PR (#227) is good for "how do you approach optimization" questions. You identified blocking operations, made them async, and added caching. Concrete, measurable improvement.

---

#### 3.3 Storybook Infrastructure (Across 4 Repos)

You set up and maintained Storybook across the entire fiddle-factory ecosystem. This isn't "I wrote a few stories." You built the infrastructure.

**shadcn-ui (PR #1)**
Configured Storybook 9 with Tailwind v4, path aliases, and a next-themes mock. Then wrote stories for ALL 56 UI primitive components. Every single one. This gives the team a visual catalog of every component with its variants and states.

**eleven-labs-ui (PR #6)**
Fixed theme styling and background tokens so components rendered correctly in Storybook.

**design-engineer (PR #8)**
Migrated CSS from Tailwind v3 to v4. Fixed type errors in Storybook files. This was a real migration, not a find-and-replace.

**fiddle (PR #237)**
Fixed QueryClient and data-fetching issues in stories. Components that depended on server data needed proper mocking to render in Storybook.

**Content Readiness Detection (PR #184)**
Built a MutationObserver-based system to detect when Storybook content is fully rendered. This matters for screenshot automation: you can't screenshot a component that's still loading.

> **Interview Angle:** Storybook work shows you think about developer experience, not just features. You can talk about component-driven development, visual testing, and how a shared component library scales across repos.

---

#### 3.4 Build Pipeline

**Storycap Screenshot System (PR #185)**
Simplified the screenshot pipeline. The previous approach used complex runtime iframe capture. You replaced it with Storycap screenshots from static Storybook builds. Simpler, more reliable, faster.

**Post-Commit Build Triggers (PR #178)**
Automated builds triggered by commits. Push code, builds run.

**Ripgrep-Powered Search (PR #171)**
Added ripgrep as the search backend with auto-detection. If ripgrep is available, use it (fast, JSON output). If not, fall back to grep. Graceful degradation.

**Build Queue (PR #25, repo-build-server)**
Built a sequential in-memory build queue for Storybook jobs. Prevents multiple builds from stomping on each other. Simple but necessary infrastructure.

> **Interview Angle:** Build pipeline work shows you understand the full development lifecycle. You're not just writing features; you're making the team faster. The Storycap simplification is a good "I reduced complexity" story.

---

#### 3.5 Access Control & Auth

**Allowlist with User Types (PR #204)**
Implemented user type distinctions and template restrictions. Different users see different things.

**PKCE Auth Flow (PR #3, dashboard)**
Set up PKCE (Proof Key for Code Exchange) authentication for the dashboard. PKCE is the OAuth 2.0 extension for public clients. You can explain why it exists: public clients can't keep a client secret, so PKCE uses a code verifier/challenge pair instead.

**Email Verification Before Magic Link (PR #7, dashboard)**
Added an email verification step before sending magic links. Security improvement: verify the email is real before granting access.

> **Interview Angle:** Auth work is always relevant in interviews. You can talk about PKCE specifically, why magic links need verification, and how allowlists work in a multi-tenant system.

---

#### 3.6 Bug Fixes (15+)

These aren't throwaway fixes. Each one required understanding the codebase deeply.

| PR       | What You Fixed                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------- |
| **#243** | Migrated toast notifications from react-toastify to sonner. Full library swap.                 |
| **#189** | ESLint react-hooks cleanup. Fixed dependency arrays and hook usage patterns.                   |
| **#191** | Double-submission prevention on chat and login forms. Added proper debouncing/disabling.       |
| **#222** | Replaced `window.location.pathname` hack with Remix's `useLoaderData`. Proper framework usage. |
| **#196** | Z-index popover fix. Layering issues in complex UIs.                                           |
| **#216** | Zoom control in preview iframes. Forwarded zoom gestures from the iframe to the tldraw canvas. |
| **#265** | Delete project TypeError. Three separate bugs in one PR.                                       |
| **#274** | Auto-recreate sandbox on timeout. Restored 2-hour sandbox timeout handling that had broken.    |
| **#258** | Made gen-editor panel scrollable. Overflow issue.                                              |

> **Interview Angle:** PR #265 (three bugs in one PR) and PR #246/#259 (canvas loading race condition) are your best bug-fix stories. They show systematic debugging, not just "I changed a line."

---

### Role 2: Software Engineer Intern (May 2025 to Aug 2025, Remote)

#### Canvas Migration: react-flow to tldraw

You ripped out the previous canvas implementation (react-flow) and replaced it with tldraw. This meant: removing old node components, building custom tldraw shapes, creating new tools, building preview components, and writing data conversion utilities to migrate existing canvas data.

#### Cloud Sandbox Migration: StackBlitz WebContainers to e2b

Migrated the cloud execution environment from StackBlitz's WebContainers (browser-based) to e2b (cloud-based sandboxes). You set up custom templates, API configuration, and sandbox session management. You also documented the new environment for the team.

#### Figma-to-Code Plugin

Built a codegen pipeline that takes Figma designs and generates code. Supports multi-frame export. Integrated tweakpane for a configuration UI within the plugin.

#### User Onboarding Flow

Built an interactive onboarding checklist with task tooltips and progress tracking. First-time user experience.

#### "Make Real" Feature

An API route that takes canvas drawings and sends them as chat attachments. The user draws something, and the AI interprets it. You built the API route, defined the response shapes, and handled the canvas-to-chat data flow.

> **Interview Angle:** The internship shows growth. You started with migrations (learning the codebase) and progressed to building new features (Figma plugin, Make Real). The react-flow to tldraw migration is a great "I handled a major refactor" story.

---

## 5. Open Source Contributions

### Apache ECharts (65,000+ stars)

**PR #21325 (MERGED): fix(candlestick): fix candlestick render error with series.encode**
You fixed a rendering bug in the candlestick chart when using `series.encode`. This is a major charting library used across the industry. Your fix was reviewed, approved, and merged.

**PR #21314 (OPEN): fix: tooltip formatter callback for connected charts (close #21307)**
Fixing tooltip behavior when charts are connected (linked interactions across multiple chart instances).

### fiddle-factory Ecosystem

48+ PRs across 6 repositories, as detailed in the fiddle-factory section.

> **Interview Angle:** Contributing to a 65k-star Apache project is significant. You can talk about the process: reading the codebase, understanding the rendering pipeline, writing a fix that doesn't break other chart types, and going through code review with maintainers. This shows you can work in large, unfamiliar codebases.

---

## 6. Personal Projects (Quick Recall)

**mdt** | Rust
Fast, terminal-based markdown viewer and editor. File tree, rendered preview with syntax highlighting, vim-style editor, live split-pane preview. Published on crates.io as mdtui.

**Canvas Kit** | Next.js 15, React 19, Canvas API | [canvas-kit.vercel.app](https://canvas-kit.vercel.app)
Drawing app with a layer system. You wrote a technical blog post about building retained-mode layers on top of Canvas API's immediate-mode rendering. This project has depth.

**4at** | Rust + Go
TCP chat server from raw sockets. No frameworks, no HTTP, no WebSocket. Built in both Rust and Go to compare OS threads vs goroutines. This is your "I understand networking at the protocol level" project.

**seroost** | Rust (3 crates only)
Local TF-IDF search engine. Custom tokenizer, inverted index, TF-IDF scoring. Serves results over HTTP using tiny_http. The constraint of only 3 external crates forced you to build everything yourself.

**musializer** | C (~670 lines)
Real-time FFT audio visualizer. Custom header-only FFT library (Cooley-Tukey algorithm). 256 frequency bins at 44.1kHz. Renders with raylib. This is your "I can write C and understand DSP" project.

**harmony** | TypeScript
Real-time music room sharing app. Collaborative listening experience.

**better-auth-ts** | TypeScript
Auth system built with Next.js, Prisma, and Better Auth. Full authentication flow.

**snippetbox** | Go
Secure text snippet sharing application. Server-side Go web development.

**proglog** | Go
Distributed log system. You understand distributed systems concepts.

**ad-my-brand-insights** | TypeScript
Analytics dashboard for digital marketing. Data visualization and business logic.

**portfolio (purbayan.me)** | React 19, Vite, Zustand
Your developer portfolio. Tokyo Night theme. Has a terminal easter egg. State managed with Zustand stores.

> **Interview Angle:** Don't list all projects. Pick 2-3 based on the role. Systems role? Lead with 4at and musializer. Frontend role? Lead with Canvas Kit and the fiddle-factory work. Full-stack? Lead with fiddle-factory and seroost.

---

## 7. Blog / Technical Writing

### "Layers on an Immediate-Mode Canvas"

A deep technical writeup about building a retained-mode layer system on top of Canvas API's immediate-mode rendering.

**What it covers:**

- The fundamental tension between immediate-mode (Canvas API redraws everything each frame) and retained-mode (objects persist and can be manipulated individually)
- Offscreen buffers for per-layer rendering
- Compositing layers in the correct order
- Undo/redo with a per-layer command pattern
- Responsive canvas resizing without losing content

This isn't a tutorial. It's a technical deep-dive into an architectural problem you solved in Canvas Kit.

> **Interview Angle:** Mention this when asked about technical communication. You don't just build things; you write about the hard parts. The immediate-mode vs retained-mode distinction is a great conversation starter with anyone who's worked with graphics.

---

## 8. What Makes This Profile Unique (Interview Talking Points)

### 1. Non-CS Background

You're a Mechanical Engineering student who taught yourself everything. This isn't a weakness. It means you learn fast, you're genuinely curious, and you don't need a curriculum to pick up new skills. Every technology on your resume, you chose to learn.

### 2. Depth Across the Stack

Frontend (React 19, Next.js 15), backend (Node.js, Go), systems (Rust, C), infrastructure (Shell, Docker, Linux). Most candidates are deep in one area. You're deep in several. And you can prove it with projects at each level.

### 3. From-Scratch Builder

You didn't just use frameworks. You built things from first principles:

- TCP server from raw sockets (no HTTP library)
- Search engine without a search library (custom TF-IDF)
- FFT from the math (Cooley-Tukey algorithm in C)
- Layer system on immediate-mode canvas (custom architecture)

This signals that you understand what frameworks do for you, because you've done it without them.

### 4. Real Production Experience

57 merged PRs at SamurAI across 4 codebases, plus 48+ PRs at fiddle-factory. Your production work spans AI pipelines, frontend, backend, tests, CI, canvas rendering, auth, and developer infrastructure.

### 5. Open Source at Scale

Contributing to Apache ECharts (65k stars) means you can navigate large codebases, understand complex rendering pipelines, and work through rigorous code review processes.

### 6. Technical Writer

The Canvas architecture blog post shows you can explain complex ideas clearly. This matters in teams.

> **Interview Angle (The 30-Second Pitch):**
> "I'm a software engineer at SamurAI Studios, where I build full-stack systems for AI-assisted creative production. I've shipped 57 merged PRs across four codebases covering document intelligence, storyboards, media generation, frontend, backend, tests, and CI. Before that, I worked at fiddle-factory on canvas rendering, build pipelines, auth, and component infrastructure. My systems projects in Rust and C help me reason below the framework layer, and I pick up new technologies quickly because I focus on fundamentals, not just APIs."

---

_Last updated: July 2026_
