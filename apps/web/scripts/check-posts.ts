/**
 * Loads the posts the way the site does, through Vite, so every check in src/data/blog.ts
 * (frontmatter, series, tables, sidenotes, image folders) runs at build time. In the browser
 * those checks throw while the site loads and blank every page, so they must fail here first.
 */
import { createServer } from "vite"

const server = await createServer({
  configFile: new URL("../vite.config.ts", import.meta.url).pathname,
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  // Only blog.ts is loaded; skip the dependency scan a dev server starts.
  optimizeDeps: { noDiscovery: true, include: [] },
  logLevel: "error",
})
try {
  const { blogPosts } = await server.ssrLoadModule("/src/data/blog.ts")
  console.log(`checked ${blogPosts.length} posts`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await server.close()
}
