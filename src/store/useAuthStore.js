import { create } from 'zustand'
import { api, setApiMode, setRemoteUserId, setRemoteOrgId } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { migrateLocalDataToSupabase } from '@/lib/migrate'

function activateRemote(userId) {
  setRemoteUserId(userId)
  setApiMode(true)
}

function deactivateRemote() {
  setRemoteUserId(null)
  setRemoteOrgId(null)
  setApiMode(false)
}

async function fetchOrgProfile() {
  if (typeof api.getOrgProfile !== 'function') return null
  try {
    return await api.getOrgProfile()
  } catch {
    return null
  }
}

function checkTrialExpired(profile, org) {
  // Org members never have a trial limit
  if (org) return false
  // No trial_ends_at means no limit (legacy or org member)
  if (!profile?.trialEndsAt) return false
  return new Date(profile.trialEndsAt) < new Date()
}

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  org: null,
  trialExpired: false,
  error: null,

  async init() {
    if (!isSupabaseConfigured()) {
      set({ user: null, loading: false })
      return
    }

    // Try to restore session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      activateRemote(session.user.id)
      const [profile, org] = await Promise.all([api.getProfile(), fetchOrgProfile()])
      if (org) setRemoteOrgId(org.id)
      set({
        user: { ...profile, email: session.user.email },
        org,
        trialExpired: checkTrialExpired(profile, org),
        loading: false,
      })
    } else {
      deactivateRemote()
      set({ user: null, loading: false })
    }

    // Listen for auth changes (sign in/out from other tabs, token refresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        activateRemote(session.user.id)
        const [profile, org] = await Promise.all([api.getProfile(), fetchOrgProfile()])
        if (org) setRemoteOrgId(org.id)
        set({
          user: { ...profile, email: session.user.email },
          org,
          trialExpired: checkTrialExpired(profile, org),
        })
      } else {
        deactivateRemote()
        set({ user: null, org: null, trialExpired: false })
      }
    })
  },

  async signUp(email, password, displayName) {
    if (!isSupabaseConfigured()) return
    set({ loading: true, error: null })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || 'User' },
      },
    })

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    if (data.user) {
      activateRemote(data.user.id)
      await migrateLocalDataToSupabase()
      const [profile, org] = await Promise.all([api.getProfile(), fetchOrgProfile()])
      if (org) setRemoteOrgId(org.id)
      set({
        user: { ...profile, email: data.user.email },
        org,
        trialExpired: checkTrialExpired(profile, org),
        loading: false,
        error: null,
      })
    }
  },

  async signIn(email, password) {
    if (!isSupabaseConfigured()) return
    set({ loading: true, error: null })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    if (data.user) {
      activateRemote(data.user.id)
      await migrateLocalDataToSupabase()
      const [profile, org] = await Promise.all([api.getProfile(), fetchOrgProfile()])
      if (org) setRemoteOrgId(org.id)
      set({
        user: { ...profile, email: data.user.email },
        org,
        trialExpired: checkTrialExpired(profile, org),
        loading: false,
        error: null,
      })
    }
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    deactivateRemote()
    set({ user: null, org: null, trialExpired: false, error: null })
  },

  async setDisplayName(name) {
    const currentProfile = await Promise.resolve(api.getProfile())
    const profile = { ...currentProfile, displayName: name }
    await Promise.resolve(api.setProfile(profile))
    set({ user: { ...get().user, displayName: name } })
  },

  async refreshOrg() {
    const org = await fetchOrgProfile()
    if (org) setRemoteOrgId(org.id)
    const profile = get().user
    set({ org, trialExpired: checkTrialExpired(profile, org) })
  },

  clearError() {
    set({ error: null })
  },
}))
