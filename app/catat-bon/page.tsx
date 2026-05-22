'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CatatBon() {
  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    if (!customerName || !amount) {
      setMessage('❌ Nama pelanggan dan nominal wajib diisi!')
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

      // Simpan ke tabel receivables
      const { error: bonError } = await supabase
        .from('receivables')
        .insert({
          warung_id: user.id,
          customer_name: customerName,
          amount: Number(amount),
          bon_date: new Date().toISOString().split('T')[0],
          status: 'outstanding',
        })

      if (bonError) {
        setMessage(`❌ ${bonError.message}`)
        return
      }

      // Simpan ke tabel transactions
      const { error: trxError } = await supabase
        .from('transactions')
        .insert({
          warung_id: user.id,
          type: 'receivable',
          description: `Bon ${customerName}`,
          amount: Number(amount),
        })

      if (trxError) {
        setMessage(`❌ ${trxError.message}`)
        return
      }

      setMessage('✅ Bon berhasil dicatat!')
      setCustomerName('')
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
          <h1 className="text-xl font-bold">📝 Catat Bon</h1>
          <p className="text-sm opacity-80">Catat piutang pelanggan</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        <div className="bg-white rounded-2xl p-5 shadow space-y-4">

          {/* Info Akad Qardh */}
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <p className="text-xs text-green-700 font-semibold">🕌 Akad Qardh — Bebas Riba</p>
            <p className="text-xs text-green-600 mt-1">Bon ini dicatat tanpa bunga sesuai prinsip syariah. Nominal yang dibayar sama dengan yang dipinjam.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pelanggan
            </label>
            <input
              type="text"
              placeholder="Contoh: Ibu Ani"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nominal Bon (Rp)
            </label>
            <input
              type="number"
              placeholder="Contoh: 50000"
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
            {loading ? 'Menyimpan...' : '💾 Simpan Bon'}
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
                  Piutang pelanggan tercatat <span className="text-green-600 font-semibold">(Piutang Bon bertambah)</span>. Ingat, tagih dengan sopan dan <span className="text-[#1B4F3A] font-semibold">tanpa bunga</span> sesuai syariah ya! 🕌
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tombol Lihat Daftar Bon */}
        <a
          href="/daftar-bon"
          className="block w-full bg-white border-2 border-[#1B4F3A] text-[#1B4F3A] py-3 rounded-xl text-lg font-semibold text-center hover:bg-green-50 transition-colors"
        >
          📋 Lihat Daftar Bon
        </a>

      </div>
    </main>
  )
}