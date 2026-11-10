import { useEffect, useRef, useState } from "react"
import { Maximize2, X } from "lucide-react"
import type { PostImage } from "@/data/post-image"

/**
 * How long the modal takes to close, read from the CSS so the two stay in step. The build
 * minifies `150ms` to `.15s`, so both units are read.
 */
function closeMs(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
  const n = parseFloat(value)
  if (Number.isNaN(n)) return 150
  return value.trim().endsWith("ms") ? n : n * 1000
}

/** Wider than this (width ÷ height) and the image scrolls sideways on phones instead of shrinking. */
const WIDE = 2

/**
 * An image in a post. Clicking it opens it larger in a modal; the expand icon in the corner
 * shows on hover, on keyboard focus, and always on touch screens, which have no hover.
 */
export function PostFigure({ src, alt, caption }: PostImage) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [wide, setWide] = useState(false)

  // Esc would close the dialog at once. Catch the key on the page, before the browser turns it
  // into a close, and play the closing animation instead. (`cancel` can't always be stopped.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !dialog.current?.open) return
      e.preventDefault()
      close()
    }
    window.addEventListener("keydown", onKey, { capture: true })
    return () => window.removeEventListener("keydown", onKey, { capture: true })
  })

  function open() {
    const el = dialog.current
    if (!el) return
    el.classList.remove("is-closing")
    el.showModal()
    // The dialog was display: none; let it lay out at the closed scale before opening.
    void el.offsetWidth
    el.classList.add("is-open")
  }

  function close() {
    const el = dialog.current
    if (!el?.open || el.classList.contains("is-closing")) return
    el.classList.remove("is-open")
    el.classList.add("is-closing")
    setTimeout(() => {
      el.close()
      el.classList.remove("is-closing")
    }, closeMs())
  }

  return (
    <figure className="m-0">
      <button
        type="button"
        onClick={open}
        className="group relative mx-auto block max-w-full cursor-zoom-in"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={(e) =>
            setWide(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight > WIDE)
          }
          className="block h-auto max-w-full"
        />
        <span className="sr-only">, view larger</span>
        <span
          aria-hidden
          className="absolute top-2 right-2 rounded-xs border border-rule bg-card p-1.5 text-dim opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Maximize2 className="size-3.5" />
        </span>
      </button>
      {caption && (
        <figcaption className="mx-auto mt-2 max-w-[64ch] text-center font-mono text-xs leading-relaxed text-faint">
          {caption}
        </figcaption>
      )}

      <dialog
        ref={dialog}
        aria-label={alt}
        // A click on the backdrop lands on the dialog itself; clicks inside land on its children.
        onClick={(e) => e.target === e.currentTarget && close()}
        onCancel={(e) => {
          e.preventDefault()
          close()
        }}
        className="t-modal m-auto max-h-[92vh] max-w-[95vw] overflow-hidden rounded-sm border border-rule bg-paper p-0 text-ink shadow-xl backdrop:bg-ink/50"
      >
        <div className="relative p-4 pt-11 max-[680px]:p-3 max-[680px]:pt-10">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-2 right-2 rounded-xs p-1.5 text-dim transition-colors hover:text-ink"
          >
            <X className="size-4" />
          </button>
          <div className="max-h-[calc(92vh-6rem)] overflow-auto">
            <img
              src={src}
              alt={alt}
              className={
                wide
                  ? "block h-auto max-w-full max-[680px]:w-[900px] max-[680px]:max-w-none"
                  : "mx-auto block h-auto max-h-[calc(92vh-6rem)] max-w-full"
              }
            />
          </div>
          {caption && (
            <p className="mt-3 mb-0 max-w-[64ch] font-mono text-xs leading-relaxed text-faint">
              {caption}
            </p>
          )}
        </div>
      </dialog>
    </figure>
  )
}
