---
title: "AI Interview: Resume Q&A"
---

# AI interview: resume question tree

Built for a Mercor-style AI screen, works for any resume-driven interview. Every question here
comes from a line on my resume — if it's not on the resume, it's not here, because the
interviewer never sees it.

Covers: StashBase, SamurAI Studios, fiddle-factory (contractor), fiddle-factory (intern), the
skills block, trove/cn, and a B.Tech in Mechanical Engineering from NIT Durgapur.

---

## How the screen works

20–30 minutes of video with an AI interviewer that's already parsed my resume. No human watches
live, a transcript gets scored against a rubric.

It adapts, and the ramp only goes one way. The first two or three answers set a baseline —
strong answers pull the next question deeper, weak ones keep it shallow and cap the score.
Recovering late is harder than starting well.

It punishes silence too. Long pauses read as a pacing problem, so I think out loud instead of
thinking quietly.

What it's really testing: whether the person who wrote this resume and the person answering are
the same person. Every bullet is a claim, and a follow-up is the cheapest way to check it — do I
own the decision, can I explain the mechanism one level below the bullet, do I know what it cost.

"You said 56 primitives, what was in them?" isn't a trick, it's just testing whether a number is
real. Any number I say has to have a real breakdown behind it, not just a metric I threw out to
sound thorough.

---

## Resume audit

What each line invites, before the questions themselves. Green means I can go three questions
deep without effort. Amber means it needs rehearsal.

| Resume line                                           | Risk  | Why                                                               |
| ----------------------------------------------------- | ----- | ----------------------------------------------------------------- |
| Milkdown Crepe editor, without losing source fidelity | Amber | strong claim, need one concrete hard example                      |
| Sanitized rendering, Quick Open, command palette      | Green | specifics live in the answer                                      |
| Inline review of Agent edits, turn snapshot           | Amber | newest work, "why the host and not the adapter" is the probe      |
| Shared Agent Contract, parity tests                   | Amber | best architecture story, most probeable                           |
| Playwright E2E, cross-platform CI                     | Amber | "how do you stop visual tests being flaky" has a real answer      |
| Creative-brief pipeline, golden evaluations           | Amber | "golden evaluations" is jargon, be ready to define it             |
| Multi-scene storyboards, migration                    | Green | clean end-to-end story                                            |
| Multi-provider generation                             | Amber | naming providers means naming how they differ                     |
| Shared primitives, image format optimization          | Green | roles and format live in the answer                               |
| Canvas hydration race, Storybook, PKCE                | Green | three solid stories, know the details                             |
| Auto-pan, component picker, repo-driven themes        | Amber | small features, know how the theme gets out of the repo           |
| Storycap screenshots of static builds                 | Green | clean "I removed complexity" story                                |
| react-flow to tldraw migration                        | Green | best story on the resume, follow-up is always the data conversion |
| StackBlitz to e2b                                     | Green | clean tradeoff, real constraint                                   |
| Languages (TS, JS)                                    | Green | strong everywhere, expect a type-system question                  |
| trove/cn                                              | Green | mine end to end, recent                                           |
| B.Tech Mechanical Engineering                         | Amber | always asked, needs a confident answer, not an apology            |

---

## Opening ninety seconds

Highest-value answer in the session, because the ramp only goes one way.

> I'm a frontend-leaning full-stack engineer, mostly TypeScript and React. The thread through my
> work is building difficult interactive surfaces — canvases, editors, agent panels. At fiddle,
> an AI component design tool, I migrated the drawing canvas from react-flow to tldraw and later
> traced a hydration race that left every new user with a blank canvas. At SamurAI Studios I
> rebuilt storyboards from project-owned to scene-owned, data model through to the workspace,
> without breaking existing projects. Right now I contribute to StashBase, a local-first
> knowledge base, where I own the Markdown editor and wrote the contract that lets Claude and
> Codex sit behind one interface. I also maintain trove/cn, a registry of copyable React
> components.

Four hooks in there — tldraw migration, hydration race, storyboard schema, agent contract —
every one a place I can go three questions deep.

---

## StashBase

### What do I own in StashBase?

It's a local-first Electron app that turns files on disk into searchable context for AI coding
agents. Notes stay on the machine, the app indexes them, agents reach them over MCP.

I own three areas:

