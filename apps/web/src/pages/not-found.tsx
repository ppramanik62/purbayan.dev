import { Link } from "react-router-dom"
import { usePageMeta } from "@/hooks/use-page-meta"
import { PageHead, Row } from "@/components/notebook"

export default function NotFoundPage() {
  usePageMeta({ title: "Not found", description: "That page doesn't exist." })

  return (
    <>
      <PageHead title="This page isn’t in the notebook" />
      <Row margin="404" pen>
        <p className="text-dim">
          The link may be out of date, or I moved something.{" "}
          <Link to="/" className="ink-link">
            Start from the first page
          </Link>
          .
        </p>
      </Row>
    </>
  )
}
