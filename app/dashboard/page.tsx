'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Transaction = {
  id: string
  type: string
  description: string
  amount: number
  transaction_at: string
}

export default function Dashboard() {
  const [warungName, setWarungName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [kasWarung, setKasWarung] = useState(0)
  const [untungHariIni, setUntungHariIni] = useState(0)
  const [totalPiutang, setTotalPiutang] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }

      // Ambil profil warung
      const { data: profile } = await supabase
        .from('warung_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setWarungName(profile.warung_name)
        setOwnerName(profile.owner_name)
      }

      // Hitung kas warung (sale - purchase)
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

        // Untung hari ini
        const today = new Date().toISOString().split('T')[0]
        const todayTrx = transactions.filter(t =>
          t.transaction_at.startsWith(today)
        )
        const untung = todayTrx.reduce((sum, t) => {
          if (t.type === 'sale') return sum + t.amount
          if (t.type === 'purchase') return sum - t.amount
          return sum
        }, 0)
        setUntungHariIni(untung)

        // 5 transaksi terakhir
        const recent = [...transactions]
          .sort((a, b) => new Date(b.transaction_at).getTime() - new Date(a.transaction_at).getTime())
          .slice(0, 5)
        setRecentTransactions(recent)
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
    }

    loadDashboard()
  }, [])

  function getTransactionLabel(type: string) {
    if (type === 'sale') return { label: '🛒 Catat Jual', color: 'text-green-600' }
    if (type === 'purchase') return { label: '📦 Tambah Stok', color: 'text-red-500' }
    if (type === 'receivable') return { label: '📝 Catat Bon', color: 'text-yellow-600' }
    if (type === 'payment') return { label: '✅ Pelunasan Bon', color: 'text-blue-600' }
    return { label: type, color: 'text-gray-600' }
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] text-white px-4 py-5">
        <p className="text-sm opacity-80">Assalamu'alaikum,</p>
        <h1 className="text-xl font-bold">{ownerName || 'Pemilik Warung'}</h1>
        <p className="text-sm opacity-80">{warungName || 'Warung Pintar Syariah'}</p>
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* Kartu Kas Warung */}
        <div className="bg-[#1B4F3A] text-white rounded-2xl p-5 shadow">
          <p className="text-sm opacity-80">Total Kas Warung</p>
          <h2 className="text-3xl font-bold mt-1">
            Rp {kasWarung.toLocaleString('id-ID')}
          </h2>
          <p className="text-sm opacity-80 mt-1">
            Untung Hari Ini: Rp {untungHariIni.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Aksi Cepat */}
        <div>
          <h3 className="text-gray-600 font-semibold mb-3">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/catat-jual" className="bg-white rounded-2xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-3xl mb-2">🛒</div>
              <p className="font-semibold text-[#1B4F3A]">Catat Jual</p>
            </a>
            <a href="/tambah-stok" className="bg-white rounded-2xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-3xl mb-2">📦</div>
              <p className="font-semibold text-[#1B4F3A]">Tambah Stok</p>
            </a>
            <a href="/scan-nota" className="bg-white rounded-2xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-3xl mb-2">📷</div>
              <p className="font-semibold text-[#1B4F3A]">Scan Nota</p>
            </a>
            <a href="/catat-bon" className="bg-white rounded-2xl p-4 shadow text-center hover:shadow-md transition">
              <div className="text-3xl mb-2">📝</div>
              <p className="font-semibold text-[#1B4F3A]">Catat Bon</p>
            </a>
          </div>
        </div>

        {/* Total Piutang */}
        <a href="/daftar-bon" className="block bg-white rounded-2xl p-4 shadow hover:shadow-md transition">
          <p className="text-gray-500 text-sm">Total Piutang Bon</p>
          <p className="text-2xl font-bold text-red-500">
            Rp {totalPiutang.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Tap untuk lihat daftar bon →</p>
        </a>

        {/* Catatan Terakhir */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-semibold text-gray-700 mb-3">Catatan Terakhir</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Belum ada transaksi. Yuk mulai catat! 😊
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => {
                const { label, color } = getTransactionLabel(t.type)
                return (
                  <div key={t.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <p className={`text-sm font-semibold ${color}`}>{label}</p>
                      <p className="text-xs text-gray-400">{t.description}</p>
                    </div>
                    <p className={`font-bold ${t.type === 'purchase' ? 'text-red-500' : 'text-green-600'}`}>
                      {t.type === 'purchase' ? '-' : '+'}Rp {t.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center">
        <a href="/dashboard" className="flex flex-col items-center text-[#1B4F3A]">
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-semibold">Beranda</span>
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