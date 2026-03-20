import { cn } from '@/lib/utils'
import ConfidenceSelector from './ConfidenceSelector'
import { IconCheck, IconX } from '@/components/Icons'
import scenarios from '@/data/scenarios/index.json'

export default function QuestionBlock({
  question,
  selectedAnswer,
  confidence,
  onAnswer,
  onConfidenceChange,
  showFeedback,
  disabled,
  questionNumber,
}) {
  if (!question?.stem || !question?.options) {
    return (
      <div className="p-6 text-center text-surface-500 dark:text-surface-400">
        Question data is unavailable.
      </div>
    )
  }

  const scenario = question.scenarioId
    ? scenarios.find((s) => s.id === question.scenarioId)
    : null

  const isCorrect = selectedAnswer === question.answer
  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-4">
      {scenario && (
        <div className="bg-primary-50/60 dark:bg-primary-500/10 border-l-[3px] border-l-primary-500 rounded-lg p-4">
          <h4 className="font-semibold text-primary-700 dark:text-primary-400 text-sm mb-1">
            Scenario: {scenario.title}
          </h4>
          <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
            {scenario.vignette}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-[15px] font-medium text-surface-800 dark:text-surface-100 leading-relaxed">
          {questionNumber != null && (
            <span className="text-primary-600 dark:text-primary-400 mr-2">
              Q{questionNumber}.
            </span>
          )}
          {question.stem}
        </h3>

        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectOption = question.answer === index
            const showCorrect = showFeedback && isCorrectOption
            const showWrong = showFeedback && isSelected && !isCorrect

            return (
              <button
                key={index}
                onClick={() => !disabled && onAnswer?.(index)}
                disabled={disabled && !showFeedback}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-150 flex items-start gap-3',
                  // Default state
                  !isSelected && !showFeedback &&
                    'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-500/5',
                  // Selected, no feedback
                  isSelected && !showFeedback &&
                    'border-primary-500 bg-primary-50 dark:bg-primary-500/10 dark:border-primary-500',
                  // Correct answer (feedback)
                  showCorrect &&
                    'border-success-500 bg-success-50 dark:bg-success-500/10 dark:border-success-500',
                  // Wrong answer (feedback)
                  showWrong &&
                    'border-danger-500 bg-danger-50 dark:bg-danger-500/10 dark:border-danger-500',
                  // Disabled
                  disabled && !showFeedback && 'opacity-60 cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-150',
                    isSelected && !showFeedback && 'bg-primary-600 text-white border-primary-600',
                    showCorrect && 'bg-success-500 text-white border-success-500',
                    showWrong && 'bg-danger-500 text-white border-danger-500',
                    !isSelected && !showFeedback && 'border-surface-300 dark:border-surface-600 text-surface-500 dark:text-surface-400',
                  )}
                >
                  {optionLabels[index]}
                </span>
                <span className="text-sm text-surface-700 dark:text-surface-200 pt-1 leading-relaxed">
                  {option}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-2">
        <ConfidenceSelector
          value={confidence}
          onChange={onConfidenceChange}
          disabled={disabled && !showFeedback}
        />
      </div>

      {showFeedback && question.explanation && (
        <div
          className={cn(
            'rounded-lg p-4 border',
            isCorrect
              ? 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/20'
              : 'bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/20'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            {isCorrect
              ? <IconCheck className="w-4 h-4 text-success-600 dark:text-success-500" />
              : <IconX className="w-4 h-4 text-danger-600 dark:text-danger-500" />
            }
            <span className={cn('text-sm font-semibold', isCorrect ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500')}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            {!isCorrect && (
              <span className="text-sm text-surface-600 dark:text-surface-400">
                — The correct answer is {optionLabels[question.answer]}
              </span>
            )}
          </div>
          <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