- The Markdown editor — a live editing surface, not a split pane.
- The agent panel — Claude and Codex both run behind one interface.
- Where the two meet — reviewing what the Agent changed in a document, and pointing the Agent
  at a passage.

I also landed some large renderer refactors, but they're not on the resume. The volume there was
mostly agent-driven, and I won't claim a 1,600-file diff as my own work.

**Local-first, why?**

Nothing leaves the machine unless the user sends it. That's the product promise, and it
constrains engineering — no server to hold state, so the Electron main process owns the
filesystem and the renderer owns nothing durable. It also means the agent adapters use whatever's
installed locally rather than calling a hosted API.

**Why a desktop app?**

It needs real filesystem access and it needs to launch local agent binaries. Neither is possible
in a browser tab.

### Walk me through the Milkdown Crepe editor — what does "without losing source fidelity" mean?

Crepe is Milkdown's batteries-included editor, similar in feel to Notion — it renders Markdown
as formatted content you type directly into, so there's no separate preview pane. The document
you see is the document.

The catch: underneath, it's a ProseMirror document, not text. Every Markdown construct has to
survive a round trip — parse into nodes, edit as nodes, serialise back to Markdown that's
byte-comparable to what a plain text editor would produce. Source fidelity means that round trip
doesn't quietly rewrite your file. The ones that actually broke: links, code fences, lists,
blockquotes, paste, and Find.

**Which one was hardest?**

Lists and blockquotes on exit. You're inside a list item, press Enter twice — the editor has to
decide whether you're adding an item, exiting a nesting level, or leaving the list. Get it wrong
and the serialiser emits different indentation than the file had. I shipped it as its own change,
because the behaviour is small but the blast radius is every list in the library.

**Why does paste matter?**

Paste is where two representations collide. Copying inside the editor copies ProseMirror nodes,
copying from a browser brings HTML, copying from a terminal brings plain text. Accept the HTML
path naively and you inherit whatever markup the source page had — a rendering problem and a
security one. Same reason the rendering bullet says sanitized HTML.

**And Find?**

In a virtualised, node-based editor the match might not be mounted. Find has to locate the match
in the document, then scroll the actual rendered position into view — I shipped the
scroll-into-view part separately from the matching.

### Hardened Markdown rendering — against what?

Against untrusted input, mostly. A knowledge base renders files the user didn't necessarily write
— anything an agent generated, anything pasted from the web. Markdown allows raw HTML, so
rendering it directly means script injection inside an Electron renderer, worse than a browser
tab. HTML goes through sanitisation before it renders. Beyond that, hardening meant using
package-native implementations for footnotes and heading anchors instead of the hand-rolled ones
that were there.

**What's "hidden frontmatter"?**

YAML metadata at the top of the file. Real, part of the document, but not prose — a reader
shouldn't see it as a code block on every note. It stays in the file and doesn't render.
Stripping it would lose data; rendering it makes every note ugly.

**Outline and Quick Open?**

Quick Open is navigation across files, the outline is navigation inside one. I moved the outline
into the Files sidebar rather than giving it its own panel — one place to go find things.

### Inline review of Agent edits — how does it work?

Two pieces, shipped a couple of weeks apart.

First, `suggest_edits`. The Agent sends a whole revised document instead of writing the file.
The host keeps the proposal in memory, scoped to the caller's project, and the editor shows it
as tracked insertions and deletions. The reader accepts or rejects each change. Accepted text
goes through the normal versioned save, and rejected text never touches disk.

Then a user told us they couldn't find it. The diff only appeared when the Agent chose to call
that tool, and nothing in the product said so. So we flipped the default: Agents write directly,
and after any turn that changed Markdown the chat shows a "Changed in this turn" card. Review
opens the document with that turn's changes marked, each with Keep or Undo.

**Why track changes in the host instead of in each adapter?**

Every runtime passes through one place, the socket the host attaches to a folder. When a prompt
arrives, the host holds it until it has a snapshot of the folder's Markdown, and at turn end it
rescans and diffs. Claude, Codex, and OpenCode all go through that, and so do shell writes like
`sed`, which no adapter would ever see as an edit. Putting it in the adapters would have meant
three implementations that still missed the shell.

**How did you reuse the review UI?**

I reversed it. The editor holds the file the turn left behind, and the "proposal" is the text
from before the turn. Undo restores old text through the same versioned save, Keep all leaves
the file byte-identical, and the colours are swapped so additions still read as additions.

