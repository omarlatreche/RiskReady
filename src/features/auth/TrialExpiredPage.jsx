import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export default function TrialExpiredPage() {
  const navigate = useNavigate()
  const { signOut } = useAuthStore()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 -mx-4 sm:-mx-8 lg:-mx-6 -mt-6 lg:-mt-10">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">
            Your trial has ended
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2">
            Your 7-day free trial of RiskReady has expired. Get in touch to continue preparing your team for CII GR1.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/pricing#contact"
            className="block w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors"
          >
            See plans & contact sales
          </Link>
          <button
            onClick={async () => { await signOut(); navigate('/login') }}
            className="block w-full py-3 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
