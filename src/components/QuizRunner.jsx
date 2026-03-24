import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizStore } from '@/store/useQuizStore'
import QuestionBlock from './QuestionBlock'
import Timer from './Timer'
import AttemptResults from './AttemptResults'
import { cn } from '@/lib/utils'
import { IconGrid, IconFlag } from '@/components/Icons'

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
    const navTarget = mode === 'mock' ? '/mock' : mode === 'practice' ? '/practice' : '/review'
    return (
      <AttemptResults
        score={score}
        questions={questions}
        responses={responses}
        mode={mode}
        onTryAgain={() => { resetQuiz(); navigate(navTarget) }}
        onBack={() => { resetQuiz(); navigate('/analytics') }}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-surface-950/80 backdrop-blur-lg shadow-sm shadow-surface-900/[0.04] px-4 py-2.5 mb-6 -mx-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold tabular-nums text-surface-700 dark:text-surface-300 shrink-0">
              {currentIndex + 1}<span className="text-surface-400 dark:text-surface-500 font-normal">/{questions.length}</span>
            </span>
            <div className="flex-1 h-1.5 bg-surface-200/60 dark:bg-surface-800 rounded-full overflow-hidden min-w-[60px]">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] text-surface-400 tabular-nums shrink-0 hidden sm:inline">{answeredCount} answered</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {mode === 'mock' && <Timer timeRemaining={timeRemaining} />}
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400 transition-colors"
            >
              <IconGrid className="w-4 h-4" />
            </button>
          </div>
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
