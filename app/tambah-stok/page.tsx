'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconPackage, IconCash } from '@tabler/icons-react'

export default function TambahStok() {
  const [itemName, setItemName] = useState('')
  const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0])
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    if (!itemName || price === 0) {
      setMessage('❌ Nama barang & harga wajib diisi!')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const totalPrice = price * quantity

    try {
      // Insert transaksi pembelian
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          warung_id: user.id,
          type: 'purchase',
          description: `${itemName} x${quantity}`,
          amount: totalPrice,
          transaction_at: new Date(stockDate).toISOString(),
          is_deleted: false,
        })

      if (txError) {
        setMessage('❌ Gagal catat stok')
        setLoading(false)
        return
      }

      // Cek apakah barang sudah ada di inventory
      const { data: existingItem } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('warung_id', user.id)
        .eq('item_name', itemName)
        .single()

      if (existingItem) {
        // Update quantity jika barang sudah ada
        await supabase
          .from('inventory')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
      } else {
        // Insert barang baru jika belum ada
        await supabase
          .from('inventory')
          .insert({
            warung_id: user.id,
            item_name: itemName,
            purchase_price: price,
            quantity: quantity,
          })
      }

      setMessage('✅ Stok berhasil ditambah!')
      setItemName('')
      setPrice(0)
      setQuantity(1)
      setStockDate(new Date().toISOString().split('T')[0])
      setTimeout(() => {
        globalThis.location.href = '/dashboard'
      }, 1500)
    } catch {
      setMessage('❌ Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-20">

      {/* Header */}
      <div className="bg-[#2563EB] px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconPackage size={20} color="white" />
        </div>
        <div>
          <p className="text-white text-base font-bold">Tambah Stok</p>
          <p className="text-white/70 text-xs">Catat pembelian barang ke agen</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Form Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">

          {/* Nama Barang */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Nama Barang</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: Mie instan"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Tanggal Pembelian</label>
            <input
              type="date"
              value={stockDate}
              onChange={(e) => setStockDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Harga Beli & Jumlah */}
          <div className="flex gap-3">
            
            {/* KOLOM KIRI: HARGA BELI */}
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-2">Harga Beli (Rp)</label>
              <div className="h-12 flex items-center bg-gray-50 rounded-xl px-3 border border-gray-200 gap-2">
                <IconCash size={16} color="#aaa" /> 
                <input
                  type="number"
                  placeholder="0"
                  value={price === 0 ? '' : price}
                  onChange={(e) => setPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 w-full"
                />
              </div>
            </div>

            {/* KOLOM KANAN: JUMLAH */}
            <div className="w-32">
              <label className="block text-sm text-gray-500 mb-2">Jumlah</label>
              <div className="h-12 flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-full text-gray-500 hover:bg-gray-100 text-lg font-bold flex items-center justify-center"
                >−</button>
                <input
                  type="number"
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="flex-1 bg-transparent text-sm text-center focus:outline-none text-gray-700 w-full"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-full text-gray-500 hover:bg-gray-100 text-lg font-bold flex items-center justify-center"
                >+</button>
              </div>
            </div>

          </div>

          {/* Total */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-600 mb-1">Total Harga</p>
            <p className="text-2xl font-bold text-blue-700">Rp {(price * quantity).toLocaleString('id-ID')}</p>
          </div>

          {/* Scan Nota Link */}
          <a href="/scan-nota?from=tambah-stok" className="block bg-yellow-50 border border-yellow-200 rounded-xl p-3 hover:bg-yellow-100 transition">
            <p className="text-xs text-yellow-700 font-semibold">📸 Scan Nota</p>
            <p className="text-xs text-yellow-600 mt-1">Atau gunakan fitur Scan Nota untuk otomatis input barang dari foto struk! →</p>
          </a>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-2xl p-4 text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Tombol Simpan */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#2563EB] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#1d4ed8] transition disabled:opacity-50"
        >
          {loading ? '⏳ Menyimpan...' : '✅ Simpan Stok'}
        </button>

      </div>
    </main>
  )
}