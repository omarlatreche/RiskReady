import { formatTime, cn } from '@/lib/utils'

export default function Timer({ timeRemaining }) {
  const isWarning = timeRemaining <= 300 && timeRemaining > 60
  const isDanger = timeRemaining <= 60

  return (
    <div
      className={cn(
        'font-mono text-lg font-bold px-4 py-2 rounded-lg tabular-nums tracking-widest transition-colors',
        isDanger && 'bg-danger-500/10 text-danger-600 dark:text-danger-500 animate-[pulseSubtle_1.5s_ease-in-out_infinite]',
        isWarning && 'bg-warning-500/10 text-warning-600 dark:text-warning-500',
        !isWarning && !isDanger && 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
      )}
    >
      {formatTime(timeRemaining)}
    </div>
  )
}
