import { create } from 'zustand'
import { api } from '@/lib/api'
import { generateId } from '@/lib/utils'

const MOCK_DURATION = 60 * 60 // 60 minutes in seconds

export const useQuizStore = create((set, get) => ({
  mode: null, // 'practice' | 'mock' | 'review'
  questions: [],
  currentIndex: 0,
  responses: {},
  isSubmitted: false,
  score: null,
  attemptId: null,

  // Timer state
  startedAt: null,
  duration: MOCK_DURATION,
  timeRemaining: MOCK_DURATION,
  timerInterval: null,

  // Flagged questions
  flagged: new Set(),

  startPractice(questions) {
    set({
      mode: 'practice',
      questions,
      currentIndex: 0,
      responses: {},
      isSubmitted: false,
      score: null,
      attemptId: generateId(),
      flagged: new Set(),
      startedAt: null,
      timerInterval: null,
    })
  },

  startMock(questions) {
    const now = Date.now()
    set({
      mode: 'mock',
      questions,
      currentIndex: 0,
      responses: {},
      isSubmitted: false,
      score: null,
      attemptId: generateId(),
      flagged: new Set(),
      startedAt: now,
      timeRemaining: MOCK_DURATION,
    })

    // Start timer
    const interval = setInterval(() => {
      const state = get()
      if (state.isSubmitted) {
        clearInterval(interval)
        return
      }
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000)
      const remaining = Math.max(0, MOCK_DURATION - elapsed)
      set({ timeRemaining: remaining })

      if (remaining <= 0) {
        clearInterval(interval)
        get().submitExam()
      }
    }, 1000)

    set({ timerInterval: interval })
  },

  startReview(questions) {
    set({
      mode: 'review',
      questions,
      currentIndex: 0,
      responses: {},
      isSubmitted: false,
      score: null,
      attemptId: generateId(),
      flagged: new Set(),
      startedAt: null,
      timerInterval: null,
    })
  },

  answerQuestion(questionId, answer, confidence = 2) {
    const { questions, responses } = get()
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    const correct = answer === question.answer

    set({
      responses: {
        ...responses,
        [questionId]: {
          questionId,
          chapter: question.chapter,
          answer,
          correct,
          confidence,
          answeredAt: Date.now(),
        },
      },
    })

    // Fire-and-forget review queue calls (works for both sync and async)
    const { mode } = get()
    if ((mode === 'practice' || mode === 'mock') && !correct) {
      void Promise.resolve(api.addToReviewQueue(questionId, question.chapter))
    }
    if (mode === 'review' && correct) {
      void Promise.resolve(api.removeFromReviewQueue(questionId))
    }
  },

  setConfidence(questionId, confidence) {
    const { responses } = get()
    if (responses[questionId]) {
      set({
        responses: {
          ...responses,
          [questionId]: { ...responses[questionId], confidence },
        },
      })
    }
  },

  nextQuestion() {
    const { currentIndex, questions } = get()
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 })
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  },

  prevQuestion() {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  },

  goToQuestion(index) {
    const { questions } = get()
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index })
    }
  },

  toggleFlag(index) {
    const { flagged } = get()
    const next = new Set(flagged)
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
    }
    set({ flagged: next })
  },

  async submitExam() {
    const { timerInterval, responses, questions, attemptId, mode, startedAt } = get()

    if (timerInterval) clearInterval(timerInterval)

    const responseList = Object.values(responses)
    const correct = responseList.filter((r) => r.correct).length
    const total = questions.length
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
    const timeSpent = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : null

    const score = { correct, total, percentage, passed: percentage >= 65, timeSpentSeconds: timeSpent }

    // Set submitted state immediately so UI updates
    set({ isSubmitted: true, score, timerInterval: null })

    // Save to backend (works for both sync localStorage and async Supabase)
    await Promise.resolve(api.saveAttempt({
      id: attemptId,
      mode,
      score: percentage,
      totalQuestions: total,
      correctCount: correct,
      timeSpentSeconds: timeSpent,
      startedAt: startedAt ? new Date(startedAt).toISOString() : null,
      completedAt: new Date().toISOString(),
      questionIds: questions.map((q) => q.id),
    }))

    await Promise.resolve(api.saveResponses(
      responseList.map((r) => ({
        ...r,
        attemptId,
      }))
    ))

    // Update streak (fire-and-forget)
    void Promise.resolve(api.updateStreak())
  },

  resetQuiz() {
    const { timerInterval } = get()
    if (timerInterval) clearInterval(timerInterval)
    set({
      mode: null,
      questions: [],
      currentIndex: 0,
      responses: {},
      isSubmitted: false,
      score: null,
      attemptId: null,
      startedAt: null,
      timerInterval: null,
      timeRemaining: MOCK_DURATION,
      flagged: new Set(),
    })
  },
}))
