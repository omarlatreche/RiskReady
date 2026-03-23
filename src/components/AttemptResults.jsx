import { cn } from '@/lib/utils'
import chapters from '@/data/chapters.json'
import { IconDownload } from '@/components/Icons'
import { api } from '@/lib/api'
import QuestionBlock from './QuestionBlock'

export default function AttemptResults({ score, questions, responses, mode, showActions = true, onTryAgain, onBack }) {
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
        {score.timeSpentSeconds != null && (
          <p className="text-xs text-surface-400 mt-1">
            Time: {Math.floor(score.timeSpentSeconds / 60)}m {score.timeSpentSeconds % 60}s
          </p>
        )}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-3">
          {onTryAgain && (
            <button
              onClick={onTryAgain}
              className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-sm shadow-primary-900/20 hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:translate-y-px transition-all duration-150"
            >
              {mode === 'mock' ? 'Try Again' : mode === 'practice' ? 'Back to Practice' : 'Back to Review'}
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 font-semibold text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 transition-all duration-150"
            >
              View Analytics
            </button>
          )}
        </div>
      )}

      {/* Download buttons */}
      {mode === 'mock' && (
        <div className="flex gap-3">
          <button
            onClick={async () => {
              try {
                const { generateResultsPDF } = await import('@/lib/pdf')
                generateResultsPDF({ score, questions, responses, chapterBreakdown, chapters })
              } catch (e) {
                console.error('PDF generation failed:', e)
              }
            }}
            className="flex-1 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-300 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <IconDownload className="w-4 h-4" />
            Download Results PDF
          </button>
          {score.passed && (
            <button
              onClick={async () => {
                try {
                  const { generateCertificatePDF } = await import('@/lib/pdf')
                  const profile = await Promise.resolve(api.getProfile())
                  generateCertificatePDF({ userName: profile?.displayName || 'Guest', score: score.percentage, completedAt: new Date().toISOString() })
                } catch (e) {
                  console.error('Certificate generation failed:', e)
                }
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
