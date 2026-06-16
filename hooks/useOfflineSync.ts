// ============================================================
// hooks/useOfflineSync.ts
// Deteksi online/offline + sync antrian IndexedDB ke server
// ============================================================

'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient }         from '@tanstack/react-query'
import { useOfflineStore }        from '@/stores/offlineStore'
import { getAllQueued, dequeueItem } from '@/lib/utils/offline'

export function useOfflineSync() {
  const { setOnline, setSyncing, setPendingCount, setLastSyncAt } =
    useOfflineStore()
  const queryClient = useQueryClient()

  // -----------------------------------------------------------
  // Flush IndexedDB queue ke server
  // -----------------------------------------------------------
  const syncQueue = useCallback(async () => {
    const items = await getAllQueued()
    if (items.length === 0) return

    setSyncing(true)
    let syncedCount = 0

    for (const item of items) {
      try {
        const res = await fetch('/api/parent/mutabaah', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            itemId:    item.itemId,
            tanggal:   item.tanggal,
            isChecked: item.isChecked,
          }),
        })

        if (res.ok) {
          await dequeueItem(item.id)
          syncedCount++
        }
      } catch {
        // Biarkan di queue, coba lagi next time
      }
    }

    setSyncing(false)
    setLastSyncAt(new Date())

    if (syncedCount > 0) {
      // Refresh data setelah sync
      queryClient.invalidateQueries({ queryKey: ['mutabaah'] })
      setPendingCount(items.length - syncedCount)
    }
  }, [setSyncing, setLastSyncAt, setPendingCount, queryClient])

  // -----------------------------------------------------------
  // Update pending count dari IndexedDB
  // -----------------------------------------------------------
  const refreshPendingCount = useCallback(async () => {
    const items = await getAllQueued()
    setPendingCount(items.length)
  }, [setPendingCount])

  // -----------------------------------------------------------
  // Setup event listener online/offline
  // -----------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      syncQueue()
    }

    const handleOffline = () => {
      setOnline(false)
    }

    // Set initial state
    setOnline(navigator.onLine)
    refreshPendingCount()

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline, syncQueue, refreshPendingCount])

  return { syncQueue, refreshPendingCount }
}
