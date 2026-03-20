import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

export default function LearningVelocity({ responses }) {
  // Build last 14 days of activity
  const now = new Date()
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const countByDay = {}
  for (const r of responses) {
    if (!r.answeredAt) continue
    const day = new Date(r.answeredAt).toISOString().slice(0, 10)
    countByDay[day] = (countByDay[day] || 0) + 1
  }

  const data = days.map((d) => ({
    day: d.slice(5), // MM-DD
    count: countByDay[d] || 0,
  }))

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100">Learning Velocity</h2>
        <span className="text-xs text-surface-500 tabular-nums">{total} questions in 14 days</span>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: 'var(--color-surface-400)' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1c1917',
              border: '1px solid #4a453e',
              borderRadius: '6px',
              fontSize: '11px',
            }}
            formatter={(value) => [`${value} questions`, 'Answered']}
          />
          <Bar
            dataKey="count"
            fill="#0d9470"
            radius={[2, 2, 0, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