**What if the file changed after the turn?**

The existing version check refuses it, and the card says so in one sentence. Same for an expired
record or changed frontmatter. Records live in memory with per-folder and age limits, so
"expired" is a real state the UI has to handle.

### Ask Agent and citations — not on the resume, but if they ask about agent UX

Selecting text in a document offers Ask Agent. It binds the exact selection as a passage chip in
the composer, and the words travel in the prompt, so editing the document later can't change
what was asked about.

Going the other way, the Agent is told to cite as `path#:~:text=phrase`. Clicking the link opens
the file and runs Find for the phrase, or says the file no longer contains it.

**Anything surprising?**

A real end-to-end turn turned up an old bug: OpenCode streams the user's prompt back as if it
were a reply, so Default chats showed your own message twice. I only found it because I drove a
real turn instead of trusting the unit tests.

### Explain the Shared Agent Contract

StashBase drives more than one coding agent. Claude Code and Codex run as local processes with
different protocols, session models, permission systems, and different ideas about what deleting
a chat means. Before the contract, the app knew about both in the UI layer, so every feature had
two code paths. The contract is one interface both runtimes implement — start a session, stream
deltas, expose skills, apply an access mode, delete a chat. The panel talks to the contract, not
to a specific runtime.

**What did you leave out of the interface?**

Anything only one of them can do. Widen the interface to fit every Codex capability and the
Claude adapter grows methods that throw, and callers start branching on runtime again — the
abstraction's bought nothing. So the contract holds what both can honour, and runtime-specific
things are exposed as capabilities the panel can query rather than methods it can call blindly.

**What are parity tests, why do you need them?**

A shared test suite that runs against both adapters and asserts they behave the same. Without
it, the contract's just a comment — adapters drift the moment someone fixes a bug in one and not
the other, invisibly, because each adapter's own tests still pass. The parity suite is what
catches that. Wired into CI, colocated with the adapters.

**Where did the adapters actually diverge?**

Deletion and access. Codex needed chats permanently deleted rather than marked, and access-mode
validation was implemented twice with slightly different rules, so I pulled it into the shared
layer.

**A runtime that's not installed?**

Don't silently fail. If a built-in runtime is unavailable, the panel says which one and how to
install it. An agent panel that just shows nothing is the worst outcome — the user can't tell if
it's broken or empty.

### The Playwright suite — how do you keep Electron E2E from being flaky?

Every spec launches a real Electron app through a dedicated entry file against a disposable
fixture directory, so a test never touches actual folders. Two things drove most of the early
flake — launch readiness (the window exists before the app's usable, so tests need an explicit
readiness signal, not a wait) and port release (the next test starts before the previous app's
let go, so shutdown had to be serialised).

**Visual baselines aren't permanently flaky?**

Only if you let CI regenerate them. Projects are split into smoke, functional, and visual; visual
baselines are reviewed and committed per platform, refreshed through a manual workflow. A
baseline that updates itself isn't a test — the tradeoff is reviewing modified baselines every
time a legitimate visual change lands.

**How do you test the agent panel if it spawns a real agent?**

You don't spawn a real one. There's a deterministic fake that speaks the Codex app-server
protocol, so the panel exercises the real code path against a scripted peer.

### Your name is on huge renderer refactors — what was your part?

Be straight about it. I opened and landed them, including the one that replaced the renderer
with a layered frontend, but the code volume was mostly agent-driven. What I can speak to is the
problem and the rule, not every file.

The problem: the directory layout implied layers (app on features on store on common), but
nothing enforced them, so lower layers imported back upward. There was even a cycle between
common and store. The fix that lasts is lint rules with per-layer import restrictions, because
moving files alone only lasts one pull request.

If they push past that, say it plainly: that's where my depth stops, and the editor and agent
review work are where I can go deep.

---

## SamurAI Studios

### Three months is short — what did you actually get done?

- April: foundations and product cleanup
- Early May: media contracts and generation
- Mid-May: making storyboards scene-aware — the biggest piece
- Late May: the document-intelligence slice end to end
- June: shared UI and cutting workflows the product had outgrown

If you want one thing to judge me on, it's the storyboard migration.

**Why doesn't your GitHub graph show this?**

Private repos under a company account, commits attributed to a work identity rather than my
personal one. I'd rather explain that up front than have someone quietly assume I did nothing for
three months.

