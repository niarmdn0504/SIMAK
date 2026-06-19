// ============================================================
// app/(staff)/wali-kelas/[siswaId]/WaliKelasSiswaClient.tsx
// Detail mutabaah siswa — read only untuk wali kelas
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn }        from '@/lib/utils/cn'
import { formatTanggal } from '@/lib/utils/date'

interface MutabaahItem {
  id:         string
  nama_item:  string
  is_checked: boolean
  parent_id?: string | null
  children?:  MutabaahItem[]
}

interface Props {
  siswa: {
    id:           string
    nama_lengkap: string
    nisn:         string
    photo_url:    string | null
    parent_name:  string | null
    parent_phone: string | null
    nama_kelas:   string
  }
  mutabaahItems: MutabaahItem[]
  percentage:    number
  isLocked:      boolean
  tanggal:       string
  tahfizLast:    { surah: string; ayat_awal: number | null; ayat_akhir: number | null; status: string; tanggal: string } | null
  wafaLast:      { jilid: string; halaman: number | null; status: string; tanggal: string } | null
  backHref?:     string
}

const TAHFIZ_STATUS_COLOR: Record<string, string> = {
  setoran_baru: 'bg-blue-100 text-blue-700',
  murajaah:     'bg-amber-100 text-amber-700',
  lulus:        'bg-green-100 text-green-700',
}
const TAHFIZ_STATUS_LABEL: Record<string, string> = {
  setoran_baru: 'Setoran Baru', murajaah: 'Murajaah', lulus: '✓ Lulus',
}
const WAFA_STATUS_COLOR: Record<string, string> = {
  naik: 'bg-green-100 text-green-700', lanjut: 'bg-blue-100 text-blue-700', mengulang: 'bg-amber-100 text-amber-700',
}
const WAFA_STATUS_LABEL: Record<string, string> = {
  naik: '↑ Naik', lanjut: '→ Lanjut', mengulang: '↩ Mengulang',
}

