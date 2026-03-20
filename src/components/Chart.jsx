import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'

export function ChapterAccuracyChart({ data }) {
  if (!data || !data.length) {
    return <EmptyChart message="No data yet" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1c1917',
            border: '1px solid #4a453e',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value, name, props) => {
            const { correct, total } = props.payload
            if (total > 0) {
              return [`${value}% (${correct}/${total} questions)`, 'Accuracy']
            }
            return [`${value}%`, 'Accuracy']
          }}
        />
        <Bar dataKey="accuracy" fill="#0d9470" radius={[4, 4, 0, 0]} />
        {/* Pass mark line */}
        <CartesianGrid horizontal={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ScoreHistoryChart({ data }) {
  if (!data || !data.length) {
    return <EmptyChart message="No mock exams taken yet" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1c1917',
            border: '1px solid #4a453e',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#0d9470"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Score %"
        />
        {/* Pass mark reference line */}
        <Line
          type="monotone"
          dataKey="passmark"
          stroke="#dc2626"
          strokeDasharray="5 5"
          strokeWidth={1}
          dot={false}
          name="Pass Mark (65%)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-[300px] text-surface-400 dark:text-surface-600 text-sm">
      {message}
    </div>
  )
}
