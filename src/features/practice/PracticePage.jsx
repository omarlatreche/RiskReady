import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import chapters from '@/data/chapters.json'
import { api } from '@/lib/api'
import { calculateScore } from '@/lib/scoring'
import { loadAllQuestions } from '@/data/questions/loader'
import { cn } from '@/lib/utils'

export default function PracticePage() {
  const navigate = useNavigate()
  const [chapterStats, setChapterStats] = useState({})
  const [questionCounts, setQuestionCounts] = useState({})

  useEffect(() => {
    const responses = api.getResponses()
    const { byChapter } = calculateScore(responses)
    setChapterStats(byChapter)

    loadAllQuestions().then((allQ) => {
      const counts = {}
      for (const q of allQ) {
        counts[q.chapter] = (counts[q.chapter] || 0) + 1
      }
      setQuestionCounts(counts)
    })
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">Practice</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Select a chapter to practice or try a random mix across all topics.
        </p>
      </div>

      <button
        onClick={() => navigate('/practice/random')}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl px-6 py-4 font-semibold text-lg shadow-md shadow-primary-900/20 hover:from-primary-700 hover:to-primary-800 active:translate-y-px transition-all duration-150"
      >
        Random Mix — All Chapters
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((ch, i) => {
          const stats = chapterStats[ch.id]
          const accuracy = stats?.percentage ?? null
          const totalAvailable = questionCounts[ch.id] || 0
          const attempted = stats?.total ?? 0
          const coverage = totalAvailable > 0 ? Math.round((attempted / totalAvailable) * 100) : 0

          return (
            <button
              key={ch.id}
              onClick={() => navigate(`/practice/${ch.slug}`)}
              className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-5 text-left hover:shadow-md hover:shadow-surface-900/[0.06] hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:-translate-y-0.5 transition-all duration-200 ease-out group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded">
                  Ch {ch.number}
                </span>
                {stats && (
                  <span className={cn(
                    'text-xs font-semibold tabular-nums px-2 py-0.5 rounded',
                    accuracy >= 65 ? 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-500' : 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-500'
                  )}>
                    {stats.correct}/{stats.total} correct ({accuracy}%)
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-surface-800 dark:text-surface-100 text-sm tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {ch.title}
              </h3>
              <p className="text-xs text-surface-500 mt-1">
                {totalAvailable} questions &middot; {ch.subsections.length} learning outcomes
              </p>
              {/* Progress bar shows coverage (attempted/available), not accuracy */}
              <div className="mt-3 w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
                  style={{ width: `${coverage}%` }}
                />
              </div>
              <p className="text-[10px] text-surface-400 mt-1 tabular-nums">
                {attempted}/{totalAvailable} attempted
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
