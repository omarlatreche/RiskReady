import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Area, AreaChart, Cell,
} from 'recharts'

const tooltipStyle = {
  backgroundColor: 'rgba(15, 15, 15, 0.95)',
  border: 'none',
  borderRadius: '10px',
  fontSize: '12px',
  padding: '10px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
}

function getBarColor(value) {
  if (value >= 65) return '#0d9470'
  if (value >= 40) return '#d97706'
  return '#dc2626'
}

export function ChapterAccuracyChart({ data }) {
  if (!data || !data.length) {
    return <EmptyChart message="No data yet" />
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="20%">
        <defs>
          <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
            <stop offset="100%" stopColor="#0d9470" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="barAmber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
            <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200, #e5e5e5)" opacity={0.4} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--color-surface-500, #737373)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: 'var(--color-surface-400, #a3a3a3)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <ReferenceLine y={65} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} label={{ value: 'Pass', position: 'right', fontSize: 9, fill: '#dc2626', opacity: 0.7 }} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'var(--color-surface-100, #f5f5f5)', opacity: 0.3 }}
          formatter={(value, name, props) => {
            const { correct, total } = props.payload
            if (total > 0) {
              return [`${value}% (${correct}/${total})`, 'Accuracy']
            }
            return [`${value}%`, 'Accuracy']
          }}
        />
        <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} animationDuration={800}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.accuracy === 0 && entry.total === 0 ? 'var(--color-surface-200, #e5e5e5)' :
                entry.accuracy >= 65 ? 'url(#barGreen)' :
                entry.accuracy >= 40 ? 'url(#barAmber)' : 'url(#barRed)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ScoreHistoryChart({ data }) {
  if (!data || !data.length) {
    return <EmptyChart message="No mock exams taken yet" />
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200, #e5e5e5)" opacity={0.4} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--color-surface-500, #737373)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: 'var(--color-surface-400, #a3a3a3)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <ReferenceLine y={65} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} label={{ value: '65% pass', position: 'right', fontSize: 9, fill: '#dc2626', opacity: 0.7 }} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            if (name === 'Pass Mark (65%)') return null
            return [`${value}%`, 'Score']
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#scoreGradient)"
          dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          animationDuration={800}
          name="Score %"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-[260px] text-surface-400 dark:text-surface-600">
      <svg className="w-10 h-10 mb-2 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-6 4 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  )
}
