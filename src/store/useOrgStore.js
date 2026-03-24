import { create } from 'zustand'
import { api } from '@/lib/api'
import { calculateScore } from '@/lib/scoring'

export const useOrgStore = create((set, get) => ({
  members: [],
  invites: [],
  stats: null,
  loading: false,
  error: null,

  async loadDashboard() {
    set({ loading: true, error: null })
    try {
      const [members, { attempts, streaks }, invites] = await Promise.all([
        api.getOrgMembers(),
        api.getOrgMemberStats(),
        api.getOrgInvites(),
      ])

      // Compute per-member stats
      const memberStats = members.map((m) => {
        const memberAttempts = attempts.filter((a) => a.userId === m.id)
        const memberStreak = streaks.find((s) => s.userId === m.id)
        const mockAttempts = memberAttempts.filter((a) => a.mode === 'mock')
        const latestMock = mockAttempts[mockAttempts.length - 1]
        const avgScore = mockAttempts.length > 0
          ? Math.round(mockAttempts.reduce((sum, a) => sum + a.score, 0) / mockAttempts.length)
          : null
        const passCount = mockAttempts.filter((a) => a.score >= 65).length

        return {
          ...m,
          examsTaken: mockAttempts.length,
          latestScore: latestMock?.score ?? null,
          avgScore,
          passCount,
          lastActive: memberStreak?.lastActiveDate || latestMock?.completedAt || m.createdAt,
          currentStreak: memberStreak?.currentStreak || 0,
        }
      })

      // Aggregate team stats
      const allMockAttempts = attempts.filter((a) => a.mode === 'mock')
      const teamAvgScore = allMockAttempts.length > 0
        ? Math.round(allMockAttempts.reduce((sum, a) => sum + a.score, 0) / allMockAttempts.length)
        : 0
      const teamPassRate = allMockAttempts.length > 0
        ? Math.round(allMockAttempts.filter((a) => a.score >= 65).length / allMockAttempts.length * 100)
        : 0

      // Active this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      const activeThisWeek = memberStats.filter((m) => {
        const lastActive = m.lastActive ? String(m.lastActive).split('T')[0] : null
        return lastActive && lastActive >= weekAgoStr
      }).length

      set({
        members: memberStats,
        invites,
        stats: {
          totalMembers: members.length,
          teamAvgScore,
          teamPassRate,
          activeThisWeek,
          totalExams: allMockAttempts.length,
        },
        loading: false,
      })
    } catch (err) {
      console.error('loadDashboard error:', err)
      set({ loading: false, error: err.message })
    }
  },

  async inviteMember(email) {
    try {
      await api.inviteMember(email)
      const invites = await api.getOrgInvites()
      set({ invites })
      return { ok: true }
    } catch (err) {
      const msg = err.message?.includes('Seat limit')
        ? 'Your organisation has reached its seat limit. Contact support to add more seats.'
        : err.message?.includes('duplicate') || err.message?.includes('unique')
          ? 'This email has already been invited.'
          : err.message || 'Failed to send invite.'
      set({ error: msg })
      return { ok: false, error: msg }
    }
  },

  async revokeInvite(inviteId) {
    await api.revokeInvite(inviteId)
    set({ invites: get().invites.filter((i) => i.id !== inviteId) })
  },

  async removeMember(userId) {
    await api.removeMember(userId)
    set({ members: get().members.filter((m) => m.id !== userId) })
  },

  async loadMemberDetail(userId) {
    const [attempts, responses] = await Promise.all([
      api.getOrgMemberAttempts(userId),
      api.getOrgMemberResponses(userId),
    ])
    const mockAttempts = attempts.filter((a) => a.mode === 'mock')
    const score = calculateScore(responses)
    return { attempts: mockAttempts, responses, score }
  },
}))
