import { Component } from "react"
import { Link } from "react-router-dom"
import type { ErrorInfo, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  resetKey?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-16">
          <p className="text-[21px] italic">Something on this page broke.</p>
          {this.state.error?.message && (
            <p className="mt-2 font-mono text-[13px] text-faint">{this.state.error.message}</p>
          )}
          <div className="mt-6 flex gap-6">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="ink-link cursor-pointer"
            >
              Try again
            </button>
            <Link to="/" className="ink-link">
              Go home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
