'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Receivable = {
  id: string
  customer_name: string
  amount: number
  bon_date: string
  status: string
}

export default function DaftarBon() {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchReceivables()
  }, [])

  async function fetchReceivables() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/'
      return
    }

    const { data } = await supabase
      .from('receivables')
      .select('*')
      .eq('warung_id', user.id)
      .eq('status', 'outstanding')
      .order('bon_date', { ascending: false })

    setReceivables(data || [])
    setLoading(false)
  }

  async function handleLunas(receivable: Receivable) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update status receivable
    await supabase
      .from('receivables')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', receivable.id)

    // Catat transaksi pelunasan
    await supabase
      .from('transactions')
      .insert({
        warung_id: user.id,
        type: 'payment',
        description: `Pelunasan bon ${receivable.customer_name}`,
        amount: receivable.amount,
      })

    setMessage(`✅ Bon ${receivable.customer_name} sudah lunas!`)
    fetchReceivables()
  }

  const totalPiutang = receivables.reduce((sum, r) => sum + r.amount, 0)

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-[#1B4F3A] text-white px-4 py-5 flex items-center gap-3">
        <a href="/dashboard" className="text-white text-2xl">←</a>
        <div>
          <h1 className="text-xl font-bold">📋 Daftar Bon</h1>
          <p className="text-sm opacity-80">Piutang pelanggan yang belum lunas</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Total Piutang */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-500">Total Piutang Belum Lunas</p>
          <p className="text-2xl font-bold text-red-500">
            Rp {totalPiutang.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Notifikasi */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="font-semibold text-gray-700">{message}</p>
          </div>
        )}

        {/* Daftar Bon */}
        {loading ? (
          <p className="text-center text-gray-400 py-8">Memuat data...</p>
        ) : receivables.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-gray-500">Tidak ada bon yang belum lunas!</p>
          </div>
        ) : (
          receivables.map((receivable) => (
            <div key={receivable.id} className="bg-white rounded-2xl p-4 shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{receivable.customer_name}</p>
                  <p className="text-sm text-gray-400">{receivable.bon_date}</p>
                </div>
                <p className="text-xl font-bold text-red-500">
                  Rp {receivable.amount.toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => handleLunas(receivable)}
                className="w-full bg-[#1B4F3A] text-white py-2 rounded-xl font-semibold hover:bg-[#163d2d] transition-colors"
              >
                ✅ Tandai Lunas
              </button>
            </div>
          ))
        )}

        {/* Tombol Tambah Bon */}
        <a
          href="/catat-bon"
          className="block w-full bg-white border-2 border-[#1B4F3A] text-[#1B4F3A] py-3 rounded-xl text-lg font-semibold text-center hover:bg-green-50 transition-colors"
        >
          ➕ Catat Bon Baru
        </a>

      </div>
    </main>
  )
}