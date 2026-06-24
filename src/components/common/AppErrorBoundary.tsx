import { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="text-5xl">✦</div>
          <h1 className="font-serif text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            We're sorry for the inconvenience. Please refresh the page or contact us on WhatsApp.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-2.5"
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
