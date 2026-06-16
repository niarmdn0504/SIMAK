// ============================================================
// components/wafa/WafaForm.tsx
// Form input progres Wafa
// ============================================================

'use client'

import { useState }     from 'react'
import { useAddWafa }   from '@/hooks/useWafa'
import { useToast }     from '@/components/ui/Toast'
import { WAFA_JILID, WAFA_STATUS } from '@/lib/constants/wafa'
import { getTodayWIB }  from '@/lib/utils/date'
import { cn }           from '@/lib/utils/cn'

interface WafaFormProps {
  siswaId:      string
  currentJilid: string | null
  onSuccess:    () => void
  onCancel:     () => void
}

export function WafaForm({ siswaId, currentJilid, onSuccess, onCancel }: WafaFormProps) {
  const [jilid,   setJilid]   = useState(currentJilid ?? 'Jilid 1')
  const [halaman, setHalaman] = useState('')
  const [status,  setStatus]  = useState<'naik' | 'lanjut' | 'mengulang'>('lanjut')
  const [catatan, setCatatan] = useState('')

  const { mutate: addWafa, isPending } = useAddWafa()
  const { showToast, ToastComponent }  = useToast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    addWafa(
      {
        siswaId,
        tanggal:  getTodayWIB(),
        jilid,
        halaman:  halaman ? Number(halaman) : null,
        status,
        catatan,
      },
      {
        onSuccess: () => {
          showToast('Progres Wafa berhasil disimpan', 'success')
          setTimeout(onSuccess, 800)
        },
        onError: (err) => {
          showToast(err.message ?? 'Gagal menyimpan', 'error')
        },
      }
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Jilid */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            Jilid / Level <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {WAFA_JILID.map(j => (
              <button
                key={j}
                type="button"
                onClick={() => setJilid(j)}
                className={cn(
                  'py-2 px-1 rounded-md text-xs font-semibold border-2 transition-all text-center',
                  jilid === j
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                )}
              >
                {j === "Al-Qur'an" ? "Al-Qur'an" : j.replace('Jilid ', 'J')}
              </button>
            ))}
          </div>
        </div>

        {/* Halaman */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            Halaman <span className="text-neutral-400 font-normal">(opsional)</span>
          </label>
          <input
            type="number"
            min={1}
            value={halaman}
            onChange={e => setHalaman(e.target.value)}
            placeholder="Nomor halaman"
            className="w-full h-11 px-4 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            Status <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WAFA_STATUS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value as typeof status)}
                className={cn(
                  'py-3 px-2 rounded-md text-xs font-semibold border-2 transition-all text-center',
                  status === s.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                )}
              >
                <span className="block text-lg mb-0.5">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            Catatan <span className="text-neutral-400 font-normal">(opsional)</span>
          </label>
          <textarea
            value={catatan}
            onChange={e => setCatatan(e.target.value)}
            placeholder="Catatan untuk orang tua..."
            rows={3}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-md border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'flex-1 h-11 rounded-md text-sm font-semibold text-white transition-all',
              isPending
                ? 'bg-neutral-300 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98]'
            )}
          >
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
      {ToastComponent}
    </>
  )
}
