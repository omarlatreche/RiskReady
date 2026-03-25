import { supabase } from './supabase'

function getUserId() {
  const session = supabase?.auth?.session?.() ?? null
  // supabase-js v2 uses getSession() which is async, but the session is cached
  // Access the cached user from the auth store
  const user = supabase?.auth?.getUser ? null : null
  // Use the synchronous session accessor
  return supabase?._currentSession?.user?.id ?? null
}

// We'll use a module-level cache for the user ID and org ID, set by the auth store
let _cachedUserId = null
let _cachedOrgId = null
export function setRemoteUserId(id) {
  _cachedUserId = id
}
export function setRemoteOrgId(id) {
  _cachedOrgId = id
}

function uid() {
  return _cachedUserId
}
function orgId() {
  return _cachedOrgId
}

// camelCase to snake_case key mapping for DB writes
function toSnake(obj) {
  const map = {
    questionId: 'question_id',
    attemptId: 'attempt_id',
    totalQuestions: 'total_questions',
    correctCount: 'correct_count',
    timeSpentSeconds: 'time_spent_seconds',
    startedAt: 'started_at',
    completedAt: 'completed_at',
    questionIds: 'question_ids',
    addedAt: 'added_at',
    timesReviewed: 'times_reviewed',
    currentStreak: 'current_streak',
    longestStreak: 'longest_streak',
    lastActiveDate: 'last_active_date',
    updatedAt: 'updated_at',
    displayName: 'display_name',
    answeredAt: 'answered_at',
  }
  const result = {}
  for (const [k, v] of Object.entries(obj)) {
    result[map[k] || k] = v
  }
  return result
}

// snake_case to camelCase key mapping for DB reads
function toCamel(obj) {
  if (!obj) return obj
  const map = {
    question_id: 'questionId',
    attempt_id: 'attemptId',
    total_questions: 'totalQuestions',
    correct_count: 'correctCount',
    time_spent_seconds: 'timeSpentSeconds',
    started_at: 'startedAt',
    completed_at: 'completedAt',
    question_ids: 'questionIds',
    added_at: 'addedAt',
    times_reviewed: 'timesReviewed',
    current_streak: 'currentStreak',
    longest_streak: 'longestStreak',
    last_active_date: 'lastActiveDate',
    updated_at: 'updatedAt',
    display_name: 'displayName',
    answered_at: 'answeredAt',
    user_id: 'userId',
    org_id: 'orgId',
    created_at: 'createdAt',
    max_seats: 'maxSeats',
    created_by: 'createdBy',
    invited_by: 'invitedBy',
  }
  const result = {}
  for (const [k, v] of Object.entries(obj)) {
    result[map[k] || k] = v
  }
  return result
}

