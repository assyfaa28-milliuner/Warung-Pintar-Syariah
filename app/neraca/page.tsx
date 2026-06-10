'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Neraca() {
  const [warungName, setWarungName] = useState('')
  const [kasWarung, setKasWarung] = useState(0)
  const [nilaiPersediaan, setNilaiPersediaan] = useState(0)
  const [totalPiutang, setTotalPiutang] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNeraca() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }

      // Profil warung
      const { data: profile } = await supabase
        .from('warung_profiles')
        .select('warung_name')
        .eq('id', user.id)
        .single()
      if (profile) setWarungName(profile.warung_name)

      // Hitung kas warung
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('warung_id', user.id)
        .eq('is_deleted', false)

      if (transactions) {
        const kas = transactions.reduce((sum, t) => {
          if (t.type === 'sale' || t.type === 'payment') return sum + t.amount
          if (t.type === 'purchase') return sum - t.amount
          return sum
        }, 0)
        setKasWarung(kas)
      }

      // Hitung nilai persediaan (HPP × qty)
      const { data: inventory } = await supabase
        .from('inventory')
        .select('hpp, quantity')
        .eq('warung_id', user.id)

      if (inventory) {
        const nilai = inventory.reduce((sum, i) => sum + (i.hpp * i.quantity), 0)
        setNilaiPersediaan(nilai)
      }

      // Total piutang outstanding
      const { data: receivables } = await supabase
        .from('receivables')
        .select('amount')
        .eq('warung_id', user.id)
        .eq('status', 'outstanding')

      if (receivables) {
        const total = receivables.reduce((sum, r) => sum + r.amount, 0)
        setTotalPiutang(total)
      }

      setLoading(false)
    }

    fetchNeraca()
  }, [])

  const totalAset = kasWarung + nilaiPersediaan + totalPiutang

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] text-white px-4 py-5 flex items-center gap-3">
        <a href="/dashboard" className="text-white text-2xl">←</a>
        <div>
          <h1 className="text-xl font-bold">⚖️ Neraca Warung</h1>
          <p className="text-sm opacity-80">{warungName}</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {loading ? (
          <p className="text-center text-gray-400 py-8">Memuat neraca...</p>
        ) : (
          <>
            {/* Total Harta */}
            <div className="bg-[#1B4F3A] text-white rounded-2xl p-5 shadow">
              <p className="text-sm opacity-80">Total Harta Warung</p>
              <h2 className="text-3xl font-bold mt-1">
                Rp {totalAset.toLocaleString('id-ID')}
              </h2>
            </div>

            {/* Harta Warung (Aset) */}
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-bold text-[#1B4F3A] text-lg mb-4">
                💚 Harta Warung (Aset)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-semibold text-gray-700">💵 Uang di Laci (Kas)</p>
                    <p className="text-xs text-gray-400">Uang tunai yang ada di kasir</p>
                  </div>
                  <p className="font-bold text-green-600">
                    Rp {kasWarung.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-semibold text-gray-700">📦 Barang di Rak</p>
                    <p className="text-xs text-gray-400">Nilai stok berdasarkan harga beli</p>
                  </div>
                  <p className="font-bold text-green-600">
                    Rp {nilaiPersediaan.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <div>
                    <p className="font-semibold text-gray-700">📝 Bon Belum Lunas</p>
                    <p className="text-xs text-gray-400">Piutang pelanggan yang belum dibayar</p>
                  </div>
                  <p className="font-bold text-green-600">
                    Rp {totalPiutang.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex justify-between items-center bg-green-50 rounded-xl p-3">
                  <p className="font-bold text-gray-700">Total Harta</p>
                  <p className="font-bold text-[#1B4F3A] text-lg">
                    Rp {totalAset.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Penjelasan Edukatif */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1">📚 Tahukah Kamu?</p>
              <p className="text-sm text-blue-700">
                Neraca adalah foto kondisi warung hari ini. Harta Warung adalah semua yang warung miliki: uang di laci, barang di rak, dan bon pelanggan yang belum lunas.
              </p>
            </div>

            {/* Info Zakat */}
            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
              <p className="text-xs text-yellow-700 font-semibold mb-1">🕌 Info Zakat Tijarah</p>
              <p className="text-sm text-yellow-700">
                Total harta warung kamu saat ini <strong>Rp {totalAset.toLocaleString('id-ID')}</strong>. Jika sudah mencapai nisab (≈ 85 gram emas) selama 1 tahun, wajib zakat 2,5%.
              </p>
              {totalAset > 0 && (
                <p className="text-sm text-yellow-800 font-semibold mt-2">
                  Estimasi zakat jika wajib: Rp {Math.round(totalAset * 0.025).toLocaleString('id-ID')}
                </p>
              )}
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
        <a href="/laporan" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">📊</span>
          <span className="text-xs">Laporan</span>
        </a>
        <a href="/warpin-ai" className="flex flex-col items-center">
          <div className="bg-[#B8860B] rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg">
            <span className="text-2xl">🎙️</span>
          </div>
          <span className="text-xs text-[#B8860B] font-semibold mt-1">Warpin AI</span>
        </a>
        <a href="/neraca" className="flex flex-col items-center text-[#1B4F3A]">
          <span className="text-2xl">⚖️</span>
          <span className="text-xs font-semibold">Neraca</span>
        </a>
        <a href="/akademi" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">📚</span>
          <span className="text-xs">Akademi</span>
        </a>
      </div>

    </main>
  )
}