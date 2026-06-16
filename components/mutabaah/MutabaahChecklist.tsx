// ============================================================
// components/mutabaah/MutabaahChecklist.tsx
// Form checklist ibadah harian — auto-save, optimistic update
// ============================================================

'use client'

import { useState }           from 'react'
import { useToggleMutabaah }  from '@/hooks/useMutabaah'
import { useOfflineStore }    from '@/stores/offlineStore'
import { useToast }           from '@/components/ui/Toast'
import { cn }                 from '@/lib/utils/cn'
import type { MutabaahItemWithStatus } from '@/lib/types/app'

interface MutabaahChecklistProps {
  items:      MutabaahItemWithStatus[]
  tanggal:    string
  percentage: number
  isLocked:   boolean
}

export function MutabaahChecklist({
  items,
  tanggal,
  percentage,
  isLocked,
}: MutabaahChecklistProps) {
  const { mutate: toggle, isPending } = useToggleMutabaah()
  const { isOnline }   = useOfflineStore()
  const { showToast, ToastComponent } = useToast()
  const [savingId, setSavingId] = useState<string | null>(null)

  const checkedCount = items.filter(i => i.is_checked).length

  function handleToggle(item: MutabaahItemWithStatus) {
    if (isLocked) {
      showToast('Mutabaah sudah terkunci setelah pukul 23:59', 'warning')
      return
    }

    setSavingId(item.id)

    toggle(
      { itemId: item.id, tanggal, isChecked: !item.is_checked },
      {
        onSuccess: (data) => {
          setSavingId(null)
          if (!isOnline || (data as { queued?: boolean })?.queued) {
            showToast('Tersimpan offline — akan disinkronkan saat online', 'info')
          }
        },
        onError: () => {
          setSavingId(null)
          showToast('Gagal menyimpan. Coba lagi.', 'error')
        },
      }
    )
  }

  return (
    <>
      {/* Progress Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-neutral-600">
            {checkedCount} dari {items.length} ibadah
          </span>
          <span className={cn(
            'text-sm font-bold tabular-nums',
            percentage >= 80 ? 'text-success' :
            percentage >= 50 ? 'text-warning' : 'text-danger'
          )}>
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              percentage >= 80 ? 'bg-success' :
              percentage >= 50 ? 'bg-warning' : 'bg-danger'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Status badge */}
      {isLocked && (
        <div className="mb-3 flex items-center gap-2 py-2 px-3 bg-neutral-100 rounded-md">
          <span className="text-neutral-400 text-sm">🔒</span>
          <p className="text-xs text-neutral-500">
            Mutabaah sudah terkunci. Data hari ini tidak dapat diubah.
          </p>
        </div>
      )}

      {!isOnline && (
        <div className="mb-3 flex items-center gap-2 py-2 px-3 bg-amber-50 border border-amber-200 rounded-md">
          <span className="text-amber-500 text-sm">📵</span>
          <p className="text-xs text-amber-700">
            Mode offline — perubahan akan tersinkron saat online kembali.
          </p>
        </div>
      )}

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <MutabaahItem
            key={item.id}
            item={item}
            isSaving={savingId === item.id}
            isLocked={isLocked}
            onToggle={() => handleToggle(item)}
            index={index}
          />
        ))}
      </div>

      {ToastComponent}
    </>
  )
}

// -----------------------------------------------------------
// Satu item checklist
// -----------------------------------------------------------
function MutabaahItem({
  item,
  isSaving,
  isLocked,
  onToggle,
  index,
}: {
  item:     MutabaahItemWithStatus
  isSaving: boolean
  isLocked: boolean
  onToggle: () => void
  index:    number
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isLocked || isSaving}
      className={cn(
        'w-full flex items-center gap-3 p-3.5 rounded-lg border transition-all duration-150',
        'active:scale-[0.98] text-left',
        'animate-in',
        item.is_checked
          ? 'bg-primary-50 border-primary-200'
          : 'bg-white border-neutral-200',
        isLocked && 'opacity-70 cursor-default',
        !isLocked && !isSaving && 'hover:border-primary-300 hover:shadow-sm'
      )}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Checkbox visual */}
      <div className={cn(
        'w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
        'transition-all duration-200',
        item.is_checked
          ? 'bg-primary-500 border-primary-500 animate-check-bounce'
          : 'border-neutral-300 bg-white',
        isSaving && 'opacity-50'
      )}>
        {isSaving ? (
          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : item.is_checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>

      {/* Label */}
      <span className={cn(
        'text-sm font-medium flex-1',
        item.is_checked ? 'text-primary-700' : 'text-neutral-700'
      )}>
        {item.nama_item}
      </span>

      {/* Status pill */}
      {item.is_checked && (
        <span className="text-xs text-primary-500 font-semibold bg-primary-100 px-2 py-0.5 rounded-full">
          ✓
        </span>
      )}
    </button>
  )
}
