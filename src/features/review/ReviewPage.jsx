import { useState, useEffect } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import { api } from '@/lib/api'
import QuizRunner from '@/components/QuizRunner'
import chapters from '@/data/chapters.json'
import { loadAllQuestions } from '@/data/questions/loader'
import { cn } from '@/lib/utils'
import { IconCheck } from '@/components/Icons'

export default function ReviewPage() {
  const { mode, startReview, resetQuiz } = useQuizStore()
  const [reviewQueue, setReviewQueue] = useState([])
  const [allQuestions, setAllQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChapter, setSelectedChapter] = useState(null)

  useEffect(() => {
    async function load() {
      const rawQueue = await Promise.resolve(api.getReviewQueue())
      const queue = rawQueue.filter((q) => !q.resolved)
      const questions = await loadAllQuestions()
      setReviewQueue(queue)
      setAllQuestions(questions)
      setLoading(false)
    }
    load()
  }, [mode])

  const startReviewSession = (chapterId = null) => {
    let queueIds = reviewQueue.map((q) => q.questionId)
    if (chapterId) {
      queueIds = reviewQueue
        .filter((q) => q.chapter === chapterId)
        .map((q) => q.questionId)
    }

    const questions = allQuestions.filter((q) => queueIds.includes(q.id))
    if (questions.length) {
      startReview(questions)
    }
  }

  if (mode === 'review') {
    return (
      <div>
        <QuizRunner onComplete={() => {}} />
        <div className="text-center mt-6">
          <button
            onClick={resetQuiz}
            className="text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
          >
            Back to Review Overview
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-6 h-6 border-[2.5px] border-primary-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400 rounded-full" />
      </div>
    )
  }

  // Group by chapter
  const byChapter = {}
  for (const item of reviewQueue) {
    if (!byChapter[item.chapter]) byChapter[item.chapter] = []
    byChapter[item.chapter].push(item)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-surface-100">Review</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Retake questions you got wrong. Get them right to remove them from the queue.
        </p>
      </div>

      {reviewQueue.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-50 dark:bg-success-500/10 mb-4">
              <IconCheck className="w-7 h-7 text-success-500" />
            </div>
            <p className="text-surface-700 dark:text-surface-300 text-lg mb-2 font-medium">No questions to review</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Practice more to add incorrect questions to your review queue.
            </p>
          </div>
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
            <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-3">How it works</h2>
            <ul className="space-y-2.5 text-sm text-surface-600 dark:text-surface-400">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Questions you get wrong in Practice or Mock are added here automatically
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Answer them correctly in Review to remove them from the queue
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Focus on your weakest chapters to improve fastest
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => startReviewSession()}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl px-6 py-4 font-semibold text-lg shadow-md shadow-primary-900/20 hover:from-primary-700 hover:to-primary-800 active:translate-y-px transition-all duration-150"
          >
            Review All ({reviewQueue.length} questions)
          </button>

          <div className="space-y-3">
            <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100">By Chapter</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(byChapter).map(([chId, items]) => {
              const chapter = chapters.find((c) => c.id === chId)
              return (
                <button
                  key={chId}
                  onClick={() => startReviewSession(chId)}
                  className="w-full bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-4 text-left hover:shadow-md hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                      Ch {chapter?.number}
                    </span>
                    <p className="font-medium text-sm text-surface-800 dark:text-surface-100">
                      {chapter?.title}
                    </p>
                  </div>
                  <span className="bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-500 text-sm font-semibold tabular-nums px-3 py-1 rounded-full">
                    {items.length}
                  </span>
                </button>
              )
            })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
