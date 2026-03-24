import { cn } from '@/lib/utils'

function getScoreColor(score) {
  if (score >= 65) return { stroke: '#16a34a', text: 'text-success-600 dark:text-success-500', label: 'Ready', bg: 'bg-success-50 dark:bg-success-500/10' }
  if (score >= 40) return { stroke: '#d97706', text: 'text-warning-600 dark:text-warning-500', label: 'Getting There', bg: 'bg-warning-50 dark:bg-warning-500/10' }
  return { stroke: '#dc2626', text: 'text-danger-600 dark:text-danger-500', label: 'Keep Practicing', bg: 'bg-danger-50 dark:bg-danger-500/10' }
}

export default function ReadinessGauge({ score, breakdown }) {
  const color = getScoreColor(score)

  // Semicircle gauge parameters
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  // Arc from left to right (180° semicircle curving upward)
  const startX = cx - radius
  const startY = cy
  const endX = cx + radius
  const endY = cy
  // strokeDasharray/offset for progress
  const halfCircumference = Math.PI * radius
  const progress = Math.max(0, Math.min(100, score))
  const dashOffset = halfCircumference - (progress / 100) * halfCircumference

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
      <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100 mb-4">Exam Readiness</h2>

      <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 sm:gap-8 lg:gap-12">
        {/* SVG Gauge */}
        <div className="shrink-0">
          <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
            {/* Background track */}
            <path
              d={`M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
              fill="none"
              className="stroke-surface-200 dark:stroke-surface-700"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d={`M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
              fill="none"
              stroke={color.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={halfCircumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
            {/* Score text */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              style={{ fontSize: '36px', fontWeight: 700 }}
              fill={color.stroke}
            >
              {score}
            </text>
            {/* Label */}
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              className="fill-surface-500 dark:fill-surface-400"
              style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              {color.label}
            </text>
          </svg>
        </div>

        {/* Breakdown */}
        <div className="w-full grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
          <BreakdownItem label="Mock Average" value={breakdown.mockComponent} weight="35%" />
          <BreakdownItem label="Coverage" value={breakdown.coverageComponent} weight="25%" />
          <BreakdownItem label="Weakest Area" value={breakdown.weakestComponent} weight="20%" />
          <BreakdownItem label="Trend" value={breakdown.trendComponent} weight="20%" />
        </div>
      </div>
    </div>
  )
}

function BreakdownItem({ label, value, weight }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium text-surface-600 dark:text-surface-400">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-surface-800 dark:text-surface-200">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[9px] text-surface-400 dark:text-surface-500">{weight}</span>
    </div>
  )
}
