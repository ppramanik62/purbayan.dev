import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  isRouteErrorResponse,
  useParams,
  useRouteError,
  Link,
} from "react-router-dom"
import { Layout } from "@/components/layout"

import HomePage from "@/pages/home"
import ProjectsPage from "@/pages/projects"
import ExperiencePage from "@/pages/experience"
import WritingPage from "@/pages/writing"
import WritingPostPage from "@/pages/writing-post"
import ReadingPage from "@/pages/reading"
import OpenSourcePage from "@/pages/open-source"
import NotFoundPage from "@/pages/not-found"

function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Unknown error"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-dim">
        <span className="text-pen">Error:</span> {message}
      </p>
      <Link to="/" className="ink-link mt-4">
        Go home
      </Link>
    </div>
  )
}

/** Old /blog/:slug links now live under /writing. */
function OldPost() {
  const { slug } = useParams()
  return <Navigate to={`/writing/${slug}`} replace />
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/experience", element: <ExperiencePage /> },
      { path: "/writing", element: <WritingPage /> },
      { path: "/writing/:slug", element: <WritingPostPage /> },
      { path: "/reading", element: <ReadingPage /> },
      { path: "/open-source", element: <OpenSourcePage /> },

      // Keep old links working.
      { path: "/about", element: <Navigate to="/" replace /> },
      { path: "/blog", element: <Navigate to="/writing" replace /> },
      { path: "/blog/:slug", element: <OldPost /> },
      { path: "/projects/:slug", element: <Navigate to="/projects" replace /> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
