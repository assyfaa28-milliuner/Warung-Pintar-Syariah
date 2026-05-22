'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Laporan() {
  const [filter, setFilter] = useState('hari')
  const [totalMasuk, setTotalMasuk] = useState(0)
  const [totalKeluar, setTotalKeluar] = useState(0)
  const [untungBersih, setUntungBersih] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLaporan()
  }, [filter])

  async function fetchLaporan() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/'
      return
    }

    // Tentukan rentang tanggal berdasarkan filter
    const now = new Date()
    let startDate = new Date()

    if (filter === 'hari') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (filter === 'minggu') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (filter === 'bulan') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('warung_id', user.id)
      .eq('is_deleted', false)
      .gte('transaction_at', startDate.toISOString())

    if (transactions) {
      const masuk = transactions
        .filter(t => t.type === 'sale' || t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0)

      const keluar = transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0)

      setTotalMasuk(masuk)
      setTotalKeluar(keluar)
      setUntungBersih(masuk - keluar)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] text-white px-4 py-5 flex items-center gap-3">
        <a href="/dashboard" className="text-white text-2xl">←</a>
        <div>
          <h1 className="text-xl font-bold">📊 Laporan Keuangan</h1>
          <p className="text-sm opacity-80">Ringkasan keuangan warung</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Filter Periode */}
        <div className="bg-white rounded-2xl p-2 shadow flex gap-2">
          {['hari', 'minggu', 'bulan'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${
                filter === f
                  ? 'bg-[#1B4F3A] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f === 'hari' ? 'Hari Ini' : f === 'minggu' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Memuat laporan...</p>
        ) : (
          <>
            {/* Kartu Untung Bersih */}
            <div className={`rounded-2xl p-5 shadow text-white ${untungBersih >= 0 ? 'bg-[#1B4F3A]' : 'bg-red-500'}`}>
              <p className="text-sm opacity-80">Untung Bersih</p>
              <h2 className="text-3xl font-bold mt-1">
                Rp {untungBersih.toLocaleString('id-ID')}
              </h2>
              <p className="text-xs opacity-70 mt-1">
                {filter === 'hari' ? 'Hari ini' : filter === 'minggu' ? '7 hari terakhir' : 'Bulan ini'}
              </p>
            </div>

            {/* Masuk vs Keluar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow">
                <p className="text-sm text-gray-500">💚 Uang Masuk</p>
                <p className="text-xl font-bold text-green-600">
                  Rp {totalMasuk.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow">
                <p className="text-sm text-gray-500">🔴 Uang Keluar</p>
                <p className="text-xl font-bold text-red-500">
                  Rp {totalKeluar.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Grafik Sederhana */}
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-semibold text-gray-700 mb-4">Perbandingan Masuk vs Keluar</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600 font-semibold">Uang Masuk</span>
                    <span className="text-green-600">Rp {totalMasuk.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all"
                      style={{ width: totalMasuk + totalKeluar > 0 ? `${(totalMasuk / (totalMasuk + totalKeluar)) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-500 font-semibold">Uang Keluar</span>
                    <span className="text-red-500">Rp {totalKeluar.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4">
                    <div
                      className="bg-red-400 h-4 rounded-full transition-all"
                      style={{ width: totalMasuk + totalKeluar > 0 ? `${(totalKeluar / (totalMasuk + totalKeluar)) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center">
        <a href="/dashboard" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">🏠</span>
          <span className="text-xs">Beranda</span>
        </a>
        <a href="/laporan" className="flex flex-col items-center text-[#1B4F3A]">
          <span className="text-2xl">📊</span>
          <span className="text-xs font-semibold">Laporan</span>
        </a>
        <a href="/warpin-ai" className="flex flex-col items-center">
          <div className="bg-[#B8860B] rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg">
            <span className="text-2xl">🎙️</span>
          </div>
          <span className="text-xs text-[#B8860B] font-semibold mt-1">Warpin AI</span>
        </a>
        <a href="/neraca" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">⚖️</span>
          <span className="text-xs">Neraca</span>
        </a>
        <a href="/akademi" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">📚</span>
          <span className="text-xs">Akademi</span>
        </a>
      </div>

    </main>
  )
}