### Walk me through the creative-brief pipeline

A creative deck goes in, a structured brief comes out:

- Ingest a PowerPoint and validate it — half of real input is malformed.
- Extract embedded video, pull representative keyframes.
- Prioritise the visual inputs (a deck has far more images than are worth captioning), caption
  the ones that matter.
- Classify and fetch metadata for any URLs, safely.
- A model step turns all that evidence into a typed brief conforming to a schema exported as
  JSON Schema.
- Every stage persists what it consumed and produced.

**Why persist every stage — that's a lot of storage.**

A pipeline that behaves like one opaque model call is unmaintainable. When a brief comes out
wrong, the question is always which stage was wrong — no per-stage artifacts, no answer. Also why
I built the operator console: job search, live job detail, artifact previews, brief export.
Someone non-technical can look at the captions and see the model was fed the wrong three images.
Storage's cheap compared to that.

**What are golden evaluations?**

A fixed set of decks with known-good expected briefs, checked into the repo. The pipeline runs
against them, we diff. Regression testing for a non-deterministic system — you can't assert exact
string equality against a model, so the assertions target structure and required facts. Catches a
prompt or model change quietly making output worse everywhere, which unit tests can't.

**How did you secure it?**

API key protection on the parser endpoints, authentication on the console. Internal service, so
the threat model's mostly accidental exposure rather than a targeted attacker.

### The storyboard work — walk me through it end to end

Storyboards started project-owned — one project, one flat list of frames. Then it needed scenes:
a project holds scenes, a scene holds the storyboard. A data-model change, not a feature, so it
ran through the whole stack.

- Added a Scene domain model and the migration, with default-scene resolution so existing
  projects got one scene containing their old frames.
- Create, list, rename, reorder, delete APIs.
- Everything downstream became scene-scoped: frames, version history, snapshots, restore, edit,
  regenerate, render.
- Project-level final storyboards became an aggregation over scenes rather than a stored thing.

On the frontend: a multi-scene workspace, scene-aware loading states, final-storyboard and
candidate-selection interfaces.

**How did you keep old projects working?**

Default-scene resolution plus legacy route compatibility. Old projects resolve to a single
implicit scene rather than being migrated destructively, and old project-level routes keep
answering. Migration guards and shared fixtures so tests cover both shapes, plus a regression
suite asserting one scene can't leak state into another.

**What would leak?**

Version history and snapshots. Wrong scoping anywhere in that chain, and restoring a snapshot in
scene two overwrites frames in scene one — no error, just lost work. That's the failure I was
most afraid of, so it's what the tests target hardest.

### Multi-provider generation — what's actually hard about that?

Calling the APIs is the easy part. We supported Runway, Veo, and Seedance, plus Kling for final
image-to-video clips. The hard parts were consistency, visibility, and cost.

- Consistency — a storyboard's a sequence, each beat generated independently drifts visually, so
  continuity prompts carry style context between beats, and video prompts persist so a run's
  reproducible.
- Visibility — calls take minutes and fail in provider-specific ways, so runs needed monitoring,
  honest operational states, error states that tell you what to do.
- Cost — generation's expensive, we needed to know where the spend went, so provider usage
  logging and a usage view.

**How do providers differ in ways that hit your code?**

Different input contracts, different async models, different failure vocabulary. Some take a
reference image, some don't. Some return a job you poll, some hold the connection. The
abstraction has to be over the lifecycle — submit, observe, retrieve — not over the parameters,
because the parameters genuinely differ.

**What's real-time sync doing here?**

Multiple people work in the same workspace, and a generation run started by one of them has to
appear for the others.

### Media delivery — why did that need attention?

One image URL was doing three jobs — a tile preview, a gallery image, and the original
generation, each with different quality and cost requirements. I gave media URLs distinct roles,
generated sharper WebP thumbnails, exposed preview derivatives through the API, made the frontend
preview-aware so it knows when the small one's all it needs.

### Tailwind v4 migration — what changed?

v4 moves configuration into CSS — theme values live as custom properties in a CSS file rather
than a JS config object, so the design system's CSS-first. I migrated our theme onto v4 tokens
and built a design-system module around it.

---

## Fiddle (contractor)

### What is fiddle?

A component design tool — you come with rough ideas about what you want to build or experiment
with, and get a working prototype shipped directly to your codebase as a PR. No worrying about
code generation or the security of running that code, because everything runs inside a cloud
sandbox you can see into.

