'use client'

import { useState, useEffect, useMemo } from 'react'
import { useToast }            from '@/components/ui/Toast'
import { Breadcrumb }          from '@/components/ui/Breadcrumb'
import { cn }                  from '@/lib/utils/cn'

interface ItemRow {
  id:              string
  nama_item:       string
  parent_id:       string | null
  urutan:          number
  is_active:       boolean
  tahun_ajaran_id: string
  jumlah_kelas:    number
}

interface TahunItem { id: string; nama: string; is_active: boolean }

interface ItemWithChildren extends ItemRow {
  children: ItemRow[]
}

export default function AdminMutabaahItemsPage() {
  const [items,       setItems]       = useState<ItemRow[]>([])
  const [tahunList,   setTahunList]   = useState<TahunItem[]>([])
  const [selectedTahun, setSelectedTahun] = useState('')
  const [isLoading,   setIsLoading]   = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [editItem,    setEditItem]    = useState<ItemRow | null>(null)
  const [formNama,    setFormNama]    = useState('')
  const [formParent,  setFormParent]  = useState('')
  const [subItems,    setSubItems]    = useState<string[]>([''])
  const [formLoad,    setFormLoad]    = useState(false)
  const [confirmDel,  setConfirmDel]  = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  async function fetchData() {
    setIsLoading(true)
    const [iRes, tRes] = await Promise.all([
      fetch(`/api/admin/mutabaah-items${selectedTahun ? `?tahunId=${selectedTahun}` : ''}`),
      fetch('/api/admin/tahun-ajaran'),
    ])
    const [iData, tData] = await Promise.all([iRes.json(), tRes.json()])
    setItems(Array.isArray(iData) ? iData : [])
    setTahunList(Array.isArray(tData) ? tData : [])
    if (!selectedTahun && tData.length > 0) {
      const aktif = tData.find((t: any) => t.is_active)
      setSelectedTahun(aktif?.id ?? tData[0]?.id ?? '')
    }
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [selectedTahun])

  const groupedItems = useMemo(() => {
    const parents = items.filter(i => !i.parent_id && i.is_active)
    const children = items.filter(i => i.parent_id && i.is_active)
    return parents.map(p => ({
      ...p,
      children: children.filter(c => c.parent_id === p.id),
    }))
  }, [items])

  const inactiveItems = items.filter(i => !i.is_active)
  const parentItems = items.filter(i => !i.parent_id && i.is_active)

  function openAddForm(parentId?: string) {
    setEditItem(null)
    setFormNama('')
    setFormParent(parentId || '')
    setSubItems(parentId ? [] : [''])
    setShowForm(true)
  }

  function openEditForm(item: ItemRow) {
    setEditItem(item)
    setFormNama(item.nama_item)
    setFormParent(item.parent_id || '')
    setSubItems([])
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formNama.trim() || !selectedTahun) return
    setFormLoad(true)

    if (editItem) {
      // Edit existing item
      const res = await fetch(`/api/admin/mutabaah-items/${editItem.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaItem: formNama }),
      })
      if (res.ok) { showToast('Item diperbarui', 'success'); setShowForm(false); fetchData() }
      else showToast('Gagal memperbarui', 'error')
    } else if (formParent) {
      // Add sub-item to existing parent
      const res = await fetch('/api/admin/mutabaah-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaItem: formNama, tahunAjaranId: selectedTahun, parentId: formParent }),
      })
      if (res.ok) { showToast('Sub-item ditambahkan', 'success'); setShowForm(false); fetchData() }
      else showToast('Gagal menambahkan', 'error')
    } else {
      // Add parent + sub-items in batch
      const validSubs = subItems.filter(s => s.trim())
      
      // Create parent first
      const parentRes = await fetch('/api/admin/mutabaah-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaItem: formNama, tahunAjaranId: selectedTahun, parentId: null }),
      })
      
      if (!parentRes.ok) {
        showToast('Gagal menambahkan item', 'error')
        setFormLoad(false)
        return
      }

      const parentData = await parentRes.json()
      const parentId = parentData.id

      // Create sub-items
      let subCreated = 0
      for (const sub of validSubs) {
        const subRes = await fetch('/api/admin/mutabaah-items', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ namaItem: sub, tahunAjaranId: selectedTahun, parentId }),
        })
        if (subRes.ok) subCreated++
      }

      const msg = validSubs.length > 0
        ? `Item ditambahkan dengan ${subCreated} sub-poin`
        : 'Item ditambahkan'
      showToast(msg, 'success')
      setShowForm(false)
      fetchData()
    }
    setFormLoad(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/mutabaah-items/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast('Item dihapus', 'success'); setConfirmDel(null); fetchData() }
    else showToast('Gagal', 'error')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-14 md:top-0 z-30">
        <Breadcrumb />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-800">Template Mutabaah</h2>
          <button onClick={() => openAddForm()} className="h-9 px-3 bg-primary-500 text-white text-xs font-semibold rounded-lg">+ Tambah</button>
        </div>
        <select value={selectedTahun} onChange={e => setSelectedTahun(e.target.value)} className="w-full h-9 px-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
          {tahunList.map(t => <option key={t.id} value={t.id}>{t.nama}{t.is_active ? ' (Aktif)' : ''}</option>)}
        </select>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-200 rounded-lg animate-skeleton mb-2" />)
        ) : groupedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-600">Belum ada item mutabaah</p>
            <p className="text-xs text-neutral-400 mt-1">Tambah item untuk memulai tracking ibadah</p>
            <button onClick={() => openAddForm()} className="mt-4 h-10 px-6 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600">
              + Tambah Item
            </button>
          </div>
        ) : (
          <>
            {/* Parent items with children */}
            <div className="space-y-4">
              {groupedItems.map((group) => (
                <div key={group.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  {/* Parent row */}
                  <div className="px-4 py-4 bg-gradient-to-r from-primary-50 to-white border-b border-neutral-100">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {group.urutan}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base text-primary-800">{group.nama_item}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] font-medium text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                            {group.children.length} Sub Item
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            Dipakai {group.jumlah_kelas > 0 ? `${group.jumlah_kelas} Kelas` : '— Kelas'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openAddForm(group.id)}
                          className="h-8 px-3 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Tambah Sub Item
                        </button>
                        <button
                          onClick={() => openEditForm(group)}
                          className="h-8 px-3 border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDel(group.id)}
                          className="h-8 px-3 border border-neutral-200 hover:border-danger/30 text-danger text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          Arsipkan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sub Items */}
                  {group.children.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Sub Item
                      </p>
                      {group.children.map((child) => (
                        <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-50 last:border-0">
                          <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth="3" strokeLinecap="round"><path d="M9 11l3 3L22 4"/></svg>
                          </div>
                          <p className="flex-1 text-sm text-neutral-700">{child.nama_item}</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditForm(child)} className="text-xs text-neutral-400 hover:text-blue-600 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => setConfirmDel(child.id)} className="text-xs text-neutral-400 hover:text-danger font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors">
                              Arsipkan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {group.children.length === 0 && (
                    <div className="px-4 py-3 text-center">
                      <p className="text-xs text-neutral-400">Belum ada sub item. Klik "+ Tambah Sub Item" untuk menambahkan.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Inactive items */}
            {inactiveItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">Nonaktif ({inactiveItems.length})</p>
                <div className="space-y-1">
                  {inactiveItems.map(item => (
                    <div key={item.id} className="bg-white rounded-lg border border-neutral-200 px-4 py-2.5 flex items-center gap-3 opacity-50">
                      <p className="flex-1 text-sm text-neutral-500 line-through">{item.nama_item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-neutral-800">{editItem ? 'Edit Item' : formParent ? 'Tambah Sub-Item' : 'Tambah Item Mutabaah'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  {formParent ? 'Nama Sub-Item' : 'Nama Item'} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  placeholder={formParent ? 'Contoh: Subuh, Dzuhur...' : 'Contoh: Sholat Fardhu, Adab Harian...'}
                  className="w-full h-11 px-4 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  required
                />
              </div>

              {/* Sub-items form — only for new parent items */}
              {!editItem && !formParent && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Sub Poin (opsional)</label>
                  <div className="space-y-2">
                    {subItems.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary-400"><path d="M9 11l3 3L22 4"/></svg>
                        </span>
                        <input
                          type="text"
                          value={sub}
                          onChange={e => {
                            const next = [...subItems]
                            next[idx] = e.target.value
                            setSubItems(next)
                          }}
                          placeholder={`Sub poin ${idx + 1}`}
                          className="flex-1 h-9 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                        />
                        <button
                          type="button"
                          onClick={() => setSubItems(subItems.filter((_, i) => i !== idx))}
                          className="w-7 h-7 flex items-center justify-center rounded text-neutral-300 hover:text-danger hover:bg-red-50 flex-shrink-0"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubItems([...subItems, ''])}
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Sub Poin
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600">Batal</button>
                <button type="submit" disabled={formLoad} className={cn('flex-1 h-11 rounded-lg text-sm font-semibold text-white', formLoad ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600')}>
                  {formLoad ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Archive Modal */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F39C12" strokeWidth="2" strokeLinecap="round"><path d="M21 4H3l1 16h16L21 4z"/><line x1="10" y1="11" x2="14" y2="11"/></svg>
            </div>
            <h3 className="font-bold text-neutral-800 text-center mb-2">Arsipkan Item?</h3>
            <p className="text-sm text-neutral-500 text-center mb-4">Item akan dinonaktifkan tetapi data histori tetap tersimpan.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600">Batal</button>
              <button onClick={() => handleDelete(confirmDel)} className="flex-1 h-11 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600">Arsipkan</button>
            </div>
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  )
}
