import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuizStore } from '@/store/useQuizStore'
import QuizRunner from '@/components/QuizRunner'
import chapters from '@/data/chapters.json'
import { shuffleArray } from '@/lib/utils'
import { loadAllQuestions } from '@/data/questions/loader'

export default function PracticeSession() {
  const { chapterId } = useParams()
  const navigate = useNavigate()
  const { mode, startPractice } = useQuizStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const allQuestions = await loadAllQuestions()

        let filtered
        if (chapterId === 'random') {
          filtered = shuffleArray(allQuestions).slice(0, 20)
        } else {
          const chapter = chapters.find((c) => c.slug === chapterId)
          if (!chapter) {
            setError('Chapter not found')
            return
          }
          filtered = shuffleArray(allQuestions.filter((q) => q.chapter === chapter.id))
          if (!filtered.length) {
            setError(`No questions available for ${chapter.title} yet.`)
            return
          }
        }

        startPractice(filtered)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [chapterId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-6 h-6 border-[2.5px] border-primary-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400 rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-500 dark:text-surface-400 mb-4">{error}</p>
        <button
          onClick={() => navigate('/practice')}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
        >
          Back to Practice
        </button>
      </div>
    )
  }

  if (mode !== 'practice') return null

  return <QuizRunner onComplete={() => {}} />
}
