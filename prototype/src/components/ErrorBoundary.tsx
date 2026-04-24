import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface ErrorBoundaryInnerProps {
  children: ReactNode
}

interface ErrorBoundaryInnerState {
  hasError: boolean
}

class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProps, ErrorBoundaryInnerState> {
  state: ErrorBoundaryInnerState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route render failed', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="bg-card border border-border rounded-xl p-8">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This page failed to render. Please refresh or return to another page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <ErrorBoundaryInner key={location.pathname}>
      {children}
    </ErrorBoundaryInner>
  )
}
