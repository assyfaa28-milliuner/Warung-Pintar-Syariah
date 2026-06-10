'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconShoppingCart, IconCash } from '@tabler/icons-react'

export default function CatatJual() {
  const [itemName, setItemName] = useState('')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [paymentType, setPaymentType] = useState<'tunai' | 'bon'>('tunai')
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    if (!itemName || price === 0) {
      setMessage('❌ Nama barang & harga wajib diisi!')
      return
    }

    if (paymentType === 'bon' && !customerName) {
      setMessage('❌ Nama pelanggan wajib diisi untuk bon!')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const totalAmount = price * quantity

    try {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          warung_id: user.id,
          type: 'sale',
          description: `${itemName} x${quantity}`,
          amount: totalAmount,
          transaction_at: new Date(saleDate).toISOString(),
          is_deleted: false,
        })
        .select()

      if (txError) {
        setMessage('❌ Gagal catat penjualan')
        setLoading(false)
        return
      }

      if (paymentType === 'bon' && txData && txData[0]) {
        await supabase.from('receivables').insert({
          warung_id: user.id,
          customer_name: customerName,
          amount: totalAmount,
          status: 'outstanding',
          bon_date: new Date(saleDate).toISOString(),
          is_deleted: false,
        })
      }

      setMessage('✅ Penjualan berhasil dicatat!')
      setTimeout(() => { window.location.href = '/dashboard' }, 1500)
    } catch {
      setMessage('❌ Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-20">

      {/* Header */}
      <div className="bg-[#16A34A] px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconShoppingCart size={20} color="white" />
        </div>
        <div>
          <p className="text-white text-base font-bold">Catat Jual</p>
          <p className="text-white/70 text-xs">Catat pemasukan penjualan</p>
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
              placeholder="Contoh: Gula pasir"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Tanggal Penjualan</label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>

          {/* Harga Jual & Jumlah */}
          <div className="flex gap-3">
            
            {/* KOLOM KIRI: HARGA JUAL */}
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-2">Harga Jual (Rp)</label>
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs text-green-600 mb-1">Total Harga</p>
            <p className="text-2xl font-bold text-green-700">Rp {(price * quantity).toLocaleString('id-ID')}</p>
          </div>

          {/* Cara Bayar */}
          <div>
            <p className="block text-sm text-gray-500 mb-3 font-medium">Cara Bayar</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentType('tunai')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                  paymentType === 'tunai'
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                💵 Tunai
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('bon')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                  paymentType === 'bon'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                📋 Bon
              </button>
            </div>
          </div>

          {/* Nama Pelanggan (hanya kalau Bon) */}
          {paymentType === 'bon' && (
            <div className="space-y-2">
              <label className="block text-sm text-gray-500">Nama Pelanggan</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama pelanggan"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700 font-semibold">📌 Akad Qardh</p>
                <p className="text-xs text-red-600 mt-1">Pinjaman tanpa bunga sesuai syariah.</p>
              </div>
            </div>
          )}

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
          className="w-full bg-[#16A34A] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#15803d] transition disabled:opacity-50"
        >
          {loading ? '⏳ Menyimpan...' : '✅ Simpan Penjualan'}
        </button>

      </div>
    </main>
  )
}