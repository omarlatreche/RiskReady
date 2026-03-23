import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { loadAllQuestions } from '@/data/questions/loader'
import AttemptResults from '@/components/AttemptResults'

export default function MockResultsPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const attempts = await Promise.resolve(api.getAttempts())
      const attempt = attempts.find((a) => a.id === attemptId)
      if (!attempt) {
        setLoading(false)
        return
      }

      const allResponses = await Promise.resolve(api.getResponsesByAttempt(attemptId))
      const allQuestions = await loadAllQuestions()

      // Reconstruct questions list from saved questionIds or from responses
      let questions
      if (attempt.questionIds) {
        questions = attempt.questionIds
          .map((id) => allQuestions.find((q) => q.id === id))
          .filter(Boolean)
      } else {
        // Fallback: use response questionIds
        const responseIds = allResponses.map((r) => r.questionId)
        questions = allQuestions.filter((q) => responseIds.includes(q.id))
      }

      // Build responses map (keyed by questionId like QuizRunner uses)
      const responsesMap = {}
      for (const r of allResponses) {
        responsesMap[r.questionId] = r
      }

      const score = {
        correct: attempt.correctCount,
        total: attempt.totalQuestions,
        percentage: attempt.score,
        passed: attempt.score >= 65,
        timeSpentSeconds: attempt.timeSpentSeconds,
      }

      setData({ attempt, score, questions, responses: responsesMap })
      setLoading(false)
    }
    load()
  }, [attemptId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-6 h-6 border-[2.5px] border-primary-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400 rounded-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-surface-800 dark:text-surface-100 mb-2">Attempt not found</h1>
        <p className="text-surface-500 dark:text-surface-400 mb-4">This exam attempt could not be loaded.</p>
        <button
          onClick={() => navigate('/mock')}
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Back to Mock Exams
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/mock')}
          className="text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
        >
          &larr; Back to Mock Exams
        </button>
      </div>
      <AttemptResults
        score={data.score}
        questions={data.questions}
        responses={data.responses}
        mode="mock"
        showActions={false}
      />
    </div>
  )
}
