import { cn } from '@/lib/utils'

function getCellColor(pct) {
  if (pct === null) return 'bg-surface-50 dark:bg-surface-800/50 text-surface-400'
  if (pct >= 65) return 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-500'
  if (pct >= 40) return 'bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-500'
  return 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-500'
}

export default function DifficultyHeatmap({ responses, questions, chapters }) {
  // Build a map: questionId -> difficulty
  const difficultyMap = {}
  for (const q of questions) {
    difficultyMap[q.id] = q.difficulty
  }

  // Cross-tabulate: chapter x difficulty -> { correct, total }
  const grid = {}
  for (const r of responses) {
    const diff = difficultyMap[r.questionId]
    if (!diff) continue
    const key = `${r.chapter}:${diff}`
    if (!grid[key]) grid[key] = { correct: 0, total: 0 }
    grid[key].total++
    if (r.correct) grid[key].correct++
  }

  const difficulties = ['easy', 'medium', 'hard']

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
      <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-4">Accuracy by Difficulty</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-surface-500 pb-2 pr-3">Chapter</th>
              {difficulties.map((d) => (
                <th key={d} className="text-center text-xs font-medium text-surface-500 pb-2 px-2 capitalize">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chapters.map((ch) => (
              <tr key={ch.id}>
                <td className="text-xs font-medium text-surface-700 dark:text-surface-300 py-1.5 pr-3 whitespace-nowrap">
                  Ch {ch.number}
                </td>
                {difficulties.map((d) => {
                  const cell = grid[`${ch.id}:${d}`]
                  const pct = cell && cell.total > 0 ? Math.round((cell.correct / cell.total) * 100) : null
                  return (
                    <td key={d} className="px-1 py-1.5">
                      <div className={cn(
                        'rounded px-2 py-1 text-center text-xs font-semibold tabular-nums',
                        getCellColor(pct)
                      )}>
                        {pct !== null ? `${pct}%` : '—'}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-3 text-[10px] text-surface-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20" /> 65%+</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/20" /> 40-64%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20" /> &lt;40%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700" /> No data</span>
      </div>
    </div>
  )
}
