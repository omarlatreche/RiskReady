import * as XLSX from 'xlsx'

export function exportProgressReport({ attempts, responses, reviewQueue, streakData, chapterAccuracy, chapters }) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Summary
  const mockAttempts = attempts.filter((a) => a.mode === 'mock')
  const avgScore = mockAttempts.length > 0
    ? Math.round(mockAttempts.reduce((s, a) => s + a.score, 0) / mockAttempts.length)
    : 0
  const passRate = mockAttempts.length > 0
    ? Math.round((mockAttempts.filter((a) => a.score >= 65).length / mockAttempts.length) * 100)
    : 0

  const summaryData = [
    ['Metric', 'Value'],
    ['Total Questions Answered', responses.length],
    ['Mock Exams Taken', mockAttempts.length],
    ['Average Mock Score', `${avgScore}%`],
    ['Pass Rate', `${passRate}%`],
    ['Current Streak', `${streakData.currentStreak} days`],
    ['Longest Streak', `${streakData.longestStreak} days`],
    ['Report Generated', new Date().toLocaleDateString('en-GB')],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

  // Sheet 2: Chapter Breakdown
  const chapterData = [['Chapter', 'Title', 'Answered', 'Correct', 'Accuracy %', 'Status']]
  for (const ch of chapters) {
    const acc = chapterAccuracy[ch.id]
    const pct = acc?.percentage ?? 0
    const total = acc?.total ?? 0
    const correct = acc?.correct ?? 0
    chapterData.push([
      `Ch ${ch.number}`,
      ch.title,
      total,
      correct,
      total > 0 ? pct : '',
      total > 0 ? (pct >= 65 ? 'Pass' : 'Fail') : 'No data',
    ])
  }
  const chapterSheet = XLSX.utils.aoa_to_sheet(chapterData)
  chapterSheet['!cols'] = [{ wch: 8 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, chapterSheet, 'Chapter Breakdown')

  // Sheet 3: Mock History
  const mockData = [['Attempt #', 'Date', 'Score %', 'Correct', 'Total', 'Time (min)', 'Result']]
  const sortedMocks = [...mockAttempts].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  sortedMocks.forEach((a, i) => {
    mockData.push([
      i + 1,
      new Date(a.completedAt).toLocaleDateString('en-GB'),
      a.score,
      a.correctCount,
      a.totalQuestions,
      a.timeSpentSeconds ? Math.floor(a.timeSpentSeconds / 60) : '',
      a.score >= 65 ? 'Pass' : 'Fail',
    ])
  })
  const mockSheet = XLSX.utils.aoa_to_sheet(mockData)
  mockSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 8 }]
  XLSX.utils.book_append_sheet(wb, mockSheet, 'Mock History')

  // Sheet 4: Review Queue
  const unresolvedQueue = reviewQueue.filter((q) => !q.resolved)
  const reviewData = [['Question ID', 'Chapter', 'Date Added', 'Times Reviewed', 'Status']]
  for (const item of unresolvedQueue) {
    reviewData.push([
      item.questionId,
      item.chapter,
      item.addedAt ? new Date(item.addedAt).toLocaleDateString('en-GB') : '',
      item.reviewCount || 0,
      item.resolved ? 'Resolved' : 'Pending',
    ])
  }
  const reviewSheet = XLSX.utils.aoa_to_sheet(reviewData)
  reviewSheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, reviewSheet, 'Review Queue')

  XLSX.writeFile(wb, 'RiskReady_Progress_Report.xlsx')
}

export function exportQuestionAnalysis({ responses, questions, chapters }) {
  const wb = XLSX.utils.book_new()

  // Build question lookup
  const questionMap = {}
  for (const q of questions) {
    questionMap[q.id] = q
  }

  // Build chapter name lookup
  const chapterNames = {}
  for (const ch of chapters) {
    chapterNames[ch.id] = ch.title
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  const data = [['Question ID', 'Chapter', 'Chapter Title', 'Question (truncated)', 'Your Answer', 'Correct Answer', 'Confidence', 'Result', 'Date']]

  const confidenceLabels = { 1: 'Low', 2: 'Medium', 3: 'High' }

  for (const r of responses) {
    const q = questionMap[r.questionId]
    if (!q) continue

    const stem = q.stem.length > 80 ? q.stem.slice(0, 77) + '...' : q.stem
    data.push([
      r.questionId,
      r.chapter,
      chapterNames[r.chapter] || r.chapter,
      stem,
      optionLabels[r.answer] || '—',
      optionLabels[q.answer],
      confidenceLabels[r.confidence] || r.confidence,
      r.correct ? 'Correct' : 'Incorrect',
      r.answeredAt ? new Date(r.answeredAt).toLocaleDateString('en-GB') : '',
    ])
  }

  const sheet = XLSX.utils.aoa_to_sheet(data)
  sheet['!cols'] = [
    { wch: 12 }, { wch: 8 }, { wch: 35 }, { wch: 60 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, sheet, 'Question Analysis')

  XLSX.writeFile(wb, 'RiskReady_Question_Analysis.xlsx')
}
