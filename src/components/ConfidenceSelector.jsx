import { cn } from '@/lib/utils'

const levels = [
  { value: 1, label: 'Low', color: 'bg-danger-500/10 text-danger-600 dark:text-danger-500 border-danger-500/30' },
  { value: 2, label: 'Medium', color: 'bg-warning-500/10 text-warning-600 dark:text-warning-500 border-warning-500/30' },
  { value: 3, label: 'High', color: 'bg-success-500/10 text-success-600 dark:text-success-500 border-success-500/30' },
]

export default function ConfidenceSelector({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-surface-500 dark:text-surface-400 mr-1">Confidence:</span>
      {levels.map((level) => (
        <button
          key={level.value}
          onClick={() => onChange?.(level.value)}
          disabled={disabled}
          className={cn(
            'px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-150',
            value === level.value
              ? level.color
              : 'bg-surface-50 dark:bg-surface-800 text-surface-400 border-surface-200 dark:border-surface-700',
            !disabled && 'hover:opacity-80 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {level.label}
        </button>
      ))}
    </div>
  )
}
