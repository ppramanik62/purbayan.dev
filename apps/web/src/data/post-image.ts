/**
 * An image in a post is a line on its own:
 *
 *   ![What the drawing shows](/blog/<slug>/drawing.svg "Optional caption")
 *
 * The file lives in `public/blog/<slug>/`. The site parses the line (`src/data/blog.ts`);
 * the build scripts check that the file exists (`scripts/posts.ts`).
 */

export interface PostImage {
  src: string
  /** Read out by screen readers in place of the image. Required. */
  alt: string
  /** Shown under the image. */
  caption?: string
}

const IMAGE_LINE = /^!\[(.*)\]\((\S+?)(?:\s+"(.*)")?\)$/
const EXTENSIONS = /\.(svg|png|jpe?g|webp|avif|gif)$/i

export function isImageLine(line: string): boolean {
  return line.trim().startsWith("![")
}

/** Throws on a line that starts like an image but is malformed, so a typo can't become a paragraph. */
export function parseImageLine(line: string): PostImage {
  const trimmed = line.trim()
  const match = trimmed.match(IMAGE_LINE)
  if (!match) throw new Error(`Image line is malformed: ${trimmed}`)
  const [, alt, src, caption] = match
  if (alt.trim() === "") throw new Error(`Image ${src} needs alt text: ![what it shows](${src})`)
  if (!EXTENSIONS.test(src))
    throw new Error(`Image ${src} must be svg, png, jpg, webp, avif or gif`)
  return caption?.trim()
    ? { src, alt: alt.trim(), caption: caption.trim() }
    : { src, alt: alt.trim() }
}

/** Where a post's images must live, as a URL path. */
export function imageDir(slug: string): string {
  return `/blog/${slug}/`
}