export const remoteApi = {
  // Attempts
  async getAttempts() {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', uid())
      .order('completed_at', { ascending: true })
    if (error) { console.error('getAttempts error:', error.message || error); return [] }
    return data.map(toCamel)
  },

  async saveAttempt(attempt) {
    const row = toSnake(attempt)
    row.user_id = uid()
    row.org_id = orgId() || null
    const { error } = await supabase.from('attempts').insert(row)
    if (error) console.error('saveAttempt error:', error.message || error)
    return attempt
  },

  // Responses
  async getResponses() {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('user_id', uid())
      .order('answered_at', { ascending: true })
    if (error) { console.error('getResponses error:', error.message || error); return [] }
    return data.map(toCamel)
  },

  async getResponsesByAttempt(attemptId) {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('user_id', uid())
      .eq('attempt_id', attemptId)
    if (error) { console.error('getResponsesByAttempt error:', error.message || error); return [] }
    return data.map(toCamel)
  },

  async saveResponse(response) {
    const row = { ...toSnake(response), user_id: uid(), org_id: orgId() || null }
    if (typeof row.answered_at === 'number') {
      row.answered_at = new Date(row.answered_at).toISOString()
    }
    const { error } = await supabase.from('responses').insert(row)
    if (error) console.error('saveResponse error:', error.message || error)
  },

  async saveResponses(responses) {
    const rows = responses.map((r) => {
      const row = { ...toSnake(r), user_id: uid(), org_id: orgId() || null }
      if (typeof row.answered_at === 'number') {
        row.answered_at = new Date(row.answered_at).toISOString()
      }
      return row
    })
    const { error } = await supabase.from('responses').insert(rows)
    if (error) console.error('saveResponses error:', error.message || error)
  },

  // Review Queue
  async getReviewQueue() {
    const { data, error } = await supabase
      .from('review_queue')
      .select('*')
      .eq('user_id', uid())
    if (error) { console.error('getReviewQueue error:', error.message || error); return [] }
    return data.map(toCamel)
  },

  async addToReviewQueue(questionId, chapter) {
    const { error } = await supabase
      .from('review_queue')
      .upsert({
        user_id: uid(),
        org_id: orgId() || null,
        question_id: questionId,
        chapter,
        added_at: new Date().toISOString(),
        times_reviewed: 0,
        resolved: false,
      }, { onConflict: 'user_id,question_id' })
    if (error) console.error('addToReviewQueue error:', error.message || error)
  },

  async removeFromReviewQueue(questionId) {
    const { error } = await supabase
      .from('review_queue')
      .delete()
      .eq('user_id', uid())
      .eq('question_id', questionId)
    if (error) console.error('removeFromReviewQueue error:', error.message || error)
  },

  async markReviewed(questionId) {
    // First get current value, then increment
    const { data } = await supabase
      .from('review_queue')
      .select('times_reviewed')
      .eq('user_id', uid())
      .eq('question_id', questionId)
      .single()
    if (data) {
      await supabase
        .from('review_queue')
        .update({ times_reviewed: data.times_reviewed + 1 })
        .eq('user_id', uid())
        .eq('question_id', questionId)
    }
  },

  // Streaks
  async getStreakData() {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', uid())
      .single()
    if (error || !data) {
      return { currentStreak: 0, longestStreak: 0, lastActiveDate: null, history: [] }
    }
    return toCamel(data)
  },

  async updateStreak() {
    const data = await this.getStreakData()
    const today = new Date().toISOString().split('T')[0]

    if (data.lastActiveDate === today) return data

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

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

    const { error } = await supabase
      .from('streaks')
      .upsert({
        user_id: uid(),
        org_id: orgId() || null,
        current_streak: data.currentStreak,
        longest_streak: data.longestStreak,
        last_active_date: data.lastActiveDate,
        history: data.history,
        updated_at: new Date().toISOString(),
      })
    if (error) console.error('updateStreak error:', error.message || error)
    return data
  },

  // Profile
  async getProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid())
      .single()
    if (error || !data) {
      return { displayName: 'User', isGuest: false }
    }
    return { displayName: data.display_name, isGuest: false }
  },

  async setProfile(profile) {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: profile.displayName, updated_at: new Date().toISOString() })
      .eq('id', uid())
    if (error) console.error('setProfile error:', error.message || error)
  },

  // Clear all data (for authenticated user — removes all their data from Supabase)
  async clearAll() {
    const userId = uid()
    await Promise.all([
      supabase.from('attempts').delete().eq('user_id', userId),
      supabase.from('responses').delete().eq('user_id', userId),
      supabase.from('review_queue').delete().eq('user_id', userId),
      supabase.from('streaks').delete().eq('user_id', userId),
    ])
  },

  // --- Organisation methods ---

  async getOrgProfile() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id, role')
      .eq('id', uid())
      .single()
    if (!profile?.org_id) return null

    const { data: org } = await supabase
      .from('organisations')
      .select('*')
      .eq('id', profile.org_id)
      .single()
    if (!org) return null
    return { ...toCamel(org), role: profile.role }
  },

  async getOrgMembers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, org_id, role, created_at')
      .not('org_id', 'is', null)
    return (data || []).map(toCamel)
  },

  async getOrgMemberStats() {
    const { data: attempts } = await supabase
      .from('attempts')
      .select('*')
      .not('org_id', 'is', null)
    const { data: streaks } = await supabase
      .from('streaks')
      .select('*')
      .not('org_id', 'is', null)
    return {
      attempts: (attempts || []).map(toCamel),
      streaks: (streaks || []).map(toCamel),
    }
  },

  async getOrgMemberAttempts(userId) {
    const { data } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .not('org_id', 'is', null)
      .order('completed_at', { ascending: true })
    return (data || []).map(toCamel)
  },

  async getOrgMemberResponses(userId) {
    const { data } = await supabase
      .from('responses')
      .select('*')
      .eq('user_id', userId)
      .not('org_id', 'is', null)
      .order('answered_at', { ascending: true })
    return (data || []).map(toCamel)
  },

  async inviteMember(email) {
    const profile = await this.getOrgProfile()
    if (!profile) throw new Error('No org')
    const { error } = await supabase
      .from('org_invites')
      .insert({ org_id: profile.id, email, invited_by: uid() })
    if (error) { console.error('inviteMember error:', error.message || error); throw error }
  },

  async getOrgInvites() {
    const { data } = await supabase
      .from('org_invites')
      .select('*')
      .order('created_at', { ascending: false })
    return (data || []).map(toCamel)
  },

  async revokeInvite(inviteId) {
    const { error } = await supabase.from('org_invites').delete().eq('id', inviteId)
    if (error) console.error('revokeInvite error:', error.message || error)
  },

  async removeMember(userId) {
    const { error } = await supabase.from('profiles')
      .update({ org_id: null, role: 'user', updated_at: new Date().toISOString() })
      .eq('id', userId)
    if (error) console.error('removeMember error:', error.message || error)
  },
}
