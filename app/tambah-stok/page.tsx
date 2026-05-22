'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TambahStok() {
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [hpp, setHpp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const total = Number(quantity) * Number(hpp)

  async function handleSubmit() {
    if (!itemName || !quantity || !hpp) {
      setMessage('❌ Semua kolom wajib diisi!')
      return
    }
    if (Number(quantity) <= 0 || Number(hpp) <= 0) {
      setMessage('❌ Kuantitas dan harga harus lebih dari 0!')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }

      // Simpan transaksi pembelian
      const { error } = await supabase
        .from('transactions')
        .insert({
          warung_id: user.id,
          type: 'purchase',
          description: `Beli ${itemName} ${quantity} pcs`,
          amount: total,
        })

      if (error) {
        setMessage(`❌ ${error.message}`)
        return
      }

      // Update atau insert inventory
      const { data: existingItem } = await supabase
        .from('inventory')
        .select('*')
        .eq('warung_id', user.id)
        .eq('item_name', itemName)
        .single()

      if (existingItem) {
        await supabase
          .from('inventory')
          .update({
            quantity: existingItem.quantity + Number(quantity),
            hpp: Number(hpp),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
      } else {
        await supabase
          .from('inventory')
          .insert({
            warung_id: user.id,
            item_name: itemName,
            hpp: Number(hpp),
            quantity: Number(quantity),
          })
      }

      setMessage('✅ Stok berhasil ditambahkan!')
      setItemName('')
      setQuantity('')
      setHpp('')

    } catch {
      setMessage('❌ Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-[#1B4F3A] text-white px-4 py-5 flex items-center gap-3">
        <a href="/dashboard" className="text-white text-2xl">←</a>
        <div>
          <h1 className="text-xl font-bold">📦 Tambah Stok</h1>
          <p className="text-sm opacity-80">Catat pembelian barang ke agen</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        <div className="bg-white rounded-2xl p-5 shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Barang
            </label>
            <input
              type="text"
              placeholder="Contoh: Mie Instan"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kuantitas
            </label>
            <input
              type="number"
              placeholder="Contoh: 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Beli per Satuan (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 3000"
              value={hpp}
              onChange={(e) => setHpp(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          {/* Total Otomatis */}
          {quantity && hpp && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-sm text-gray-500">Total Pengeluaran:</p>
              <p className="text-2xl font-bold text-[#1B4F3A]">
                Rp {total.toLocaleString('id-ID')}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1B4F3A] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#163d2d] transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : '💾 Simpan Stok'}
          </button>
        </div>

        {/* Notifikasi */}
        {message && (
          <div className={`rounded-2xl p-4 shadow ${message.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-semibold text-gray-700">{message}</p>
            {message.includes('✅') && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">📚 Pintar Akuntansi:</p>
                <p className="text-sm text-gray-600">
                  Barang masuk ke rak <span className="text-green-600 font-semibold">(Persediaan bertambah)</span> dan uang keluar dari laci <span className="text-red-500 font-semibold">(Kas berkurang)</span>. Ini namanya Debit Persediaan, Kredit Kas! 🎉
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}