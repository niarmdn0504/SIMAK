// ============================================================
// lib/utils/date.ts
// Helper tanggal dengan timezone WIB (Asia/Jakarta)
// ============================================================

import { format, parseISO, startOfMonth, endOfMonth,
         eachDayOfInterval, subDays, isToday, isSameDay } from 'date-fns'
import { id } from 'date-fns/locale'

export const WIB_TIMEZONE = 'Asia/Jakarta'

// -----------------------------------------------------------
// Hari ini dalam format YYYY-MM-DD (WIB)
// -----------------------------------------------------------
export function getTodayWIB(): string {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: WIB_TIMEZONE,
  })
}

// -----------------------------------------------------------
// Locked after: 23:59:59 WIB pada tanggal tertentu
// Return dalam format ISO string UTC
// -----------------------------------------------------------
export function getLockedAfter(tanggal: string): string {
  // tanggal: YYYY-MM-DD
  // 23:59:59 WIB = 16:59:59 UTC
  return `${tanggal}T16:59:59Z`
}

// -----------------------------------------------------------
// Cek apakah entry masih bisa diedit (before locked_after)
// -----------------------------------------------------------
export function isEditable(lockedAfter: string): boolean {
  return new Date() <= new Date(lockedAfter)
}

// -----------------------------------------------------------
// Format tanggal untuk tampilan Indonesia
// -----------------------------------------------------------
export function formatTanggal(
  tanggal: string,
  fmt = 'EEEE, d MMMM yyyy'
): string {
  return format(parseISO(tanggal), fmt, { locale: id })
}

export function formatTanggalPendek(tanggal: string): string {
  return format(parseISO(tanggal), 'd MMM yyyy', { locale: id })
}

export function formatHariPendek(tanggal: string): string {
  return format(parseISO(tanggal), 'EEE', { locale: id })
}

// -----------------------------------------------------------
// Generate array 7 hari terakhir (termasuk hari ini)
// -----------------------------------------------------------
export function getLast7Days(): string[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i)
    return d.toLocaleDateString('sv-SE', { timeZone: WIB_TIMEZONE })
  })
}

// -----------------------------------------------------------
// Generate semua hari dalam satu bulan
// -----------------------------------------------------------
export function getDaysInMonth(year: number, month: number): string[] {
  const start = startOfMonth(new Date(year, month - 1))
  const end   = endOfMonth(new Date(year, month - 1))
  return eachDayOfInterval({ start, end }).map(d =>
    d.toLocaleDateString('sv-SE', { timeZone: WIB_TIMEZONE })
  )
}

// -----------------------------------------------------------
// Nama bulan Indonesia
// -----------------------------------------------------------
export function getNamaBulan(month: number): string {
  const bulan = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return bulan[month] ?? ''
}
