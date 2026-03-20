import { create } from 'zustand'
import { api } from '@/lib/api'
import { calculateScore, analyzeConfidence, getWeakChapters, detectOverconfidence } from '@/lib/scoring'
import { calculateReadinessScore } from '@/lib/readiness'

export const useAnalyticsStore = create((set, get) => ({
  attempts: [],
  responses: [],
  streakData: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
  chapterAccuracy: {},
  confidenceMatrix: null,
  weakChapters: [],
  overconfidentChapters: [],
  readinessScore: null,

  loadAnalytics() {
    const attempts = api.getAttempts()
    const responses = api.getResponses()
    const streakData = api.getStreakData()

    const { byChapter } = calculateScore(responses)
    const confidenceMatrix = analyzeConfidence(responses)
    const weakChapters = getWeakChapters(responses)
    const overconfidentChapters = detectOverconfidence(responses)

    const mockAttempts = attempts.filter((a) => a.mode === 'mock')
    const mockAverage = mockAttempts.length > 0
      ? Math.round(mockAttempts.reduce((s, a) => s + a.score, 0) / mockAttempts.length)
      : 0

    const readinessScore = calculateReadinessScore({
      mockAverage,
      chapterAccuracy: byChapter,
      responses,
      attempts,
    })

    set({
      attempts,
      responses,
      streakData,
      chapterAccuracy: byChapter,
      confidenceMatrix,
      weakChapters,
      overconfidentChapters,
      readinessScore,
    })
  },

  getMockAttempts() {
    return get().attempts.filter((a) => a.mode === 'mock')
  },

  getAverageScore() {
    const mockAttempts = get().getMockAttempts()
    if (!mockAttempts.length) return 0
    const sum = mockAttempts.reduce((acc, a) => acc + a.score, 0)
    return Math.round(sum / mockAttempts.length)
  },

  getTotalQuestionsAnswered() {
    return get().responses.length
  },

  getPassRate() {
    const mockAttempts = get().getMockAttempts()
    if (!mockAttempts.length) return 0
    const passed = mockAttempts.filter((a) => a.score >= 65).length
    return Math.round((passed / mockAttempts.length) * 100)
  },

  getDailyVelocity(days = 14) {
    const responses = get().responses
    const now = new Date()
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      result.push(d.toISOString().slice(0, 10))
    }
    const countByDay = {}
    for (const r of responses) {
      if (!r.answeredAt) continue
      const day = new Date(r.answeredAt).toISOString().slice(0, 10)
      countByDay[day] = (countByDay[day] || 0) + 1
    }
    return result.map((d) => ({ day: d, count: countByDay[d] || 0 }))
  },
}))
