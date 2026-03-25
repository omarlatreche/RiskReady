import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp, loading, error, clearError } = useAuthStore()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const supabaseReady = isSupabaseConfigured()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!supabaseReady) return

    if (isSignUp) {
      await signUp(email, password, displayName)
    } else {
      await signIn(email, password)
    }

    // If no error after auth, navigate home
    const { error: authError } = useAuthStore.getState()
    if (!authError) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-br from-surface-50 to-primary-50/30 dark:from-surface-950 dark:to-primary-500/5 -mx-4 sm:-mx-8 lg:-mx-6 -mt-6 lg:-mt-10">
      <div className="max-w-md w-full space-y-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-surface-800 dark:text-surface-100">Risk</span>
            <span className="text-primary-600 dark:text-primary-400">Ready</span>
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2">
            CII GR1 Exam Preparation Platform
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-8 space-y-6">
          {error && (
            <div className="bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-lg p-3">
              <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); clearError() }}
                  disabled={!supabaseReady}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:bg-surface-50 disabled:dark:bg-surface-800 disabled:text-surface-400"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError() }}
                disabled={!supabaseReady}
                placeholder="email@company.com"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:bg-surface-50 disabled:dark:bg-surface-800 disabled:text-surface-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError() }}
                disabled={!supabaseReady}
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:bg-surface-50 disabled:dark:bg-surface-800 disabled:text-surface-400"
              />
            </div>

            <button
              type="submit"
              disabled={!supabaseReady || loading || !email || !password}
              className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors disabled:bg-surface-200 disabled:dark:bg-surface-700 disabled:text-surface-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {supabaseReady && (
            <p className="text-center text-sm text-surface-500 dark:text-surface-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignUp(!isSignUp); clearError() }}
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          )}

          {isSignUp && (
            <p className="text-xs text-center text-surface-400 dark:text-surface-500">
              Start your free 7-day trial. No credit card required.
            </p>
          )}

          {!supabaseReady && (
            <p className="text-xs text-center text-surface-400 dark:text-surface-500">
              Cloud sync is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-surface-400 dark:text-surface-500">
          Looking for team pricing?{' '}
          <Link to="/pricing" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            See plans
          </Link>
        </p>
      </div>
    </div>
  )
}
