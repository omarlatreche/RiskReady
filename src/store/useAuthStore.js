import { create } from 'zustand'
import { api } from '@/lib/api'

export const useAuthStore = create((set) => ({
  user: null,
  isGuest: true,
  loading: false,
  org: null,

  init() {
    const profile = api.getProfile()
    set({ user: profile, isGuest: profile.isGuest !== false })
  },

  continueAsGuest() {
    const profile = { displayName: 'Guest', isGuest: true }
    api.setProfile(profile)
    set({ user: profile, isGuest: true })
  },

  setDisplayName(name) {
    const profile = { ...api.getProfile(), displayName: name }
    api.setProfile(profile)
    set({ user: profile })
  },

  signOut() {
    api.clearAll()
    set({ user: null, isGuest: true, org: null })
  },
}))
