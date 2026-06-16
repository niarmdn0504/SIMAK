// ============================================================
// lib/utils/offline.ts
// IndexedDB queue untuk antrian mutabaah offline
// ============================================================

import type { OfflineQueueItem } from '@/lib/types/app'

const DB_NAME    = 'simak-offline-db'
const DB_VERSION = 1
const STORE_NAME = 'mutabaah-queue'

// -----------------------------------------------------------
// Buka / inisialisasi IndexedDB
// -----------------------------------------------------------
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db    = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
  })
}

// -----------------------------------------------------------
// Tambah atau update item di queue
// -----------------------------------------------------------
export async function queueMutabaah(item: OfflineQueueItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readwrite')
    const store   = tx.objectStore(STORE_NAME)
    const request = store.put(item)
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
  })
}

// -----------------------------------------------------------
// Ambil semua item di queue
// -----------------------------------------------------------
export async function getAllQueued(): Promise<OfflineQueueItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readonly')
    const store   = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as OfflineQueueItem[])
    request.onerror   = () => reject(request.error)
  })
}

// -----------------------------------------------------------
// Hapus item dari queue setelah berhasil sync
// -----------------------------------------------------------
export async function dequeueItem(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readwrite')
    const store   = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
  })
}

// -----------------------------------------------------------
// Kosongkan seluruh queue
// -----------------------------------------------------------
export async function clearQueue(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx      = db.transaction(STORE_NAME, 'readwrite')
    const store   = tx.objectStore(STORE_NAME)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
  })
}
