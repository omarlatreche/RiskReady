import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom'
import Layout from './layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { IconBook, IconTarget, IconRefresh, IconBarChart } from '@/components/Icons'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { cn, formatDate } from '@/lib/utils'

const PracticePage = lazy(() => import('@/features/practice/PracticePage'))
const PracticeSession = lazy(() => import('@/features/practice/PracticeSession'))
const MockPage = lazy(() => import('@/features/mock/MockPage'))
const MockResultsPage = lazy(() => import('@/features/mock/MockResultsPage'))
const ReviewPage = lazy(() => import('@/features/review/ReviewPage'))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'))
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const TrialExpiredPage = lazy(() => import('@/features/auth/TrialExpiredPage'))
const OrgDashboard = lazy(() => import('@/features/organisation/OrgDashboard'))
const MemberDetail = lazy(() => import('@/features/organisation/MemberDetail'))
const PricingPage = lazy(() => import('@/features/pricing/PricingPage'))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin w-6 h-6 border-[2.5px] border-primary-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400 rounded-full" />
    </div>
  )
}

function ProtectedRoute() {
  const { user, loading, trialExpired } = useAuthStore()
  if (loading) return <LazyFallback />
  if (!user) return <Navigate to="/login" replace />
  if (trialExpired) return <Navigate to="/trial-expired" replace />
  return <Outlet />
}

function DashboardPage() {
  const [attempts, setAttempts] = useState([])
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 })
  const [responses, setResponses] = useState([])
  const [reviewCount, setReviewCount] = useState(0)
  const { loading: authLoading } = useAuthStore()

  useEffect(() => {
    if (authLoading) return
    async function load() {
      const [att, streak, resp, queue] = await Promise.all([
        Promise.resolve(api.getAttempts()),
        Promise.resolve(api.getStreakData()),
        Promise.resolve(api.getResponses()),
        Promise.resolve(api.getReviewQueue()),
      ])
      setAttempts(att.filter((a) => a.mode === 'mock').slice(-3).reverse())
      setStreakData(streak)
      setResponses(resp)
      setReviewCount(queue.filter((q) => !q.resolved).length)
    }
    load()
  }, [authLoading])

  return (
    <div className="space-y-8">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-accent-400 shadow-sm shadow-surface-900/[0.03] p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Streak</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{streakData.currentStreak} <span className="text-sm font-normal text-surface-400">{streakData.currentStreak === 1 ? 'day' : 'days'}</span></p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-primary-500 shadow-sm shadow-surface-900/[0.03] p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Questions Done</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{responses.length}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-success-500 shadow-sm shadow-surface-900/[0.03] p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Mock Exams</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{attempts.length}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-danger-500 shadow-sm shadow-surface-900/[0.03] p-4">
          <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">Review Queue</p>
          <p className="text-2xl font-bold tabular-nums text-surface-800 dark:text-surface-100">{reviewCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          to="/practice"
          title="Practice"
          description="Study by chapter with instant feedback"
          icon={IconBook}
          accent="border-t-primary-500"
        />
        <QuickAction
          to="/mock"
          title="Mock Exam"
          description="50 questions, 60 minutes, real exam conditions"
          icon={IconTarget}
          accent="border-t-primary-600"
        />
        <QuickAction
          to="/review"
          title="Review"
          description="Retake questions you got wrong"
          icon={IconRefresh}
          accent="border-t-accent-400"
        />
        <QuickAction
          to="/analytics"
          title="Analytics"
          description="Track your progress and weak areas"
          icon={IconBarChart}
          accent="border-t-success-500"
        />
      </div>

      {/* Recent activity + exam info side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
          <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-3">Recent Mock Exams</h2>
          {attempts.length === 0 ? (
            <p className="text-sm text-surface-400 dark:text-surface-500 py-4 text-center">No mock exams taken yet. Start one to track your progress.</p>
          ) : (
            <div className="space-y-2.5">
              {attempts.map((a) => (
                <Link key={a.id} to={`/mock/results/${a.id}`} className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{formatDate(a.completedAt)}</p>
                    <p className="text-xs text-surface-400 tabular-nums">{a.correctCount}/{a.totalQuestions} correct</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-lg font-bold tabular-nums',
                      a.score >= 65 ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
                    )}>{a.score}%</span>
                    <span className="text-surface-300 dark:text-surface-600 group-hover:text-surface-500 dark:group-hover:text-surface-400 transition-colors">&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
          <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-3">About the GR1 Exam</h2>
          <ul className="space-y-2.5 text-sm text-surface-600 dark:text-surface-400">
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              50 multiple-choice questions (4 options, one correct answer)
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              1 hour time limit
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              65% pass mark (33 out of 50)
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              11 learning outcomes covering group risk insurance
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              Heaviest topics: Intermediary (Ch9) and Insurer Functions (Ch10) at 8 questions each
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ to, title, description, icon: Icon, accent }) {
  return (
    <Link
      to={to}
      className={`bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-t-2 ${accent} shadow-sm shadow-surface-900/[0.03] p-5 hover:shadow-md hover:shadow-surface-900/[0.06] hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:-translate-y-0.5 transition-all duration-200 ease-out group block`}
    >
      <Icon className="w-6 h-6 text-surface-400 dark:text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
      <h3 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mt-2.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">{description}</p>
    </Link>
  )
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-surface-800 dark:text-surface-100 mb-2">404</h1>
      <p className="text-surface-500 dark:text-surface-400">Page not found</p>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="trial-expired" element={<TrialExpiredPage />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route index element={<DashboardPage />} />
                <Route path="practice" element={<PracticePage />} />
                <Route path="practice/:chapterId" element={<PracticeSession />} />
                <Route path="mock" element={<MockPage />} />
                <Route path="mock/results/:attemptId" element={<MockResultsPage />} />
                <Route path="review" element={<ReviewPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="org" element={<OrgDashboard />} />
                <Route path="org/member/:memberId" element={<MemberDetail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
