// ============================================================
// components/tahfiz/TahfizForm.tsx
// Form input setoran tahfiz baru
// ============================================================

'use client'

import { useState }      from 'react'
import { SurahPicker }   from './SurahPicker'
import { useAddTahfiz }  from '@/hooks/useTahfiz'
import { useToast }      from '@/components/ui/Toast'
import { TAHFIZ_STATUS } from '@/lib/constants/wafa'
import { getTodayWIB }   from '@/lib/utils/date'
import { cn }            from '@/lib/utils/cn'

interface TahfizFormProps {
  siswaId:   string
  onSuccess: () => void
  onCancel:  () => void
}

export function TahfizForm({ siswaId, onSuccess, onCancel }: TahfizFormProps) {
  const [surah,     setSurah]     = useState('')
  const [ayatAwal,  setAyatAwal]  = useState('')
  const [ayatAkhir, setAyatAkhir] = useState('')
  const [status,    setStatus]    = useState<'setoran_baru' | 'murajaah' | 'lulus'>('setoran_baru')
  const [catatan,   setCatatan]   = useState('')
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  const { mutate: addTahfiz, isPending } = useAddTahfiz()
  const { showToast, ToastComponent }    = useToast()

  function validate() {
    const e: Record<string, string> = {}
    if (!surah) e.surah = 'Pilih surah terlebih dahulu'
    if (ayatAwal && ayatAkhir && Number(ayatAkhir) < Number(ayatAwal)) {
      e.ayat = 'Ayat akhir harus ≥ ayat awal'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    addTahfiz(
      {
        siswaId,
        tanggal:   getTodayWIB(),
        surah,
        ayatAwal:  ayatAwal  ? Number(ayatAwal)  : null,
        ayatAkhir: ayatAkhir ? Number(ayatAkhir) : null,
        status,
        catatan,
      },
      {
        onSuccess: () => {
          showToast('Setoran berhasil disimpan', 'success')
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
        {/* Surah */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            Surah <span className="text-danger">*</span>
          </label>
          <SurahPicker value={surah} onChange={setSurah} error={errors.surah} />
        </div>

        {/* Ayat */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            Rentang Ayat <span className="text-neutral-400 font-normal">(opsional)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={ayatAwal}
              onChange={e => setAyatAwal(e.target.value)}
              placeholder="Ayat awal"
              className="flex-1 h-11 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <span className="text-neutral-400 text-sm font-medium">–</span>
            <input
              type="number"
              min={1}
              value={ayatAkhir}
              onChange={e => setAyatAkhir(e.target.value)}
              placeholder="Ayat akhir"
              className="flex-1 h-11 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          {errors.ayat && <p className="text-xs text-danger mt-1">{errors.ayat}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
            Status <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TAHFIZ_STATUS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value as typeof status)}
                className={cn(
                  'py-2.5 px-2 rounded-md text-xs font-semibold border-2 transition-all text-center',
                  status === s.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                )}
              >
                <span className="block text-base mb-0.5">{s.icon}</span>
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
            placeholder="Contoh: makharijul huruf perlu diperbaiki..."
            rows={3}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-md border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
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
