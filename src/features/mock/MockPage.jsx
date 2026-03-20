import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '@/store/useQuizStore'
import { generateMockExam } from '@/lib/scoring'
import { api } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { loadAllQuestions } from '@/data/questions/loader'
import QuizRunner from '@/components/QuizRunner'

export default function MockPage() {
  const navigate = useNavigate()
  const { mode, startMock, resetQuiz } = useQuizStore()
  const [pastAttempts, setPastAttempts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const attempts = api.getAttempts().filter((a) => a.mode === 'mock')
    setPastAttempts(attempts.reverse())
  }, [mode])

  const handleStart = async () => {
    setLoading(true)
    try {
      const allQuestions = await loadAllQuestions()
      const singleQuestions = allQuestions.filter((q) => q.type === 'single')
      const mockQuestions = generateMockExam(singleQuestions)
      startMock(mockQuestions)
    } catch (e) {
      console.error('Failed to generate mock exam:', e)
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'mock') {
    return (
      <div>
        <QuizRunner onComplete={() => {}} />
        <div className="text-center mt-6">
          <button
            onClick={resetQuiz}
            className="text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
          >
            Exit to Mock Overview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">Mock Exam</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Simulate the real CII GR1 exam conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6 space-y-4">
          <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100">Exam Rules</h2>
          <ul className="space-y-2.5 text-sm text-surface-600 dark:text-surface-400">
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              50 multiple-choice questions (matching real CII format)
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              60 minutes time limit with auto-submit
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              No feedback until you submit
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              65% pass mark (33 out of 50 correct)
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              Questions weighted by official CII syllabus allocation
            </li>
          </ul>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl px-6 py-4 font-semibold text-lg shadow-md shadow-primary-900/20 hover:from-primary-700 hover:to-primary-800 active:translate-y-px transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating exam...' : 'Start Mock Exam'}
          </button>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
          <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-3">Past Attempts</h2>
          {pastAttempts.length === 0 ? (
            <p className="text-sm text-surface-400 dark:text-surface-500 py-8 text-center">No mock exams taken yet. Your results will appear here.</p>
          ) : (
            <div className="space-y-2">
              {pastAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between py-2.5 border-b border-surface-100 dark:border-surface-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      {formatDate(attempt.completedAt)}
                    </p>
                    <p className="text-xs text-surface-500 tabular-nums">
                      {attempt.correctCount}/{attempt.totalQuestions} correct
                      {attempt.timeSpentSeconds && ` \u00b7 ${Math.floor(attempt.timeSpentSeconds / 60)}m`}
                    </p>
                  </div>
                  <span className={cn(
                    'text-lg font-bold tabular-nums',
                    attempt.score >= 65 ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
                  )}>
                    {attempt.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
