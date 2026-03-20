import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
          <div className="bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 rounded-xl p-6 max-w-md text-center shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-danger-600 dark:text-danger-500 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
