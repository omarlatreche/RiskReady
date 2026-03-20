import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { continueAsGuest } = useAuthStore()

  const handleGuestLogin = () => {
    continueAsGuest()
    navigate('/')
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Email
              </label>
              <input
                type="email"
                disabled
                placeholder="email@company.com"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-400 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Password
              </label>
              <input
                type="password"
                disabled
                placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                className="w-full px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-400 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              />
            </div>
          </div>

          <button
            disabled
            className="w-full py-3 rounded-lg bg-surface-200 dark:bg-surface-700 text-surface-400 font-medium text-sm cursor-not-allowed"
          >
            Sign In
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-surface-900 px-4 text-surface-500">or</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm shadow-md shadow-primary-900/20 hover:from-primary-700 hover:to-primary-800 active:translate-y-px transition-all duration-150"
          >
            Continue as Guest
          </button>

          <p className="text-xs text-center text-surface-500 dark:text-surface-400">
            Guest mode saves your progress locally on this device.
          </p>
        </div>
      </div>
    </div>
  )
}
