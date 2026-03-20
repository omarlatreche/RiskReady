import chapters from '@/data/chapters.json'

export function calculateReadinessScore({ mockAverage, chapterAccuracy, responses, attempts }) {
  // Mock Average component (35%)
  const mockComponent = Math.min(100, mockAverage)

  // Chapter Coverage component (25%) — % of chapters with >= 10 answers
  const chapterCounts = {}
  for (const r of responses) {
    chapterCounts[r.chapter] = (chapterCounts[r.chapter] || 0) + 1
  }
  const coveredChapters = chapters.filter((ch) => (chapterCounts[ch.id] || 0) >= 10).length
  const coverageComponent = Math.round((coveredChapters / chapters.length) * 100)

  // Weakest Chapter component (20%) — lowest accuracy (penalizes gaps)
  const accuracies = Object.values(chapterAccuracy)
    .filter((a) => a.total > 0)
    .map((a) => a.percentage)
  const weakestComponent = accuracies.length > 0 ? Math.min(...accuracies) : 0

  // Trend Direction component (20%) — last 3 mocks vs previous 3
  const mockAttempts = attempts
    .filter((a) => a.mode === 'mock')
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))

  let trendComponent = 50 // neutral default
  if (mockAttempts.length >= 2) {
    const recent = mockAttempts.slice(-3)
    const previous = mockAttempts.slice(-6, -3)
    const recentAvg = recent.reduce((s, a) => s + a.score, 0) / recent.length
    if (previous.length > 0) {
      const prevAvg = previous.reduce((s, a) => s + a.score, 0) / previous.length
      if (recentAvg > prevAvg + 3) trendComponent = 100
      else if (recentAvg < prevAvg - 3) trendComponent = 20
      else trendComponent = 50
    } else {
      // Only recent mocks, check if above pass mark
      trendComponent = recentAvg >= 65 ? 75 : 30
    }
  }

  const score = Math.round(
    0.35 * mockComponent +
    0.25 * coverageComponent +
    0.20 * weakestComponent +
    0.20 * trendComponent
  )

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      mockComponent: Math.round(mockComponent),
      coverageComponent,
      weakestComponent: Math.round(weakestComponent),
      trendComponent,
    },
  }
}
