// ============================================================
// lib/constants/wafa.ts
// Konstanta level Wafa
// ============================================================

export const WAFA_JILID = [
  'Jilid 1',
  'Jilid 2',
  'Jilid 3',
  'Jilid 4',
  'Jilid 5',
  'Jilid 6',
  "Al-Qur'an",
] as const

export type WafaJilid = typeof WAFA_JILID[number]

export const WAFA_STATUS = [
  { value: 'naik',      label: 'Naik',      color: 'bg-green-100 text-green-700',  icon: '↑' },
  { value: 'lanjut',    label: 'Lanjut',    color: 'bg-blue-100 text-blue-700',    icon: '→' },
  { value: 'mengulang', label: 'Mengulang', color: 'bg-amber-100 text-amber-700',  icon: '↩' },
] as const

export const TAHFIZ_STATUS = [
  { value: 'setoran_baru', label: 'Setoran Baru', color: 'bg-blue-100 text-blue-700',   icon: '📝' },
  { value: 'murajaah',     label: 'Murajaah',     color: 'bg-amber-100 text-amber-700', icon: '🔄' },
  { value: 'lulus',        label: 'Lulus',         color: 'bg-green-100 text-green-700', icon: '✓'  },
] as const