export function WaliKelasSiswaClient({
  siswa, mutabaahItems, percentage, isLocked, tanggal, tahfizLast, wafaLast, backHref = '/wali-kelas',
}: Props) {
  const router = useRouter()

  // Count leaf items only for progress
  const leafItems = mutabaahItems.flatMap(p =>
    p.children && p.children.length > 0 ? p.children : [p]
  )
  const checked = leafItems.filter(i => i.is_checked).length

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-4 py-4">
        <button
          onClick={() => router.push(backHref)}
          className="flex items-center gap-1.5 text-primary-600 text-sm font-medium mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Dashboard Kelas
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {siswa.photo_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={siswa.photo_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" />
              : <span className="text-primary-700 font-bold text-lg">{siswa.nama_lengkap.charAt(0)}</span>
            }
          </div>
          <div>
            <h2 className="font-bold text-neutral-800">{siswa.nama_lengkap}</h2>
            <p className="text-xs text-neutral-400">Kelas {siswa.nama_kelas} · NISN {siswa.nisn}</p>
            {siswa.parent_name && (
              <p className="text-xs text-neutral-400">Orang Tua: {siswa.parent_name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">

        {/* Mutabaah hari ini */}
        <section className="card animate-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-neutral-800">Mutabaah Hari Ini</h3>
            <div className="flex items-center gap-2">
              {isLocked && <span className="text-xs text-neutral-400">🔒 Terkunci</span>}
              <span className={cn(
                'text-xs font-bold px-2.5 py-1 rounded-full',
                percentage >= 80 ? 'bg-green-100 text-success' :
                percentage >= 50 ? 'bg-amber-100 text-warning' : 'bg-red-100 text-danger'
              )}>
                {percentage}%
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-400 mb-3">{formatTanggal(tanggal)}</p>

          {/* Progress bar */}
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                percentage >= 80 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-neutral-500 mb-4">
            {checked} dari {leafItems.length} ibadah terisi
          </p>

          {mutabaahItems.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Belum ada item mutabaah</p>
          ) : (
            <div className="space-y-2">
              {mutabaahItems.map(item => (
                <MutabaahItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Tahfiz terakhir */}
        <section className="card animate-in" style={{ animationDelay: '0.08s' }}>
          <h3 className="font-bold text-neutral-800 mb-3">📖 Tahfiz Terakhir</h3>
          {tahfizLast ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-800">{tahfizLast.surah}</p>
                {tahfizLast.ayat_awal && tahfizLast.ayat_akhir && (
                  <p className="text-xs text-neutral-500 mt-0.5">Ayat {tahfizLast.ayat_awal}–{tahfizLast.ayat_akhir}</p>
                )}
                <p className="text-xs text-neutral-400 mt-0.5">
                  {new Date(tahfizLast.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <span className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                TAHFIZ_STATUS_COLOR[tahfizLast.status] ?? 'bg-neutral-100 text-neutral-500'
              )}>
                {TAHFIZ_STATUS_LABEL[tahfizLast.status] ?? tahfizLast.status}
              </span>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">Belum ada data tahfiz</p>
          )}
        </section>

        {/* Wafa terakhir */}
        <section className="card animate-in" style={{ animationDelay: '0.12s' }}>
          <h3 className="font-bold text-neutral-800 mb-3">📚 Wafa Terakhir</h3>
          {wafaLast ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-800">{wafaLast.jilid}</p>
                {wafaLast.halaman && (
                  <p className="text-xs text-neutral-500 mt-0.5">Halaman {wafaLast.halaman}</p>
                )}
                <p className="text-xs text-neutral-400 mt-0.5">
                  {new Date(wafaLast.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <span className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                WAFA_STATUS_COLOR[wafaLast.status] ?? 'bg-neutral-100 text-neutral-500'
              )}>
                {WAFA_STATUS_LABEL[wafaLast.status] ?? wafaLast.status}
              </span>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">Belum ada data wafa</p>
          )}
        </section>

        {/* Kontak orang tua */}
        {siswa.parent_phone && (
          <section className="card animate-in" style={{ animationDelay: '0.16s' }}>
            <h3 className="font-bold text-neutral-800 mb-3">📱 Kontak Orang Tua</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-700">{siswa.parent_name ?? 'Orang Tua'}</p>
                <p className="text-xs text-neutral-500">{siswa.parent_phone}</p>
              </div>
              <a
                href={`https://wa.me/62${siswa.parent_phone.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.845L.057 23.882l6.198-1.627A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.17-1.395l-.37-.22-3.83 1.005.978-3.729-.244-.384A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

// ─── Mutabaah item row ──────────────────────────────
function MutabaahItemRow({ item }: { item: MutabaahItem }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  if (!hasChildren) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border',
          item.is_checked
            ? 'bg-primary-50 border-primary-200'
            : 'bg-neutral-50 border-neutral-200'
        )}
      >
        <div className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          item.is_checked
            ? 'bg-primary-500 border-primary-500'
            : 'border-neutral-300'
        )}>
          {item.is_checked && (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className={cn(
          'text-sm font-medium flex-1',
          item.is_checked ? 'text-primary-700' : 'text-neutral-500'
        )}>
          {item.nama_item}
        </span>
        {item.is_checked && (
          <span className="text-xs text-primary-500 font-semibold">✓</span>
        )}
      </div>
    )
  }

  const children   = item.children ?? []
  const childChecked = children.filter(c => c.is_checked).length
  const allDone = childChecked === children.length

  return (
    <div className={cn(
      'rounded-lg border overflow-hidden',
      allDone ? 'bg-primary-50 border-primary-200' : 'bg-white border-neutral-200'
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
          allDone ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-500'
        )}>
          {allDone ? '✓' : childChecked}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-800">{item.nama_item}</p>
          <p className="text-xs text-neutral-400">{childChecked} dari {children.length}</p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={cn('text-neutral-400 transition-transform', expanded && 'rotate-180')}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

          {expanded && (
            <div className="px-3 pb-3 space-y-1.5 border-t border-neutral-100 pt-1.5">
              {children.map(child => (
            <div
              key={child.id}
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg border',
                child.is_checked
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-neutral-50 border-neutral-200'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                child.is_checked ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'
              )}>
                {child.is_checked && (
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={cn(
                'text-sm font-medium flex-1',
                child.is_checked ? 'text-primary-700' : 'text-neutral-500'
              )}>
                {child.nama_item}
              </span>
              {child.is_checked && (
                <span className="text-xs text-primary-500 font-semibold">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