### Tell me about the canvas hydration race

New users opened the app to a blank canvas. Returning users were fine, which is why nobody on
the team saw it — we all had warm caches. Root cause: tldraw's onMount fires exactly once, and
early. Returning users have React Query data already cached, so onMount runs with data available.
New users hit a cold cache — the fetch hasn't resolved, onMount runs with projectData undefined,
the canvas initialises empty, and because onMount only fires once, the data arriving a moment
later never re-triggers hydration.

**How did you fix it?**

A readiness gate. The tldraw editor doesn't mount until React Query reports the data ready, so
onMount always has something to hydrate from. Plus a fallback that detects empty canvas state and
retries hydration if data lands late.

**Why not just hydrate in a useEffect on the data?**

Tempting, and worse. The editor mounts empty then gets populated — a visible flash of an empty
canvas, and a window where user input can land before the document arrives. Gating the mount
removes the intermediate state instead of patching over it.

**How would you have caught this earlier?**

An integration test that mounts with a cold cache. The whole bug class is "works for everyone who
already has state." We were early-stage though, e2e testing wasn't in scope yet.

### Storybook across four repositories — why was that hard?

None of the four agreed on anything. shadcn-ui was Tailwind v4 with CSS variables, so mostly
volume — stories for every component and its variants. design-engineer was still on Tailwind v3
and wouldn't render correctly until I migrated it. eleven-labs-ui had a theme bug where dark-mode
variables weren't reaching the Storybook iframe. fiddle itself needed a custom decorator
providing a QueryClient, because its components expect Remix loader context that doesn't exist
inside Storybook.

**You mentioned a MutationObserver — what for?**

Screenshot timing. The naive approach waits a fixed number of milliseconds — too short and flaky,
or too long and slow. Instead I observe the DOM for the actual rendered content and treat its
appearance as the ready signal.

### The canvas features — what was interesting in them?

Three small ones, each with one real decision.

- **Auto-pan.** A shape created off-screen used to be invisible. I wrote a reusable
  `zoomToNewSelection` utility so any feature that creates shapes can bring them into view,
  instead of each one doing its own camera math.
- **Component picker.** The mention menu was a text list, so you had to remember component
  names. I replaced it with a grid of thumbnails, so you browse and pick.
- **Theme switching.** The preview toolbar switches themes, but the themes aren't hardcoded. They
  come from the user's repository at runtime, so the preview matches the codebase it's for.

### Storycap — what did that replace and why?

Screenshots used to be captured at runtime from inside an iframe. That was complex and flaky,
because you're timing a live render. I switched to Storycap against a static Storybook build:
build once, screenshot every story. Two pieces made it reliable. A MutationObserver detects when
a story's content has actually rendered, instead of waiting a fixed number of milliseconds. And
on the build server, a sequential in-memory queue stops concurrent Storybook builds from
overwriting each other.

### PKCE — explain the flow and why you need it

Proof Key for Code Exchange. The plain authorisation code flow assumes the client can hold a
secret, which a browser app or desktop client can't. The client generates a random verifier,
hashes it, sends the hash as a challenge with the authorisation request. When it exchanges the
returned code for tokens, it sends the original verifier, and the server checks it against the
stored challenge. An attacker who intercepts the authorisation code can't use it — no verifier,
and can't derive it from the hash.

### Verified magic links and health checks?

Magic links: the dashboard verifies the email is real before sending a sign-in link, so the
link can't be used to probe or spam arbitrary addresses. Health checks: a `/api/health/claude`
endpoint the app calls before sending, plus shared Anthropic error handling, so an outage shows
one consistent message instead of a hung chat.

### What does optimistic chat sends mean?

The original send flow waited on everything before the UI moved — write to the database,
invalidate the cache, wait for the refetch, then render. Several round trips before the user sees
their own message. I restructured it so the message goes into the local cache optimistically and
renders immediately, the database write goes out async, the model call fires in parallel, and the
response streams back token by token.

**What happens when the write fails after you've already shown it?**

That's the cost of optimism, and you handle it explicitly rather than hope. Retry, and on final
failure surface an error toast and mark the message unsent. The rare bad case is worth the common
good case here — chat's the primary interaction, and latency in it is the whole feel of the
product.

**You also fixed double submission — same area?**

