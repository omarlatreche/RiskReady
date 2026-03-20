import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '@/store/useQuizStore'
import QuestionBlock from './QuestionBlock'
import Timer from './Timer'
import { cn } from '@/lib/utils'
import chapters from '@/data/chapters.json'
import { IconGrid, IconFlag, IconDownload } from '@/components/Icons'
import { api } from '@/lib/api'

export default function QuizRunner({ onComplete }) {
  const navigate = useNavigate()
  const {
    mode, questions, currentIndex, responses, isSubmitted, score,
    timeRemaining, flagged,
    answerQuestion, setConfidence, nextQuestion, prevQuestion,
    goToQuestion, toggleFlag, submitExam, resetQuiz,
  } = useQuizStore()

  const [showPalette, setShowPalette] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [pendingConfidence, setPendingConfidence] = useState({})

  const currentQuestion = questions[currentIndex]
  if (!currentQuestion) return null

  const currentResponse = responses[currentQuestion.id]
  const showFeedback = mode === 'practice' && currentResponse != null
  const answeredCount = Object.keys(responses).length
  const progress = Math.round((answeredCount / questions.length) * 100)

  const handleSubmit = () => {
    if (mode === 'mock' && !confirmSubmit) {
      setConfirmSubmit(true)
      return
    }
    submitExam()
    onComplete?.()
  }

  if (isSubmitted && score) {
    // Calculate chapter breakdown
    const chapterBreakdown = {}
    for (const q of questions) {
      if (!chapterBreakdown[q.chapter]) chapterBreakdown[q.chapter] = { correct: 0, total: 0 }
      chapterBreakdown[q.chapter].total += 1
      const resp = responses[q.id]
      if (resp?.correct) chapterBreakdown[q.chapter].correct += 1
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score banner */}
        <div className={cn(
          'rounded-2xl p-8 text-center border animate-fade-in-up',
          score.passed
            ? 'bg-gradient-to-br from-success-50 to-primary-50 dark:from-success-500/10 dark:to-primary-500/10 border-success-200/60 dark:border-success-500/20'
            : 'bg-gradient-to-br from-danger-50 to-warning-50 dark:from-danger-500/10 dark:to-warning-500/10 border-danger-200/60 dark:border-danger-500/20'
        )}>
          <div className={cn(
            'text-5xl font-bold mb-2 tracking-tight',
            score.passed ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
          )}>
            {score.percentage}%
          </div>
          <div className={cn(
            'text-lg font-semibold mb-1',
            score.passed ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
          )}>
            {score.passed ? 'PASSED' : 'NOT PASSED'}
          </div>
          <p className="text-surface-600 dark:text-surface-400">
            {score.correct} of {score.total} correct (pass mark: 65%)
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {mode === 'mock' && (
            <button
              onClick={() => { resetQuiz(); navigate('/mock') }}
              className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
            >
              Try Again
            </button>
          )}
          {mode === 'practice' && (
            <button
              onClick={() => { resetQuiz(); navigate('/practice') }}
              className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
            >
              Back to Practice
            </button>
          )}
          {mode === 'review' && (
            <button
              onClick={() => { resetQuiz(); navigate('/review') }}
              className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
            >
              Back to Review
            </button>
          )}
          <button
            onClick={() => { resetQuiz(); navigate('/analytics') }}
            className="flex-1 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 font-semibold text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 transition-all duration-150"
          >
            View Analytics
          </button>
        </div>

        {/* Download buttons */}
        {mode === 'mock' && (
          <div className="flex gap-3">
            <button
              onClick={async () => {
                const { generateResultsPDF } = await import('@/lib/pdf')
                generateResultsPDF({ score, questions, responses, chapterBreakdown, chapters })
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
            >
              <IconDownload className="w-4 h-4" />
              Download Results PDF
            </button>
            {score.passed && (
              <button
                onClick={async () => {
                  const { generateCertificatePDF } = await import('@/lib/pdf')
                  const profile = api.getProfile()
                  generateCertificatePDF({ userName: profile?.displayName || 'Guest', score: score.percentage, completedAt: new Date().toISOString() })
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium shadow-sm shadow-primary-900/20 hover:from-primary-700 hover:to-primary-800 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
              >
                <IconDownload className="w-4 h-4" />
                Download Certificate
              </button>
            )}
          </div>
        )}

        {/* Chapter breakdown */}
        {Object.keys(chapterBreakdown).length > 1 && (
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
            <h3 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-4">Chapter Breakdown</h3>
            <div className="space-y-3">
              {chapters
                .filter((ch) => chapterBreakdown[ch.id])
                .map((ch) => {
                  const { correct, total } = chapterBreakdown[ch.id]
                  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
                  return (
                    <div key={ch.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-surface-700 dark:text-surface-300">
                          Ch {ch.number}: {ch.title}
                        </span>
                        <span className={cn(
                          'text-sm font-semibold tabular-nums',
                          pct >= 65 ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
                        )}>
                          {correct}/{total}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500 ease-out',
                            pct >= 65 ? 'bg-success-500' : pct > 0 ? 'bg-warning-500' : 'bg-danger-500'
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Question Review */}
        <div className="space-y-4">
          <h3 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100">Question Review</h3>
          {questions.map((q, i) => {
            const resp = responses[q.id]
            return (
              <div key={q.id} className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-4">
                <QuestionBlock
                  question={q}
                  selectedAnswer={resp?.answer}
                  confidence={resp?.confidence}
                  showFeedback={true}
                  disabled={true}
                  questionNumber={i + 1}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-surface-950/80 backdrop-blur-lg shadow-sm shadow-surface-900/[0.04] px-4 py-3 mb-6 -mx-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums text-surface-600 dark:text-surface-400">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-32 h-2 bg-surface-200/60 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-surface-500 tabular-nums">{answeredCount} answered</span>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'mock' && <Timer timeRemaining={timeRemaining} />}

          <button
            onClick={() => setShowPalette(!showPalette)}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400 transition-colors"
          >
            <IconGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question palette */}
      {showPalette && (
        <div className="mb-6 bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-4 animate-scale-in origin-top-right">
          <div className="grid grid-cols-10 gap-1.5">
            {questions.map((q, i) => {
              const resp = responses[q.id]
              const isCurrent = i === currentIndex
              const isFlagged = flagged.has(i)
              return (
                <button
                  key={q.id}
                  onClick={() => { goToQuestion(i); setShowPalette(false) }}
                  className={cn(
                    'w-8 h-8 rounded text-xs font-medium transition-all duration-150 relative',
                    isCurrent && 'ring-2 ring-primary-500',
                    resp ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-500',
                  )}
                >
                  {i + 1}
                  {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-warning-500 rounded-full" />}
                </button>
              )
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-surface-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-100 dark:bg-primary-500/20" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-surface-100 dark:bg-surface-800" /> Unanswered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning-500" /> Flagged</span>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
        <QuestionBlock
          question={currentQuestion}
          selectedAnswer={currentResponse?.answer}
          confidence={currentResponse?.confidence || pendingConfidence[currentQuestion.id] || 2}
          onAnswer={(answer) => {
            const conf = currentResponse?.confidence || pendingConfidence[currentQuestion.id] || 2
            answerQuestion(currentQuestion.id, answer, conf)
          }}
          onConfidenceChange={(conf) => {
            if (currentResponse) {
              setConfidence(currentQuestion.id, conf)
            } else {
              setPendingConfidence((prev) => ({ ...prev, [currentQuestion.id]: conf }))
            }
          }}
          showFeedback={showFeedback}
          disabled={mode === 'mock' ? isSubmitted : (showFeedback)}
          questionNumber={currentIndex + 1}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFlag(currentIndex)}
            className={cn(
              'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5',
              flagged.has(currentIndex)
                ? 'bg-warning-500/10 text-warning-600 dark:text-warning-500'
                : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
          >
            <IconFlag className="w-4 h-4" />
            {flagged.has(currentIndex) ? 'Flagged' : 'Flag'}
          </button>

          {(mode === 'mock' || mode === 'review') && answeredCount === questions.length && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
            >
              Submit Exam
            </button>
          )}
          {mode === 'mock' && answeredCount < questions.length && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2.5 rounded-lg border border-danger-200/50 dark:border-danger-500/30 text-danger-600 dark:text-danger-400 text-sm font-medium hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all duration-150"
            >
              Submit Early
            </button>
          )}
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={nextQuestion}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
          >
            Next
          </button>
        ) : mode === 'practice' ? (
          <button
            onClick={() => submitExam()}
            className="px-4 py-2.5 rounded-lg bg-success-600 text-white text-sm font-semibold shadow-sm hover:bg-success-500 active:translate-y-px transition-all duration-150"
          >
            Finish
          </button>
        ) : (
          <div className="w-20" />
        )}
      </div>

      {/* Confirm submit modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-sm w-full border border-surface-200/60 dark:border-surface-800/80 shadow-lg animate-scale-in">
            <h3 className="text-lg font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-2">
              Submit Exam?
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">
              You have answered {answeredCount} of {questions.length} questions.
            </p>
            {answeredCount < questions.length && (
              <p className="text-sm text-warning-600 dark:text-warning-500 mb-4">
                {questions.length - answeredCount} questions are unanswered and will be marked incorrect.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmSubmit(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmSubmit(false); submitExam(); onComplete?.() }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 transition-all duration-150"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
