// ============================================================
// stores/offlineStore.ts
// State untuk antrian offline dan status sinkronisasi
// ============================================================

import { create } from 'zustand'
import type { OfflineQueueItem } from '@/lib/types/app'

interface OfflineState {
  isOnline:      boolean
  isSyncing:     boolean
  pendingCount:  number
  lastSyncAt:    Date | null

  setOnline:       (online: boolean) => void
  setSyncing:      (syncing: boolean) => void
  setPendingCount: (count: number) => void
  setLastSyncAt:   (date: Date) => void
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline:     true,
  isSyncing:    false,
  pendingCount: 0,
  lastSyncAt:   null,

  setOnline:       (isOnline)     => set({ isOnline }),
  setSyncing:      (isSyncing)    => set({ isSyncing }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSyncAt:   (lastSyncAt)   => set({ lastSyncAt }),
}))