Same input, different problem. Two fast Enter presses sent the message twice — a straightforward
race. A submitting flag disables the input on first submit, clears when the response starts
streaming, plus a debounce guard.

---

## Fiddle (intern)

### Walk me through the react-flow to tldraw migration

We moved the canvas off react-flow onto tldraw. react-flow models everything as nodes and edges
— good for flowcharts — but fiddle needed freeform drawing and custom component shapes, which
meant building a new shape system rather than styling the old one.

### WebContainers to e2b — why?

WebContainers run the whole sandbox in the browser, elegant until it isn't. We hit memory
limits, package installation failures, browser compatibility problems — all landing on the user
as "the preview is broken," nothing we could do. e2b runs real Linux sandboxes in the cloud, so
installs behave like installs. Cost is network latency and a two-hour session limit; I built
custom templates and session management around that.

**Isn't moving compute to the cloud a step backwards for a design tool?**

For latency, yes. For reliability, no — and reliability was the thing failing. If I were
optimising now I'd look at a warm sandbox pool so the first preview doesn't pay cold start, but
that's a cost decision as much as an engineering one.

### What's the "make real" flow?

Draw a rough component on the canvas, get generated code back. The drawing becomes an attachment
on the chat message, so the model gets the image alongside the text prompt.

**How do you handle a bad generation?**

Keep it cheap to retry, never destroy the drawing. Generation's additive, not a replacement of
the user's input — the difference between a tool you experiment with and one you're afraid of.

---

## Skills block

**What's new in React 19 that you're actually using?**

Actions and the form integration around them, the `use` hook for reading promises and context
during render, ref as an ordinary prop so forwardRef stops being boilerplate. The compiler's the
bigger shift — removes most manual memoisation, though I wouldn't claim to have tuned it in
production.

**Zustand over Context or Redux — defend it.**

Context isn't a state manager, it's a dependency injection mechanism — using it for
frequently-changing state re-renders every consumer regardless of what they read. Zustand gives
selector-level subscriptions, so a component reading one field re-renders only when that field
changes. Compared to Redux it's far less ceremony for the same unidirectional model. Tradeoff's
less structure, so a large store needs discipline — in StashBase I split the store into typed
slices and moved feature logic out of components into the slices that own it.

**shadcn/ui isn't a library — why's it on your list?**

Correct, that's the point. It's a distribution model — components copied into your repo as
source rather than installed as a dependency, so you own and modify them. I've built on it and
trove/cn ships in the same registry format.

**What's a TypeScript feature you use that most people don't?**

Discriminated unions to make invalid states impossible. In the agent contract, a session is a
union over its states rather than an object with optional fields — you can't hold a reference to
a session that's both starting and streaming.

**PostgreSQL — tell me about a schema you designed.**

The storyboard model at SamurAI. A Scene table sits between project and frames, everything
downstream keys off scene, old projects resolve to a default scene rather than being migrated
destructively. Final storyboards stopped being stored and became an aggregation across scenes,
because storing them meant two sources of truth that could disagree.

**Describe a CI pipeline you built.**

The StashBase one — Electron, cross-platform. Required and manual checks: typecheck, lint, unit,
and a Playwright suite split into smoke, functional, visual. Visual baselines committed per
platform, refreshed manually. Release packaging and development both on Node 24, plus an
initial-JS budget so bundle growth fails the build instead of getting noticed a year later.

**Why Bun?**

Install and script speed, runs TypeScript directly. Risk's compatibility gaps against a
Node-shaped ecosystem — CI at StashBase validates on Node rather than assuming parity.

---

## trove/cn

### What problem does it solve?

You see a nice interaction on a real product and can't read the code behind it. A component
library hands you a package with a design system attached you didn't ask for. trove/cn rebuilds
those patterns from scratch and ships them as source in the shadcn registry format — one add
command copies the files into your project. Live preview next to the implementation, no runtime
dependency.

**How's that different from publishing an npm package?**

Ownership. A package is a black box you configure through props — need behaviour the author
didn't anticipate, you're stuck. Copied source is yours to edit. Cost is you don't get updates,
which is the right tradeoff for interface patterns specifically, since they're things you want to
customise rather than consume.

**What's hard about the registry format?**

A JSON manifest describing each component — its files, dependencies, registry dependencies.
Getting one add command to pull the correct files plus transitive dependencies was the fiddly
part. I generate the registry JSON from component metadata rather than maintaining it by hand.

