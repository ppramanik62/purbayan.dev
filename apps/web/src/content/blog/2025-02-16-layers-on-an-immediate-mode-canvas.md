---
title: "Layers on an immediate-mode canvas"
tags: ["canvas-api", "react", "typescript", "architecture"]
summary: "The HTML5 Canvas API is immediate-mode. It forgets everything it draws. So how do you build layers, undo/redo, and compositing on top of it?"
readingTime: "4 min read"
---

The HTML5 Canvas API is immediate-mode. You call `ctx.fillRect()`, pixels appear on a bitmap, and the API forgets it ever happened. There's no scene graph, no object you can select later, no `.setVisible(false)`. Once it's drawn, it's pixels.

So when I wanted layers, meaning visibility toggles, reordering, and per-layer erasure, I had to build a retained-mode abstraction on top of an API that was never designed for one.

This is the approach I landed on in Canvas Kit, a drawing app built with Next.js 15 and React 19.

## The problem

A single `<canvas>` element gives you one drawing surface. Draw a red circle, then a blue square on top of it, and hiding the square means redrawing the whole canvas without it. The canvas doesn't know what a "square" is. It only knows pixels.

Browser drawing tools usually solve this one of two ways:

- SVG-based (Excalidraw, tldraw). Every shape is a DOM node, so layers are easy, just toggle `display: none`. But freehand drawing generates thousands of path nodes and performance falls off fast.
- One canvas per layer (Photoshop-style). Stack multiple `<canvas>` elements with `position: absolute` and let CSS composite them. Each layer is independent. Clean, but it puts a real DOM element on screen per layer, complicates event handling, and makes export awkward since you have to flatten by hand.

I went with a third option: one canvas, multiple offscreen buffers.

## The architecture

Each layer gets its own `OffscreenCanvas`, or a plain in-memory canvas from `document.createElement('canvas')`. Drawing operations target the active layer's buffer. Nothing ever draws to the visible canvas directly.

The visible canvas is only a compositor. Every frame:

```javascript
clear visible canvas
for each layer (bottom to top):
  if layer.visible:
    ctx.globalAlpha = layer.opacity
    ctx.drawImage(layer.buffer, 0, 0)
```

Visibility, opacity, and reordering come out of that for free. Each one is either a change in iteration order or a skipped `drawImage`.

## Why this is harder than it sounds

**Erasing across layers.** On a single canvas, `globalCompositeOperation = 'destination-out'` erases pixels. With offscreen buffers you have to erase from the right layer's buffer and then recomposite. Erase on layer 2 and layer 1's pixels underneath should show through, but they were never hidden, they just hadn't been composited yet. The eraser runs `destination-out` against the active buffer and the compositor handles the rest.

**Undo/redo with layers.** A naive undo stack stores canvas snapshots, one `ctx.getImageData()` per stroke. Fine for a single canvas. With N layers you also have to know which layer changed, so each history entry stores `{ layerId, imageData, before, after }`. Undo restores the `before` snapshot to that layer's buffer and recomposites. It's a per-layer command pattern where the commands are bitmap diffs rather than shape descriptions.

**Responsive sizing.** The canvas `width`/`height` attributes set bitmap resolution. CSS `width`/`height` sets display size. When they disagree, everything looks blurry or stretched. On resize you have to save all layer buffers, resize every offscreen canvas, restore the buffers, and recomposite. Setting `width: 100%` and walking away loses the drawing.

## Keyboard shortcuts and tool state

Each tool (brush, eraser, rectangle, circle) is a strategy object that handles `pointerdown`, `pointermove`, and `pointerup` its own way. Switching tools with `B`/`E`/`R`/`C` swaps which strategy is active.

The tricky part is keeping shortcuts away from browser defaults. `Ctrl+Z` triggers the browser's native undo on any focused input. The fix: the canvas container captures keyboard events and calls `e.preventDefault()` selectively, only for the shortcuts we actually handle.

## Export

The visible canvas is already a flattened composite, so export is nearly free. `canvas.toDataURL('image/png')` gives you a data URI and an anchor with a `download` attribute does the rest. One subtlety: if you want an "all layers" export instead of a "visible layers only" export, you have to composite one more time with every layer forced visible. Canvas Kit exports what you see.

## What I'd do differently

The whole app lives in one `page.tsx`. State, drawing logic, UI, compositing. It works, but the drawing engine (buffers, compositing, history) should be a standalone module with no React dependency. `new CanvasEngine(el)` should work in vanilla JS. React should only hold UI state: selected tool, panel open or closed, color picker value.

I also skipped pressure sensitivity. The Pointer Events API exposes `pressure` on supported devices, and mapping it to brush width is the difference between a drawing tool and a tool that draws lines of one width. It's maybe 20 lines.

## Stack

- Next.js 15 and React 19, App Router, single page
- TypeScript throughout
- Tailwind CSS 4 for layout and UI
- Framer Motion for the panel animations
- Canvas API for all drawing, compositing, and export

The repo is at github.com/ppramanik62/canvas-kit, and there's a live demo at canvas-kit.vercel.app.
