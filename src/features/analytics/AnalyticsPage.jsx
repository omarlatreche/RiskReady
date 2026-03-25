import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnalyticsStore } from '@/store/useAnalyticsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { ChapterAccuracyChart, ScoreHistoryChart } from '@/components/Chart'
import ReadinessGauge from '@/components/ReadinessGauge'
import DifficultyHeatmap from '@/components/DifficultyHeatmap'
import LearningVelocity from '@/components/LearningVelocity'
import chapters from '@/data/chapters.json'
import { api } from '@/lib/api'
import { cn, formatDate } from '@/lib/utils'
import { IconExport, IconUsers } from '@/components/Icons'

export default function AnalyticsPage() {
  const {
    loadAnalytics, streakData, chapterAccuracy, weakChapters,
    overconfidentChapters, confidenceMatrix, readinessScore, responses,
    getAverageScore, getTotalQuestionsAnswered, getPassRate, getMockAttempts,
  } = useAnalyticsStore()
  const org = useAuthStore((s) => s.org)

  const [allQuestions, setAllQuestions] = useState([])

  useEffect(() => {
    loadAnalytics()
    import('@/data/questions/loader').then(({ loadAllQuestions }) =>
      loadAllQuestions().then(setAllQuestions)
    )
  }, [])

  const avgScore = getAverageScore()
  const totalAnswered = getTotalQuestionsAnswered()
  const passRate = getPassRate()
  const mockAttempts = getMockAttempts()

  // Chart data
  const chapterChartData = chapters.map((ch) => ({
    name: `Ch${ch.number}`,
    accuracy: chapterAccuracy[ch.id]?.percentage ?? 0,
    correct: chapterAccuracy[ch.id]?.correct ?? 0,
    total: chapterAccuracy[ch.id]?.total ?? 0,
  }))

  const scoreHistoryData = mockAttempts.map((a) => ({
    date: formatDate(a.completedAt),
    score: a.score,
    passmark: 65,
  }))

  const handleExportProgress = async () => {
    const [{ exportProgressReport }, attempts, responses, reviewQueue] = await Promise.all([
      import('@/lib/export'),
      Promise.resolve(api.getAttempts()),
      Promise.resolve(api.getResponses()),
      Promise.resolve(api.getReviewQueue()),
    ])
    exportProgressReport({
      attempts,
      responses,
      reviewQueue,
      streakData,
      chapterAccuracy,
      chapters,
    })
  }

  const handleExportQuestions = async () => {
    const [{ exportQuestionAnalysis }, responses] = await Promise.all([
      import('@/lib/export'),
      Promise.resolve(api.getResponses()),
    ])
    exportQuestionAnalysis({
      responses,
      questions: allQuestions,
      chapters,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">Analytics</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1 hidden sm:block">
              Track your progress and identify areas for improvement.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleExportProgress}
              className="px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 transition-all duration-150 flex items-center gap-1.5"
            >
              <IconExport className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Progress Report</span>
              <span className="sm:hidden">Report</span>
            </button>
            <button
              onClick={handleExportQuestions}
              className="px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 transition-all duration-150 flex items-center gap-1.5"
            >
              <IconExport className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Question Analysis</span>
              <span className="sm:hidden">Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Readiness gauge */}
      {readinessScore && (
        <ReadinessGauge score={readinessScore.score} breakdown={readinessScore.breakdown} />
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Streak" value={`${streakData.currentStreak} ${streakData.currentStreak === 1 ? 'day' : 'days'}`} accent="border-l-accent-400" />
        <StatCard label="Mock Average" value={`${avgScore}%`} highlight={avgScore >= 65} accent="border-l-primary-500" />
        <StatCard label="Pass Rate" value={`${passRate}%`} highlight={passRate >= 50} accent="border-l-success-500" />
        <StatCard label="Questions Answered" value={totalAnswered} accent="border-l-surface-400" />
      </div>

      {!org && (
        <Link
          to="/pricing"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50/60 dark:bg-primary-500/5 border border-primary-200/40 dark:border-primary-500/10 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors group"
        >
          <IconUsers className="w-5 h-5 text-primary-500 shrink-0" />
          <p className="text-sm text-surface-600 dark:text-surface-400">
            <span className="font-medium text-surface-700 dark:text-surface-300">Need team-wide analytics?</span>{' '}
            See what Teams can do for your organisation.
          </p>
          <span className="ml-auto text-primary-500 group-hover:translate-x-0.5 transition-transform shrink-0">&rarr;</span>
        </Link>
      )}

      {/* Learning velocity */}
      {responses.length > 0 && (
        <LearningVelocity responses={responses} />
      )}

      {/* Score history + Chapter accuracy side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
          <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-4">Mock Exam Scores</h2>
          <ScoreHistoryChart data={scoreHistoryData} />
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
          <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-4">Accuracy by Chapter</h2>
          <ChapterAccuracyChart data={chapterChartData} />
        </div>
      </div>

      {/* Difficulty heatmap */}
      {responses.length > 0 && allQuestions.length > 0 && (
        <DifficultyHeatmap responses={responses} questions={allQuestions} chapters={chapters} />
      )}

      {/* Weak chapters + Overconfidence side by side */}
      {(weakChapters.length > 0 || overconfidentChapters.length > 0) && (
        <div className={cn('grid grid-cols-1 gap-6', overconfidentChapters.length > 0 && weakChapters.length > 0 && 'lg:grid-cols-2')}>
          {weakChapters.length > 0 && (
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-danger-500 shadow-sm shadow-surface-900/[0.03] p-6">
              <h2 className="font-semibold tracking-tight text-danger-600 dark:text-danger-500 mb-3">
                Weakest Topics
              </h2>
              <div className="space-y-2">
                {weakChapters.slice(0, 5).map((wc) => {
                  const ch = chapters.find((c) => c.id === wc.chapter)
                  return (
                    <div key={wc.chapter} className="flex items-center justify-between">
                      <span className="text-sm text-surface-700 dark:text-surface-300">
                        Ch {ch?.number}: {ch?.title}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-danger-600 dark:text-danger-500">
                        {wc.percentage}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {overconfidentChapters.length > 0 && (
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] border-l-warning-500 shadow-sm shadow-surface-900/[0.03] p-6">
              <h2 className="font-semibold tracking-tight text-warning-600 dark:text-warning-500 mb-2">
                Overconfidence Alert
              </h2>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                You're rating high confidence but getting answers wrong in these chapters:
              </p>
              <div className="flex flex-wrap gap-2">
                {overconfidentChapters.map((chId) => {
                  const ch = chapters.find((c) => c.id === chId)
                  return (
                    <span key={chId} className="bg-warning-100 dark:bg-warning-500/20 text-warning-700 dark:text-warning-400 text-xs font-medium px-3 py-1 rounded-full">
                      Ch {ch?.number}: {ch?.title}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confidence matrix */}
      {confidenceMatrix && totalAnswered > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
          <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-4">Confidence vs Correctness</h2>
          <div className="grid grid-cols-3 gap-4">
            <ConfBox label="High Conf + Correct" value={confidenceMatrix.highConfCorrect} color="success" />
            <ConfBox label="Med Conf + Correct" value={confidenceMatrix.medConfCorrect} color="success" />
            <ConfBox label="Low Conf + Correct" value={confidenceMatrix.lowConfCorrect} color="success" />
            <ConfBox label="High Conf + Wrong" value={confidenceMatrix.highConfWrong} color="danger" />
            <ConfBox label="Med Conf + Wrong" value={confidenceMatrix.medConfWrong} color="warning" />
            <ConfBox label="Low Conf + Wrong" value={confidenceMatrix.lowConfWrong} color="neutral" />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight, accent }) {
  return (
    <div className={`bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 border-l-[3px] ${accent} shadow-sm shadow-surface-900/[0.03] p-4`}>
      <p className="text-xs tracking-wide uppercase font-medium text-surface-500 dark:text-surface-400 mb-1">{label}</p>
      <p className={cn(
        'text-2xl font-bold tabular-nums',
        highlight === true ? 'text-success-600 dark:text-success-500' : highlight === false ? 'text-danger-600 dark:text-danger-500' : 'text-surface-800 dark:text-surface-100'
      )}>
        {value}
      </p>
    </div>
  )
}

function ConfBox({ label, value, color }) {
  const colors = {
    success: 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-500',
    danger: 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-500',
    warning: 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-500',
    neutral: 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
  }

  return (
    <div className={cn('rounded-lg p-3 text-center', colors[color])}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  )
}
