'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconHome, IconChartBar, IconRobot, IconBox, IconBook, IconPackage, IconSearch, IconPlus, IconAlertTriangle } from '@tabler/icons-react'

type InventoryItem = {
  id: string
  item_name: string
  hpp: number
  quantity: number
  updated_at: string
}

export default function Stok() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filtered, setFiltered] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  // State untuk modal Edit/Hapus
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { fetchInventory() }, [])

  useEffect(() => {
    if (search) {
      setFiltered(inventory.filter(i => i.item_name.toLowerCase().includes(search.toLowerCase())))
    } else {
      setFiltered(inventory)
    }
  }, [search, inventory])

  async function fetchInventory() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { globalThis.location.href = '/'; return }

    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('warung_id', user.id)
      .order('updated_at', { ascending: false })

    setInventory(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  // --- FUNGSI EDIT BARANG ---
  async function handleUpdateItem() {
    if (!selectedItem) return
    setIsSaving(true)

    const { error } = await supabase
      .from('inventory')
      .update({
        item_name: selectedItem.item_name,
        hpp: selectedItem.hpp,
        quantity: selectedItem.quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedItem.id)

    if (!error) {
      const updatedList = inventory.map(item => 
        item.id === selectedItem.id ? selectedItem : item
      )
      setInventory(updatedList)
      setSelectedItem(null)
    } else {
      alert('Gagal mengupdate stok. Coba lagi.')
    }
    setIsSaving(false)
  }

  // --- FUNGSI HAPUS BARANG ---
  async function handleDeleteItem() {
    if (!selectedItem) return
    if (!confirm(`Yakin ingin menghapus ${selectedItem.item_name} dari daftar stok?`)) return
    
    setIsSaving(true)
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', selectedItem.id)

    if (!error) {
      const updatedList = inventory.filter(item => item.id !== selectedItem.id)
      setInventory(updatedList)
      setSelectedItem(null)
    } else {
      alert('Gagal menghapus barang.')
    }
    setIsSaving(false)
  }

  const totalItem = inventory.length
  const nilaiStok = inventory.reduce((sum, i) => sum + (i.hpp * i.quantity), 0)
  const stokTipis = inventory.filter(i => i.quantity <= 5).length

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] px-5 pt-5 pb-6">
        <p className="text-white/70 text-xs mb-1">Warung Pintar Syariah</p>
        <p className="text-white text-lg font-bold mb-4">📦 Stok Barang</p>

        {/* Summary Cards */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white/12 rounded-xl p-3 border border-white/15 text-center">
            <p className="text-white/60 text-xs mb-1">Total Item</p>
            <p className="text-white text-xl font-bold">{totalItem}</p>
          </div>
          <div className="flex-1 bg-white/12 rounded-xl p-3 border border-white/15 text-center">
            <p className="text-white/60 text-xs mb-1">Nilai Stok</p>
            <p className="text-white text-sm font-bold">Rp {(nilaiStok / 1000).toFixed(0)}rb</p>
          </div>
          <div className="flex-1 bg-white/12 rounded-xl p-3 border border-white/15 text-center">
            <p className="text-white/60 text-xs mb-1">Stok Tipis</p>
            <p className={`text-xl font-bold ${stokTipis > 0 ? 'text-red-300' : 'text-white'}`}>{stokTipis}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Search */}
        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-gray-200 gap-3 shadow-sm">
          <IconSearch size={18} color="#aaa" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700"
          />
        </div>

        {/* Daftar Stok & Empty State (Saldo Awal) */}
        {loading ? (
          <p className="text-center text-gray-400 py-8 text-sm">Memuat data stok...</p>
        ) : filtered.length === 0 ? (
          /* TAMPILAN KHUSUS UNTUK INPUT SALDO AWAL (Pengguna Baru) */
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center border-2 border-dashed border-gray-200 mt-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconPackage size={40} color="#1B4F3A" />
            </div>
            <p className="text-gray-800 font-bold text-lg">Stok Masih Kosong</p>
            <p className="text-gray-500 text-sm mt-2 mb-6 leading-relaxed">
              Yuk, mulai catat barang daganganmu dengan memasukkan Saldo Awal Stok warung agar perhitungan hartanya akurat.
            </p>
            <a
              href="/tambah-stok"
              className="inline-flex items-center justify-center gap-2 bg-[#1B4F3A] text-white px-6 py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#163d2d] transition-colors shadow-md w-full"
            >
              <IconPlus size={18} />
              Input Saldo Awal Stok
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400">DAFTAR BARANG ({filtered.length} item)</p>
            {filtered.map((item) => {
              const isTipis = item.quantity <= 5
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left transition hover:bg-gray-50 ${isTipis ? 'border border-red-200' : ''}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isTipis ? 'bg-red-100' : 'bg-green-100'}`}>
                    <IconPackage size={22} color={isTipis ? '#DC2626' : '#16A34A'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{item.item_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Harga beli: Rp {item.hpp.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold ${isTipis ? 'text-red-500' : 'text-gray-700'}`}>
                      {item.quantity} pcs
                    </p>
                    {isTipis && (
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <IconAlertTriangle size={10} color="#DC2626" />
                        <p className="text-[10px] text-red-500 font-semibold">Stok tipis!</p>
                      </div>
                    )}
                    {!isTipis && (
                      <p className="text-[10px] text-green-500 mt-0.5">Stok aman</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Tombol Tambah Barang Biasa (Hanya Muncul Jika Stok Sudah Ada) */}
        {!loading && filtered.length > 0 && (
          <a
            href="/tambah-stok"
            className="flex items-center justify-center gap-2 bg-[#1B4F3A] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#163d2d] transition-colors shadow-sm mt-4"
          >
            <IconPlus size={18} />
            Tambah Barang Baru
          </a>
        )}

      </div>

      {/* ===== MODAL EDIT / HAPUS STOK ===== */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <p className="text-base font-bold text-gray-800">Detail Barang</p>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nama Barang</label>
                <input
                  type="text"
                  value={selectedItem.item_name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, item_name: e.target.value })}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B4F3A] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Harga Beli (HPP per pcs)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-sm text-gray-500 font-semibold">Rp</span>
                  <input
                    type="number"
                    value={selectedItem.hpp}
                    onChange={(e) => setSelectedItem({ ...selectedItem, hpp: Number(e.target.value) })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B4F3A] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jumlah Stok Tersisa</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedItem({...selectedItem, quantity: Math.max(0, selectedItem.quantity - 1)})}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition"
                  >-</button>
                  <input
                    type="number"
                    value={selectedItem.quantity}
                    onChange={(e) => setSelectedItem({ ...selectedItem, quantity: Number(e.target.value) })}
                    className="flex-1 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4F3A] focus:bg-white transition"
                  />
                  <button 
                    onClick={() => setSelectedItem({...selectedItem, quantity: selectedItem.quantity + 1})}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition"
                  >+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleDeleteItem}
                disabled={isSaving}
                className="w-1/3 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition disabled:opacity-50"
              >
                Hapus
              </button>
              <button
                onClick={handleUpdateItem}
                disabled={isSaving}
                className="w-2/3 bg-[#1B4F3A] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#163d2d] transition shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center">
        <a href="/dashboard" className="flex flex-col items-center text-gray-400">
          <IconHome size={24} />
          <span className="text-xs mt-0.5">Beranda</span>
        </a>
        <a href="/laporan" className="flex flex-col items-center text-gray-400">
          <IconChartBar size={24} />
          <span className="text-xs mt-0.5">Laporan</span>
        </a>
        <a href="/warpin-ai" className="flex flex-col items-center">
          <div className="bg-[#B8860B] rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg">
            <IconRobot size={24} color="white" />
          </div>
          <span className="text-xs text-[#B8860B] font-semibold mt-1">Warpin AI</span>
        </a>
        <a href="/stok" className="flex flex-col items-center text-[#1B4F3A]">
          <IconBox size={24} />
          <span className="text-xs font-semibold mt-0.5">Stok</span>
        </a>
        <a href="/akademi" className="flex flex-col items-center text-gray-400">
          <IconBook size={24} />
          <span className="text-xs mt-0.5">Akademi</span>
        </a>
      </div>

    </main>
  )
}