import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { IconHome, IconBook, IconTarget, IconRefresh, IconBarChart, IconFlame, IconMenu, IconSun, IconMoon, IconLogOut } from '@/components/Icons'

const navItems = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/practice', label: 'Practice', icon: IconBook },
  { to: '/mock', label: 'Mock Exam', icon: IconTarget },
  { to: '/review', label: 'Review', icon: IconRefresh },
  { to: '/analytics', label: 'Analytics', icon: IconBarChart },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isGuest, loading: authLoading, init, signOut } = useAuthStore()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('riskready_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 })

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (authLoading) return
    async function loadStreak() {
      const data = await Promise.resolve(api.getStreakData())
      setStreakData(data)
    }
    loadStreak()
  }, [authLoading, isGuest])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('riskready_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-surface-950/80 backdrop-blur-lg border-b border-surface-200/60 dark:border-surface-800/60 px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
        >
          <IconMenu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-0.5">
          <span className="font-bold text-surface-800 dark:text-surface-100">Risk</span>
          <span className="font-bold text-primary-600 dark:text-primary-400">Ready</span>
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
        >
          {darkMode ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white/70 dark:bg-surface-900/70 backdrop-blur-xl border-r border-surface-200/60 dark:border-surface-800/60 flex flex-col transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {/* Logo */}
          <div className="px-6 py-5 border-b border-surface-200/60 dark:border-surface-800/60">
            <Link to="/" className="flex items-center gap-0.5" onClick={() => setSidebarOpen(false)}>
              <span className="text-xl font-bold text-surface-800 dark:text-surface-100">Risk</span>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Ready</span>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] text-surface-400 font-medium mt-1">CII GR1 Exam Prep</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50/80 dark:bg-primary-500/8 text-primary-700 dark:text-primary-400 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-primary-500'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-surface-200/60 dark:border-surface-800/60 space-y-3">
            {streakData.currentStreak > 0 && (
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <IconFlame className="w-4 h-4 text-accent-400" />
                <span>{streakData.currentStreak} day streak</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500 truncate">
                {!isGuest ? (user?.email || user?.displayName || 'User') : 'Guest'}
              </span>
              <div className="flex items-center gap-1">
                {!isGuest ? (
                  <button
                    onClick={async () => { await signOut(); navigate('/login') }}
                    title="Sign out"
                    className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400 transition-colors"
                  >
                    <IconLogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                )}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400 transition-colors"
                >
                  {darkMode ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:min-h-0 overflow-x-hidden">
          {location.pathname === '/' && (
            <div className="bg-gradient-to-br from-primary-100/60 via-primary-50/30 to-accent-400/10 dark:from-primary-500/10 dark:via-surface-900 dark:to-surface-950 border-b border-primary-200/30 dark:border-surface-800/60">
              <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 pt-8 lg:pt-12 pb-8">
                <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">
                  Welcome to RiskReady
                </h1>
                <p className="text-surface-500 dark:text-surface-400 mt-1">
                  Your CII GR1 Group Risk exam preparation platform.
                </p>
              </div>
            </div>
          )}
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-10 pb-24 lg:pb-8">
            <div className="animate-fade-in-up">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-surface-950/90 backdrop-blur-lg border-t border-surface-200/60 dark:border-surface-800/60">
        <div className="flex">
          {navItems.slice(1).map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative flex-1 flex flex-col items-center py-3 text-xs transition-colors',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary-500'
                    : 'text-surface-400 dark:text-surface-500'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
