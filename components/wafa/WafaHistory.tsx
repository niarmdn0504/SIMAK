// ============================================================
// components/wafa/WafaHistory.tsx
// Riwayat progres Wafa dengan opsi hapus
// ============================================================

'use client'

import { useState }        from 'react'
import { useDeleteWafa }   from '@/hooks/useWafa'
import { useToast }        from '@/components/ui/Toast'
import { SkeletonCard }    from '@/components/ui/Skeleton'
import { WAFA_STATUS }     from '@/lib/constants/wafa'
import { cn }              from '@/lib/utils/cn'
import type { WafaEntry }  from '@/hooks/useWafa'

interface WafaHistoryProps {
  entries:   WafaEntry[]
  siswaId:   string
  isLoading: boolean
}

const JILID_ICON: Record<string, string> = {
  'Jilid 1': '①', 'Jilid 2': '②', 'Jilid 3': '③',
  'Jilid 4': '④', 'Jilid 5': '⑤', 'Jilid 6': '⑥',
  "Al-Qur'an": '📖',
}

const STATUS_MAP = Object.fromEntries(WAFA_STATUS.map(s => [s.value, s]))

export function WafaHistory({ entries, siswaId, isLoading }: WafaHistoryProps) {
  const { mutate: deleteWafa } = useDeleteWafa()
  const { showToast, ToastComponent } = useToast()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function handleDelete(id: string) {
    deleteWafa(
      { id, siswaId },
      {
        onSuccess: () => { showToast('Entry berhasil dihapus', 'success'); setConfirmId(null) },
        onError:   (err) => { showToast(err.message ?? 'Gagal menghapus', 'error'); setConfirmId(null) },
      }
    )
  }

  if (isLoading) return (
    <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}</div>
  )

  if (entries.length === 0) return (
    <div className="card text-center py-10">
      <p className="text-4xl mb-3">📚</p>
      <p className="text-sm font-semibold text-neutral-600">Belum ada riwayat Wafa</p>
      <p className="text-xs text-neutral-400 mt-1">Tap tombol di atas untuk menambah progres</p>
    </div>
  )

  return (
    <>
      <div className="space-y-3">
        {entries.map((entry, i) => {
          const statusInfo = STATUS_MAP[entry.status]
          return (
            <div key={entry.id} className="card animate-in" style={{ animationDelay: `${i * 0.04}s` }}>
              {confirmId === entry.id ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-700">Hapus entry ini?</p>
                  <p className="text-xs text-neutral-500">{entry.jilid} · Hal. {entry.halaman} · {entry.tanggal}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmId(null)} className="flex-1 py-2 text-xs font-semibold border border-neutral-200 rounded-md">Batal</button>
                    <button onClick={() => handleDelete(entry.id)} className="flex-1 py-2 text-xs font-semibold bg-danger text-white rounded-md">Ya, Hapus</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
                    {JILID_ICON[entry.jilid] ?? '📚'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">{entry.jilid}</p>
                    {entry.halaman && (
                      <p className="text-sm text-neutral-600">Halaman {entry.halaman}</p>
                    )}
                    {entry.catatan && (
                      <p className="text-xs text-neutral-500 mt-1 bg-neutral-50 rounded p-2 italic">&ldquo;{entry.catatan}&rdquo;</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', statusInfo?.color ?? 'bg-neutral-100 text-neutral-500')}>
                        {statusInfo?.icon} {statusInfo?.label ?? entry.status}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(entry.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {entry.guru_id && (
                        <span className="text-xs text-neutral-400">· Guru</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmId(entry.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-300 hover:text-danger hover:bg-red-50 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {ToastComponent}
    </>
  )
}
