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

export const useAuthStore = create((set, get) => ({
  user: null,
  isGuest: true,
  loading: true,
  org: null,
  error: null,

  async init() {
    if (!isSupabaseConfigured()) {
      // No Supabase — pure guest mode
      const profile = api.getProfile()
      set({ user: profile, isGuest: true, loading: false })
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
        isGuest: false,
        org,
        loading: false,
      })
    } else {
      deactivateRemote()
      const profile = api.getProfile()
      set({ user: profile, isGuest: true, loading: false })
    }

    // Listen for auth changes (sign in/out from other tabs, token refresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        activateRemote(session.user.id)
        const [profile, org] = await Promise.all([api.getProfile(), fetchOrgProfile()])
        if (org) setRemoteOrgId(org.id)
        set({
          user: { ...profile, email: session.user.email },
          isGuest: false,
          org,
        })
      } else {
        deactivateRemote()
        const profile = api.getProfile()
        set({ user: profile, isGuest: true, org: null })
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
      // Migrate any localStorage data to Supabase
      await migrateLocalDataToSupabase()
      const [profile, org] = await Promise.all([api.getProfile(), fetchOrgProfile()])
      if (org) setRemoteOrgId(org.id)
      set({
        user: { ...profile, email: data.user.email },
        isGuest: false,
        org,
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
      // Migrate any localStorage data to Supabase
      await migrateLocalDataToSupabase()
      const [profile, org] = await Promise.all([api.getProfile(), fetchOrgProfile()])
      if (org) setRemoteOrgId(org.id)
      set({
        user: { ...profile, email: data.user.email },
        isGuest: false,
        org,
        loading: false,
        error: null,
      })
    }
  },

  async signOut() {
    if (isSupabaseConfigured() && !get().isGuest) {
      await supabase.auth.signOut()
    }
    deactivateRemote()
    set({ user: null, isGuest: true, org: null, error: null })
  },

  continueAsGuest() {
    deactivateRemote()
    const profile = { displayName: 'Guest', isGuest: true }
    api.setProfile(profile)
    set({ user: profile, isGuest: true, error: null })
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
    set({ org })
  },

  clearError() {
    set({ error: null })
  },
}))
