'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  IconHome, IconChartBar, IconRobot, IconBox, IconBook,
  IconBell, IconShoppingCart, IconPackage, IconCamera, IconNotes,
  IconCheck, IconWallet, IconUser
} from '@tabler/icons-react'

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
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }

      const { data: profile } = await supabase
        .from('warung_profiles').select('*').eq('id', user.id).single()
      if (profile) { setWarungName(profile.warung_name); setOwnerName(profile.owner_name) }

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('warung_id', user.id)
        .eq('is_deleted', false)
        .order('transaction_at', { ascending: false })

      if (transactions) {
        // Hitung total kas
        const kas = transactions.reduce((sum, t) => {
          if (t.type === 'sale' || t.type === 'payment') return sum + t.amount
          if (t.type === 'purchase') return sum - t.amount
          return sum
        }, 0)
        setKasWarung(kas)

        // Perbaikan Zona Waktu
        const now = new Date()
        const utcTodayStr = now.toISOString().split('T')[0]
        const startOfTodayUTC = `${utcTodayStr}T00:00:00.000Z`

        const todayTrx = transactions.filter(t => t.transaction_at >= startOfTodayUTC)

        // Hitung untung hari ini
        const untung = todayTrx.reduce((sum, t) => {
          if (t.type === 'sale' || t.type === 'payment') return sum + t.amount
          if (t.type === 'purchase') return sum - t.amount
          return sum
        }, 0)
        setUntungHariIni(untung)

        // Ambil 5 transaksi terakhir
        setRecentTransactions(transactions.slice(0, 5))
      }

      const { data: receivables } = await supabase
        .from('receivables').select('amount').eq('warung_id', user.id).eq('status', 'outstanding')
      if (receivables) {
        setTotalPiutang(receivables.reduce((sum, r) => sum + r.amount, 0))
      }

      setLoading(false)
    }
    loadDashboard()
  }, [])

  function getTransactionInfo(type: string) {
    if (type === 'sale') return { bg: 'bg-green-100', color: '#16A34A', icon: <IconShoppingCart size={20} />, label: 'Catat Jual', income: true }
    if (type === 'purchase') return { bg: 'bg-blue-100', color: '#2563EB', icon: <IconPackage size={20} />, label: 'Tambah Stok', income: false }
    if (type === 'receivable') return { bg: 'bg-red-100', color: '#DC2626', icon: <IconNotes size={20} />, label: 'Catat Bon', income: false }
    if (type === 'payment') return { bg: 'bg-green-100', color: '#16A34A', icon: <IconCheck size={20} />, label: 'Pelunasan Bon', income: true }
    return { bg: 'bg-gray-100', color: '#888', icon: <IconWallet size={20} />, label: type, income: true }
  }

  async function handleDeleteTrx(trxId: string) {
    if (!confirm('Yakin hapus transaksi ini?')) return
    const { error } = await supabase.from('transactions').update({ is_deleted: true }).eq('id', trxId)
    if (!error) {
      setRecentTransactions(recentTransactions.filter(t => t.id !== trxId))
      setSelectedTrx(null)
    }
  }

  async function handleSaveTrx() {
    if (!selectedTrx) return
    const { error } = await supabase
      .from('transactions')
      .update({ description: selectedTrx.description, amount: selectedTrx.amount })
      .eq('id', selectedTrx.id)
    
    if (!error) {
      setRecentTransactions(recentTransactions.map(t => t.id === selectedTrx.id ? selectedTrx : t))
      setSelectedTrx(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Memuat data warung...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] px-5 pt-5 pb-8">
        <div className="flex justify-between items-center mb-5">
          <div>
            <p className="text-white/70 text-xs">Assalamu'alaikum 👋</p>
            <a href="/profile" className="text-white text-lg font-bold mt-1 hover:opacity-80 transition">
              {ownerName || 'Pemilik Warung'}
            </a>
            <p className="text-white/60 text-xs mt-0.5">{warungName || 'Warung Pintar Syariah'}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/notifications" className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/25 transition">
              <IconBell size={20} color="white" />
            </a>
            <a href="/profile" className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/25 transition">
              <IconUser size={20} color="white" />
            </a>
          </div>
        </div>

        {/* Kartu Kas */}
        <div className="bg-white/12 rounded-2xl p-4 border border-white/15">
          <p className="text-white/70 text-xs mb-1">Total Kas Warung</p>
          <p className="text-white text-3xl font-bold mb-3">
            Rp {kasWarung.toLocaleString('id-ID')}
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-xl p-2.5">
              <p className="text-white/60 text-[10px] mb-1">Untung Hari Ini</p>
              <p className={`text-sm font-bold ${untungHariIni >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {untungHariIni >= 0 ? '+' : ''}Rp {untungHariIni.toLocaleString('id-ID')}
              </p>
            </div>
            <a href="/daftar-bon" className="flex-1 bg-white/10 rounded-xl p-2.5">
              <p className="text-white/60 text-[10px] mb-1">Piutang Bon</p>
              <p className="text-red-300 text-sm font-bold">
                Rp {totalPiutang.toLocaleString('id-ID')}
              </p>
            </a>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* Aksi Cepat */}
        <div>
          <p className="text-sm font-bold text-gray-500 mb-3">Aksi Cepat</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/catat-jual', bg: 'bg-green-100', color: '#16A34A', icon: <IconShoppingCart size={24} color="#16A34A" />, label: 'Catat Jual' },
              { href: '/tambah-stok', bg: 'bg-blue-100', color: '#2563EB', icon: <IconPackage size={24} color="#2563EB" />, label: 'Tambah Stok' },
              { href: '/scan-nota', bg: 'bg-yellow-100', color: '#CA8A04', icon: <IconCamera size={24} color="#CA8A04" />, label: 'Scan Nota' },
              { href: '/catat-bon', bg: 'bg-red-100', color: '#DC2626', icon: <IconNotes size={24} color="#DC2626" />, label: 'Catat Bon' },
            ].map((item) => (
              <a key={item.href} href={item.href} className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-[#1B4F3A]">{item.label}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Catatan Terakhir */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold text-gray-500">Catatan Terakhir</p>
            <a href="/laporan" className="text-xs text-[#1B4F3A] font-semibold">Lihat semua →</a>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada transaksi. Yuk mulai catat! 😊</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((t, index) => {
                  const { bg, color, icon, label, income } = getTransactionInfo(t.type)
                  return (
                    <div key={t.id}>
                      <button
                        onClick={() => setSelectedTrx(t)}
                        className="w-full flex justify-between items-center hover:bg-gray-50 p-2 rounded-lg transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`} style={{ color }}>
                            {icon}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-700">{label}</p>
                            <p className="text-xs text-gray-400">{t.description}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${income ? 'text-green-600' : 'text-red-500'}`}>
                          {income ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                        </p>
                      </button>
                      {index < recentTransactions.length - 1 && <div className="h-px bg-gray-100 mt-3" />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Edit Transaksi */}
      {selectedTrx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <p className="text-base font-bold text-gray-800">Edit Transaksi</p>
              <button onClick={() => setSelectedTrx(null)} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Jenis</label>
                <p className="text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl">{getTransactionInfo(selectedTrx.type).label}</p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={selectedTrx.description}
                  onChange={(e) => setSelectedTrx({ ...selectedTrx, description: e.target.value })}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={selectedTrx.amount}
                  onChange={(e) => setSelectedTrx({ ...selectedTrx, amount: Number(e.target.value) })}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Waktu</label>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl font-mono">{new Date(selectedTrx.transaction_at).toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveTrx}
                className="flex-1 bg-[#1B4F3A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#163d2d]"
              >
                Simpan
              </button>
              <button
                onClick={() => handleDeleteTrx(selectedTrx.id)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center">
        <a href="/dashboard" className="flex flex-col items-center text-[#1B4F3A]">
          <IconHome size={24} />
          <span className="text-xs font-semibold mt-0.5">Beranda</span>
        </a>
        <a href="/laporan" className="flex flex-col items-center text-gray-400">
          <IconChartBar size={24} />
          <span className="text-xs mt-0.5">Laporan</span>
        </a>
        <a href="/warpin-ai" className="flex flex-col items-center">
          <div className="bg-[#B8860B] rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg">
            <IconRobot size={24} color="white" />
          </div>
          <span className="text-xs text-[#B8860B] font-semibold mt-1">Warpin AI</span>
        </a>
        <a href="/stok" className="flex flex-col items-center text-gray-400">
          <IconBox size={24} />
          <span className="text-xs mt-0.5">Stok</span>
        </a>
        <a href="/akademi" className="flex flex-col items-center text-gray-400">
          <IconBook size={24} />
          <span className="text-xs mt-0.5">Akademi</span>
        </a>
      </div>

    </main>
  )
}