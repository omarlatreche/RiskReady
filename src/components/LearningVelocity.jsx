import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts'

export default function LearningVelocity({ responses }) {
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
    day: d.slice(5),
    count: countByDay[d] || 0,
  }))

  const total = data.reduce((s, d) => s + d.count, 0)
  const maxCount = Math.max(1, ...data.map((d) => d.count))
  const avgPerDay = Math.round(total / 14)

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200/60 dark:border-surface-800/80 shadow-sm shadow-surface-900/[0.03] p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-semibold tracking-tight text-surface-800 dark:text-surface-100">Learning Velocity</h2>
        <div className="flex items-baseline gap-3">
          <span className="text-xs text-surface-400">{avgPerDay}/day avg</span>
          <span className="text-sm font-semibold tabular-nums text-primary-600 dark:text-primary-400">{total} questions</span>
        </div>
      </div>
      <p className="text-[11px] text-surface-400 dark:text-surface-500 mb-3">Last 14 days</p>

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="15%">
          <defs>
            <linearGradient id="velGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#0d9470" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: 'var(--color-surface-400, #a3a3a3)' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 15, 15, 0.95)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              padding: '8px 12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '2px' }}
            formatter={(value) => [`${value} questions`, null]}
            cursor={{ fill: 'var(--color-surface-100, #f5f5f5)', opacity: 0.2 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={600}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count === 0 ? 'var(--color-surface-200, #e5e5e5)' : 'url(#velGradient)'}
                opacity={entry.count === 0 ? 0.3 : 0.4 + 0.6 * (entry.count / maxCount)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
