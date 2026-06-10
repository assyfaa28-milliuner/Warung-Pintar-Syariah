'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconNotes, IconUser, IconCash, IconDeviceFloppy, IconTag } from '@tabler/icons-react'

export default function CatatBon() {
  const [customerName, setCustomerName] = useState('')
  const [itemName, setItemName] = useState('')
  const [amount, setAmount] = useState('')
  const [quantity, setQuantity] = useState('1') // Variabel quantity ditambahkan di sini
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    // Menghitung total nominal bon otomatis (Harga Satuan x Jumlah)
    const totalAmount = Number(amount) * Number(quantity)

    if (!customerName || !amount) {
      setMessage('❌ Nama pelanggan dan harga satuan wajib diisi!')
      return
    }
    if (totalAmount <= 0) {
      setMessage('❌ Nominal harus lebih dari 0!')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { globalThis.location.href = '/'; return }

      const { error: bonError } = await supabase
        .from('receivables')
        .insert({
          warung_id: user.id,
          customer_name: customerName,
          amount: totalAmount, // Menggunakan totalAmount
          bon_date: new Date().toISOString().split('T')[0],
          status: 'outstanding',
        })
      if (bonError) { setMessage(`❌ ${bonError.message}`); return }

      const { error: trxError } = await supabase
        .from('transactions')
        .insert({
          warung_id: user.id,
          type: 'receivable',
          description: `Bon ${customerName}${itemName ? ` - ${itemName} (${quantity}x)` : ''}`,
          amount: totalAmount, // Menggunakan totalAmount
        })
      if (trxError) { setMessage(`❌ ${trxError.message}`); return }

      setMessage('✅ Bon berhasil dicatat!')
      setCustomerName('')
      setItemName('')
      setAmount('')
      setQuantity('1') // Mengembalikan jumlah ke 1 setelah sukses

    } catch {
      setMessage('❌ Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-[#DC2626] px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconNotes size={20} color="white" />
        </div>
        <div>
          <p className="text-white text-base font-bold">Catat Bon</p>
          <p className="text-white/70 text-xs">Piutang pelanggan bebas riba</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Info Akad Qardh */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200 flex items-start gap-3">
          <span className="text-xl">🕌</span>
          <div>
            <p className="text-sm font-semibold text-green-700">Akad Qardh — Bebas Riba</p>
            <p className="text-xs text-green-600 mt-1 leading-relaxed">Bon ini dicatat tanpa bunga sesuai syariah Islam. Nominal yang dibayar balik sama dengan yang dipinjam.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">

          {/* Nama Pelanggan */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Nama Pelanggan</label>
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 gap-3">
              <IconUser size={18} color="#aaa" />
              <input
                type="text"
                placeholder="Contoh: Ibu Ani"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Nama Barang (opsional) */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Nama Barang <span className="text-gray-400">(opsional)</span></label>
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 gap-3">
              <IconTag size={18} color="#aaa" />
              <input
                type="text"
                placeholder="Contoh: Beras 5 kg"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Harga & Jumlah */}
          <div className="flex gap-3">
            
            {/* KOLOM KIRI: HARGA SATUAN */}
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-2">Harga Satuan (Rp)</label>
              <div className="h-12 flex items-center bg-gray-50 rounded-xl px-3 border border-gray-200 gap-2">
                <IconCash size={16} color="#aaa" />
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                  onClick={() => setQuantity((q: string) => String(Math.max(1, Number(q) - 1)))}
                  className="w-10 h-full text-gray-500 hover:bg-gray-100 text-lg font-bold flex items-center justify-center"
                >−</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-center focus:outline-none text-gray-700 w-full"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q: string) => String(Number(q) + 1))}
                  className="w-10 h-full text-gray-500 hover:bg-gray-100 text-lg font-bold flex items-center justify-center"
                >+</button>
              </div>
            </div>
            
          </div>

          {/* Total */}
          {amount && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <p className="text-xs text-red-600 mb-1">Total nominal bon yang dicatat:</p>
              <p className="text-2xl font-bold text-red-700">
                Rp {(Number(amount) * Number(quantity)).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-red-500 mt-1">Yang dibayar balik: Rp {(Number(amount) * Number(quantity)).toLocaleString('id-ID')} (tanpa bunga)</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#DC2626] text-white py-3.5 rounded-xl text-base font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <IconDeviceFloppy size={20} />
            {loading ? 'Menyimpan...' : 'Simpan Bon'}
          </button>
        </div>

        {/* Notifikasi */}
        {message && (
          <div className={`rounded-2xl p-4 shadow-sm ${message.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-semibold text-gray-700 text-sm">{message}</p>
            {message.includes('✅') && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">📚 Pintar Akuntansi:</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Piutang pelanggan tercatat <span className="text-green-600 font-semibold">(Piutang Bon bertambah)</span>. Tagih dengan sopan dan <span className="text-[#1B4F3A] font-semibold">tanpa bunga</span> sesuai syariah ya! 🕌
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tombol Lihat Daftar Bon */}
        <a
          href="/daftar-bon"
          className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <IconNotes size={20} color="#DC2626" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Lihat Daftar Bon</p>
              <p className="text-xs text-gray-400">Bon pelanggan yang belum lunas</p>
            </div>
          </div>
          <span className="text-gray-400 text-lg">→</span>
        </a>

      </div>
    </main>
  )
}