const STORAGE_KEYS = {
  ATTEMPTS: 'riskready_attempts',
  RESPONSES: 'riskready_responses',
  REVIEW_QUEUE: 'riskready_review_queue',
  STREAKS: 'riskready_streaks',
  PROFILE: 'riskready_profile',
}

function getStore(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const api = {
  // Attempts
  getAttempts() {
    return getStore(STORAGE_KEYS.ATTEMPTS) || []
  },

  saveAttempt(attempt) {
    const attempts = this.getAttempts()
    attempts.push(attempt)
    setStore(STORAGE_KEYS.ATTEMPTS, attempts)
    return attempt
  },

  // Responses
  getResponses() {
    return getStore(STORAGE_KEYS.RESPONSES) || []
  },

  getResponsesByAttempt(attemptId) {
    return this.getResponses().filter((r) => r.attemptId === attemptId)
  },

  saveResponses(responses) {
    const existing = this.getResponses()
    setStore(STORAGE_KEYS.RESPONSES, [...existing, ...responses])
  },

  // Review Queue
  getReviewQueue() {
    return getStore(STORAGE_KEYS.REVIEW_QUEUE) || []
  },

  addToReviewQueue(questionId, chapter) {
    const queue = this.getReviewQueue()
    if (!queue.find((q) => q.questionId === questionId)) {
      queue.push({
        questionId,
        chapter,
        addedAt: new Date().toISOString(),
        timesReviewed: 0,
        resolved: false,
      })
      setStore(STORAGE_KEYS.REVIEW_QUEUE, queue)
    }
  },

  removeFromReviewQueue(questionId) {
    const queue = this.getReviewQueue().filter(
      (q) => q.questionId !== questionId
    )
    setStore(STORAGE_KEYS.REVIEW_QUEUE, queue)
  },

  markReviewed(questionId) {
    const queue = this.getReviewQueue().map((q) =>
      q.questionId === questionId
        ? { ...q, timesReviewed: q.timesReviewed + 1 }
        : q
    )
    setStore(STORAGE_KEYS.REVIEW_QUEUE, queue)
  },

  // Streaks
  getStreakData() {
    return (
      getStore(STORAGE_KEYS.STREAKS) || {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        history: [],
      }
    )
  },

  updateStreak() {
    const data = this.getStreakData()
    const today = new Date().toISOString().split('T')[0]

    if (data.lastActiveDate === today) return data

    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0]

    if (data.lastActiveDate === yesterday) {
      data.currentStreak += 1
    } else {
      data.currentStreak = 1
    }

    data.longestStreak = Math.max(data.longestStreak, data.currentStreak)
    data.lastActiveDate = today

    if (!data.history.includes(today)) {
      data.history.push(today)
    }

    setStore(STORAGE_KEYS.STREAKS, data)
    return data
  },

  // Profile
  getProfile() {
    return (
      getStore(STORAGE_KEYS.PROFILE) || {
        displayName: 'Guest',
        isGuest: true,
      }
    )
  },

  setProfile(profile) {
    setStore(STORAGE_KEYS.PROFILE, profile)
  },

  // Clear all data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  },
}
