'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CatatJual() {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    if (!description || !amount) {
      setMessage('❌ Nama barang dan nominal wajib diisi!')
      return
    }
    if (Number(amount) <= 0) {
      setMessage('❌ Nominal harus lebih dari 0!')
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

      const { error } = await supabase
        .from('transactions')
        .insert({
          warung_id: user.id,
          type: 'sale',
          description: description,
          amount: Number(amount),
        })

      if (error) {
        setMessage(`❌ ${error.message}`)
        return
      }

      setMessage('✅ Mantap! Uang masuk ke laci kasir tercatat!')
      setDescription('')
      setAmount('')

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
          <h1 className="text-xl font-bold">🛒 Catat Jual</h1>
          <p className="text-sm opacity-80">Catat pemasukan dari penjualan</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Form */}
        <div className="bg-white rounded-2xl p-5 shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Barang / Keterangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Gula pasir 1 kg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nominal Penjualan (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 12000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1B4F3A] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#163d2d] transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : '💾 Simpan Transaksi'}
          </button>
        </div>

        {/* Notifikasi Pintar Akuntansi */}
        {message && (
          <div className={`rounded-2xl p-4 shadow ${message.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-semibold text-gray-700">{message}</p>
            {message.includes('✅') && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">📚 Pintar Akuntansi:</p>
                <p className="text-sm text-gray-600">
                  Uang masuk ke laci kasir <span className="text-green-600 font-semibold">(Kas Warung bertambah)</span> dan pemasukan warung tercatat <span className="text-green-600 font-semibold">(Pendapatan bertambah)</span>. Ini namanya Debit Kas, Kredit Pendapatan! 🎉
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Jurnal */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 font-semibold mb-1">ℹ️ Yang terjadi saat kamu simpan:</p>
          <p className="text-sm text-blue-700">Sistem otomatis mencatat: <strong>Uang Laci bertambah</strong> dan <strong>Pemasukan bertambah</strong> sesuai nominal yang kamu masukkan.</p>
        </div>

      </div>
    </main>
  )
}