**Why agent UI patterns?**

Because that's what I build at StashBase. A prompt composer, a tool run, an approval request, and a
plan checklist show up in every agent product, and each one has a hard state to get right: a tool
run that's still streaming, or an approval the user hasn't answered yet. There are 34 registry
items, and "30+" on the resume counts the patterns, not the helper hooks.

**Dozens of animated previews on one page — does that not crawl?**

That was the main performance problem. Every preview's a live component with real motion, so
naively mounting them all means dozens of animations running for content nobody's looking at.
Don't run what's off screen, keep each preview isolated.

---

## Education

### You studied Mechanical Engineering — how'd you end up here?

Got into programming wanting to know how things worked underneath, and that pulled me into
building interactive surfaces — canvases, editors, agent tooling. NIT Durgapur gave me the
engineering fundamentals; the software's self-taught, tested against production work since 2025.
I didn't learn one framework and stop — I built at different levels of the stack, and that shows
in the range on the page.

**Do you feel gaps from not having a CS degree?**

Specific ones. No formal algorithms course, so a genuinely algorithmic problem takes me longer to
recognise. What I have instead is time spent below the framework layer — renderer architecture,
agent protocol contracts, not just React.

---

## Behavioral

- **Hardest bug:** the canvas hydration race.
- **A decision and its tradeoff:** enforcing the StashBase renderer layers with lint instead of
  documentation — moving files alone wouldn't have survived a pull request.
- **Something built end to end:** the storyboard migration — data model, migration, APIs,
  frontend, regression tests, and a later deletion when the surface stopped earning its
  complexity.
- **Working in an unfamiliar codebase:** five repositories at fiddle with no shared config —
  worked in dependency order, shared libraries before consumers.
- **Feedback that changed something:** a review on StashBase's link navigation work found real
  problems, fixed in a follow-up before merge — I'd rather the review find it than a user.
- **Something you removed:** the flaky iframe screenshot path at fiddle, and part of the
  multi-scene surface at SamurAI once the product direction changed. Removing something you built
  two months ago is the harder one.
- **How I use AI tools:** constantly — exploring unfamiliar APIs, mechanical refactors,
  challenging an approach before I commit. I keep architecture, security, and complex state for
  myself, and don't keep code I can't explain.

---

## Traps

- **Stack rank:** nothing on the current resume points at other languages, so this only fires if
  I bring it up myself. If it does — TypeScript and React are what I do every day, and I'd say so
  plainly rather than pad the list.
- **Definition check:** any jargon I used is fair game — golden evaluations, source fidelity,
  PKCE. If I can't define it plainly, I shouldn't have written it.
- **Number check:** four model providers, four Storybook repos, 56 primitives, ~84 files on the
  tldraw migration. Know the shape even where I don't remember the exact number.
- **Scope check:** "who else worked on this" — say what was mine versus contributed to. StashBase
  is open source and public, so precision there costs nothing. The big refactor PRs are public
  too; if asked, say they were agent-driven and steer back to the editor and review work.
- **Silence trap:** narrate instead of pausing — "the interesting part of that one was X, let me
  start there."
- **Depth cliff:** it keeps going until I can't answer. Reaching the bottom isn't the failure —
  bluffing at the bottom is. Name the boundary, offer the adjacent thing I do know.
- **Unrelated deep-dive:** a frontend role still asks about Postgres or CI, because the machine
  reads the whole page. Prep the whole resume, not just the frontend half.

---

## Numbers, if asked cold

| Item                 | Detail                                        |
| -------------------- | --------------------------------------------- |
| Storybook repos      | 4                                             |
| Model providers      | 4 — Runway, Veo, Seedance, Kling              |
| StashBase            | open source, commits public under PPRAMANIK62 |
| shadcn-ui primitives | 56                                            |
| tldraw migration     | ~84 files, May–Aug 2025                       |
| SamurAI              | 4 codebases, Apr–Jul 2026                     |
| fiddle contractor    | 5 repositories, Dec 2025–Apr 2026             |
| e2b sandbox lifetime | 2 hours, silent expiry                        |

Openers that get the ramp going: lead with the tldraw migration or the hydration race — both
concrete, both non-obvious.

Closers, if asked for questions: ask about the code, not the company. What's a first task look
like. How much of the frontend is component work versus system work. What's the thing in the
codebase everyone's quietly afraid of.
