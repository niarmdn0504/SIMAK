'use client'

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import { useToast }        from '@/components/ui/Toast'
import { cn }              from '@/lib/utils/cn'

interface ItemData {
  id:        string
  nama_item: string
  parent_id: string | null
  urutan:    number
}

interface Props {
  kelas:            { id: string; nama_kelas: string }
  allItems:         ItemData[]
  initialActiveIds: string[]
}

export function KelasMutabaahForm({ kelas, allItems, initialActiveIds }: Props) {
  const router  = useRouter()
  const { showToast, ToastComponent } = useToast()
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set(initialActiveIds))
  const [saving, setSaving] = useState(false)

  const parentItems = allItems.filter(i => !i.parent_id)
  const childItems  = allItems.filter(i => i.parent_id)

  function toggle(id: string) {
    setActiveIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleParent(parentId: string) {
    const children = childItems.filter(c => c.parent_id === parentId)
    const allChecked = children.every(c => activeIds.has(c.id))
    setActiveIds(prev => {
      const next = new Set(prev)
      for (const c of children) {
        if (allChecked) next.delete(c.id)
        else next.add(c.id)
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/staff/kelas-mutabaah-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kelasId: kelas.id, itemIds: Array.from(activeIds) }),
      })
      if (res.ok) {
        showToast('Item mutabaah berhasil disimpan', 'success')
        router.push('/guru/atur-mutabaah')
      } else {
        showToast('Gagal menyimpan', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <button
        onClick={() => router.push('/guru/atur-mutabaah')}
        className="flex items-center gap-1.5 text-primary-600 text-sm font-medium mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Kembali
      </button>

      <h1 className="text-lg font-bold text-neutral-800 mb-1">Atur Item Mutabaah</h1>
      <p className="text-xs text-neutral-400 mb-4">Kelas {kelas.nama_kelas} — Centang item yang berlaku</p>

      <div className="space-y-3">
        {parentItems.map(parent => {
          const children = childItems.filter(c => c.parent_id === parent.id)
          const checkedChildren = children.filter(c => activeIds.has(c.id))
          const allChecked = children.length > 0 && checkedChildren.length === children.length
          const someChecked = checkedChildren.length > 0

          return (
            <div
              key={parent.id}
              className={cn(
                'rounded-lg border overflow-hidden',
                someChecked ? 'border-primary-200 bg-primary-50/30' : 'border-neutral-200'
              )}
            >
              {/* Parent header */}
              <div className="flex items-center gap-3 p-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                    allChecked ? 'bg-primary-500 text-white' : someChecked ? 'bg-primary-300 text-white' : 'bg-neutral-200 text-neutral-500'
                  )}
                >
                  {allChecked ? '✓' : checkedChildren.length || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">{parent.nama_item}</p>
                  <p className="text-xs text-neutral-400">{checkedChildren.length} dari {children.length} item</p>
                </div>
                {children.length > 0 && (
                  <button
                    onClick={() => toggleParent(parent.id)}
                    className="text-xs text-primary-600 font-medium hover:underline"
                  >
                    {allChecked ? 'Hapus semua' : 'Pilih semua'}
                  </button>
                )}
              </div>

              {/* Children */}
              {children.length > 0 && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-neutral-100 pt-1.5">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => toggle(child.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all',
                        activeIds.has(child.id)
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-white border-neutral-200'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        activeIds.has(child.id) ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'
                      )}>
                        {activeIds.has(child.id) && (
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        'text-sm font-medium flex-1',
                        activeIds.has(child.id) ? 'text-primary-700' : 'text-neutral-500'
                      )}>
                        {child.nama_item}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Items without children (leaf as direct child of parent) */}
              {children.length === 0 && (
                <div className="px-3 pb-3">
                  <button
                    onClick={() => toggle(parent.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all',
                      activeIds.has(parent.id)
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-white border-neutral-200'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      activeIds.has(parent.id) ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'
                    )}>
                      {activeIds.has(parent.id) && (
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={cn(
                      'text-sm font-medium flex-1',
                      activeIds.has(parent.id) ? 'text-primary-700' : 'text-neutral-500'
                    )}>
                      {parent.nama_item}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allItems.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-neutral-500 text-sm">Belum ada item mutabaah. Hubungi admin.</p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push('/guru/atur-mutabaah')}
          className="flex-1 h-11 rounded-xl border border-neutral-300 text-neutral-600 font-semibold text-sm hover:bg-neutral-50 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-11 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {ToastComponent}
    </div>
  )
}
