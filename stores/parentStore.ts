// ============================================================
// stores/parentStore.ts
// Global state untuk sesi orang tua
// ============================================================

import { create } from 'zustand'

interface ParentState {
  siswaId:   string | null
  siswaName: string | null
  isLoaded:  boolean

  setSession: (siswaId: string, siswaName: string) => void
  clearSession: () => void
  setLoaded: () => void
}

export const useParentStore = create<ParentState>((set) => ({
  siswaId:   null,
  siswaName: null,
  isLoaded:  false,

  setSession: (siswaId, siswaName) => set({ siswaId, siswaName }),
  clearSession: () => set({ siswaId: null, siswaName: null }),
  setLoaded: () => set({ isLoaded: true }),
}))
