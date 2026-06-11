'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconChartBar, IconTrendingUp, IconScale, IconCash, IconHome, IconRobot, IconBox, IconBook } from '@tabler/icons-react'

type Transaction = {
  id: string
  type: string
  description: string
  amount: number
  transaction_at: string
}

export default function Laporan() {
  const [activeTab, setActiveTab] = useState<'labarugi' | 'neraca' | 'aruskas'>('labarugi')
  const [filter, setFilter] = useState('hari')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [kasWarung, setKasWarung] = useState(0)
  const [nilaiPersediaan, setNilaiPersediaan] = useState(0)
  const [totalPiutang, setTotalPiutang] = useState(0)
  const [warungName, setWarungName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [filter])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { globalThis.location.href = '/'; return }

    const { data: profile } = await supabase
      .from('warung_profiles').select('warung_name').eq('id', user.id).single()
    if (profile) setWarungName(profile.warung_name)

    // Fetch semua transaksi
    const { data: allTrx } = await supabase
      .from('transactions').select('*')
      .eq('warung_id', user.id).eq('is_deleted', false)
      .order('transaction_at', { ascending: false })

    if (allTrx) {
      let filtered = allTrx

      if (filter === 'hari') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        filtered = allTrx.filter(t => {
          const trxDate = new Date(t.transaction_at)
          return trxDate >= today && trxDate < tomorrow
        })
      } else if (filter === 'minggu') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        sevenDaysAgo.setHours(0, 0, 0, 0)
        
        filtered = allTrx.filter(t => {
          const trxDate = new Date(t.transaction_at)
          return trxDate >= sevenDaysAgo
        })
      } else if (filter === 'bulan') {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        firstDay.setHours(0, 0, 0, 0)
        
        filtered = allTrx.filter(t => {
          const trxDate = new Date(t.transaction_at)
          return trxDate >= firstDay
        })
      }

      setTransactions(filtered)

      const kas = allTrx.reduce((sum, t) => {
        if (t.type === 'sale' || t.type === 'payment') return sum + t.amount
        if (t.type === 'purchase') return sum - t.amount
        return sum
      }, 0)
      setKasWarung(kas)
    }

    const { data: inventory } = await supabase
      .from('inventory').select('purchase_price, quantity').eq('warung_id', user.id)
    if (inventory) {
      setNilaiPersediaan(inventory.reduce((sum, i) => sum + ((i.purchase_price || 0) * (i.quantity || 0)), 0))
    }

    const { data: receivables } = await supabase
      .from('receivables').select('amount').eq('warung_id', user.id).eq('status', 'outstanding')
    if (receivables) setTotalPiutang(receivables.reduce((sum, r) => sum + r.amount, 0))

    setLoading(false)
  }

  const pendapatan = transactions.filter(t => t.type === 'sale' || t.type === 'payment').reduce((sum, t) => sum + t.amount, 0)
  const beban = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0)
  const labaBersih = pendapatan - beban
  const totalAset = kasWarung + nilaiPersediaan + totalPiutang

  // Fitur Cetak PDF Menggunakan Fitur Bawaan Browser yang 100% Akurat
  function handleDownloadPDF() {
    globalThis.print()
  }

  function getTransactionIcon(type: string) {
    if (type === 'sale') return { bg: 'bg-green-100', color: '#16A34A', label: 'Penjualan', income: true }
    if (type === 'purchase') return { bg: 'bg-blue-100', color: '#2563EB', label: 'Beli Stok', income: false }
    if (type === 'receivable') return { bg: 'bg-red-100', color: '#DC2626', label: 'Catat Bon', income: false }
    if (type === 'payment') return { bg: 'bg-green-100', color: '#16A34A', label: 'Pelunasan Bon', income: true }
    return { bg: 'bg-gray-100', color: '#888', label: type, income: true }
  }
 
  return (
    <main className="min-h-screen bg-gray-100 pb-24 print:bg-white print:pb-0">

      {/* Header (Disembunyikan saat dicetak) */}
      <div className="bg-[#1B4F3A] px-5 py-4 print:hidden">
        <div className="flex items-center gap-3 mb-4">
          <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <IconArrowLeft size={20} color="white" />
          </a>
          <div>
            <p className="text-white text-base font-bold">Laporan Keuangan</p>
            <p className="text-white/60 text-xs">{warungName}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-600 transition shadow-sm"
          >
            🖨️ Cetak / Download PDF
          </button>
        </div>

        {/* Filter Periode */}
        <div className="bg-white/10 rounded-xl p-1 flex gap-1">
          {['hari', 'minggu', 'bulan'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filter === f ? 'bg-white text-[#1B4F3A]' : 'text-white/70'
              }`}
            >
              {f === 'hari' ? 'Hari Ini' : f === 'minggu' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 3 Laporan (Disembunyikan saat dicetak) */}
      <div className="px-4 pt-4 print:hidden">
        <div className="flex gap-2">
          {[
            { key: 'labarugi', label: 'Laba Rugi', icon: <IconTrendingUp size={14} /> },
            { key: 'neraca', label: 'Neraca', icon: <IconScale size={14} /> },
            { key: 'aruskas', label: 'Arus Kas', icon: <IconCash size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#1B4F3A] text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Utama PDF */}
      <div id="laporan-content" className="px-4 py-4 space-y-4 print:p-6 print:m-0">
        
        {/* Kop Surat yang hanya muncul saat di-print */}
        <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{warungName}</h1>
          <p className="text-gray-600">Laporan Keuangan - {filter === 'hari' ? 'Hari Ini' : filter === 'minggu' ? '7 Hari Terakhir' : 'Bulan Ini'}</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8 text-sm print:hidden">Memuat laporan...</p>
        ) : (
          <>
            {/* ===== TAB LABA RUGI ===== */}
            {activeTab === 'labarugi' && (
              <div className="space-y-4">
                <div className={`rounded-2xl p-5 shadow-sm text-white print:border print:border-gray-300 print:text-black ${labaBersih >= 0 ? 'bg-[#1B4F3A]' : 'bg-red-500'} print:bg-white`}>
                  <p className="text-white/70 print:text-gray-600 text-xs mb-1">Laba Bersih</p>
                  <p className="text-3xl font-bold">{labaBersih >= 0 ? '+' : ''}Rp {labaBersih.toLocaleString('id-ID')}</p>
                  <p className="text-white/60 print:text-gray-500 text-xs mt-1 print:hidden">
                    {filter === 'hari' ? 'Hari ini' : filter === 'minggu' ? '7 hari terakhir' : 'Bulan ini'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm print:border print:border-gray-200">
                  <p className="text-sm font-bold text-gray-500 mb-3 print:text-black">Rincian</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full print:bg-gray-400"></div>
                        <p className="text-sm text-gray-600 print:text-black">Pendapatan Penjualan</p>
                      </div>
                      <p className="text-sm font-bold text-green-600 print:text-black">Rp {pendapatan.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full print:bg-gray-400"></div>
                        <p className="text-sm text-gray-600 print:text-black">Beban Pembelian Stok</p>
                      </div>
                      <p className="text-sm font-bold text-red-500 print:text-black">Rp {beban.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-700 print:text-black">Laba Bersih</p>
                      <p className={`text-sm font-bold ${labaBersih >= 0 ? 'text-green-600' : 'text-red-500'} print:text-black`}>
                        Rp {labaBersih.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-2xl p-4 shadow-sm print:border print:border-gray-200">
                  <p className="text-sm font-bold text-gray-500 mb-3 print:text-black">Perbandingan</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-600 font-semibold print:text-black">Pendapatan</span>
                        <span className="text-gray-500 print:text-black">Rp {pendapatan.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 print:border print:border-gray-300">
                        <div className="bg-green-500 h-3 rounded-full transition-all print:bg-gray-500" style={{ width: pendapatan + beban > 0 ? `${(pendapatan / (pendapatan + beban)) * 100}%` : '0%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-500 font-semibold print:text-black">Beban</span>
                        <span className="text-gray-500 print:text-black">Rp {beban.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 print:border print:border-gray-300">
                        <div className="bg-red-400 h-3 rounded-full transition-all print:bg-gray-400" style={{ width: pendapatan + beban > 0 ? `${(beban / (pendapatan + beban)) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== TAB NERACA ===== */}
            {activeTab === 'neraca' && (
              <div className="space-y-4">
                <div className="bg-[#1B4F3A] rounded-2xl p-5 shadow-sm text-white print:border print:border-gray-300 print:bg-white print:text-black">
                  <p className="text-white/70 print:text-gray-600 text-xs mb-1">Total Harta Warung</p>
                  <p className="text-3xl font-bold">Rp {totalAset.toLocaleString('id-ID')}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm print:border print:border-gray-200">
                  <p className="text-sm font-bold text-green-600 mb-3 print:text-black">💚 HARTA WARUNG (Aset)</p>
                  <div className="space-y-3">
                    {[
                      { icon: '💵', label: 'Uang di Laci (Kas)', value: kasWarung, desc: 'Uang tunai di kasir' },
                      { icon: '📦', label: 'Barang di Rak', value: nilaiPersediaan, desc: 'Nilai stok × harga beli' },
                      { icon: '📝', label: 'Bon Belum Lunas', value: totalPiutang, desc: 'Piutang pelanggan' },
                    ].map((item, i) => (
                      <div key={i} className={`flex justify-between items-center py-2 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-base print:bg-transparent">{item.icon}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700 print:text-black">{item.label}</p>
                            <p className="text-xs text-gray-400 print:text-gray-600">{item.desc}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-700 print:text-black">Rp {item.value.toLocaleString('id-ID')}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center bg-green-50 rounded-xl p-3 mt-2 print:bg-transparent print:border-t print:border-gray-300">
                      <p className="text-sm font-bold text-gray-700 print:text-black">Total Harta</p>
                      <p className="text-sm font-bold text-[#1B4F3A] print:text-black">Rp {totalAset.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                {/* UTANG */}
<div className="bg-white rounded-2xl p-4 shadow-sm print:border print:border-gray-200">
  <p className="text-sm font-bold text-red-600 mb-3 print:text-black">🔴 UTANG WARUNG (Kewajiban)</p>
  <div className="space-y-3">
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-base print:bg-transparent">💳</div>
        <div>
          <p className="text-sm font-semibold text-gray-700 print:text-black">Utang Supplier</p>
          <p className="text-xs text-gray-400 print:text-gray-600">Hutang pembelian barang</p>
        </div>
      </div>
      <p className="text-sm font-bold text-red-600 print:text-black">Rp 0</p>
    </div>
    <div className="flex justify-between items-center bg-red-50 rounded-xl p-3 mt-2 print:bg-transparent print:border-t print:border-gray-300">
      <p className="text-sm font-bold text-gray-700 print:text-black">Total Utang</p>
      <p className="text-sm font-bold text-red-600 print:text-black">Rp 0</p>
    </div>
  </div>
</div>

{/* EKUITAS */}
<div className="bg-white rounded-2xl p-4 shadow-sm print:border print:border-gray-200 border-2 border-yellow-200">
  <p className="text-sm font-bold text-yellow-600 mb-3 print:text-black">💛 MODAL PEMILIK (Ekuitas)</p>
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm pb-2 border-b border-gray-100">
      <p className="text-gray-600 print:text-black">Total Aset</p>
      <p className="font-semibold print:text-black">Rp {totalAset.toLocaleString('id-ID')}</p>
    </div>
    <div className="flex justify-between items-center text-sm pb-2">
      <p className="text-gray-600 print:text-black">Dikurangi Utang</p>
      <p className="font-semibold print:text-black">- Rp 0</p>
    </div>
    <div className="flex justify-between items-center bg-yellow-50 rounded-xl p-3 mt-2 print:bg-transparent print:border-t print:border-gray-300">
      <p className="text-sm font-bold text-gray-700 print:text-black">MODAL PEMILIK</p>
      <p className="text-sm font-bold text-[#B8860B] print:text-black">Rp {totalAset.toLocaleString('id-ID')}</p>
    </div>
  </div>
</div>

                {/* Info Zakat */}
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 print:border-gray-300">
                  <p className="text-xs font-semibold text-yellow-700 mb-1 print:text-black">🕌 Info Zakat Tijarah</p>
                  <p className="text-xs text-yellow-600 leading-relaxed print:text-gray-700">
                    Total harta warung kamu <strong>Rp {totalAset.toLocaleString('id-ID')}</strong>. Jika sudah mencapai nisab (≈ 85 gram emas) selama 1 tahun, wajib zakat 2,5%.
                  </p>
                  {totalAset > 0 && (
                    <p className="text-xs font-bold text-yellow-800 mt-2 print:text-black">
                      Estimasi zakat: Rp {Math.round(totalAset * 0.025).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ===== TAB ARUS KAS ===== */}
            {activeTab === 'aruskas' && (
              <div className="space-y-4">
                <div className="bg-[#1B4F3A] rounded-2xl p-5 shadow-sm text-white print:border print:border-gray-300 print:bg-white print:text-black">
                  <p className="text-white/70 print:text-gray-600 text-xs mb-1">Saldo Kas Bersih</p>
                  <p className="text-3xl font-bold mb-3">Rp {kasWarung.toLocaleString('id-ID')}</p>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white/10 rounded-xl p-2.5 print:border print:border-gray-300">
                      <p className="text-white/60 print:text-gray-600 text-[10px] mb-1">Kas Masuk</p>
                      <p className="text-green-400 print:text-black text-sm font-bold">+Rp {pendapatan.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-2.5 print:border print:border-gray-300">
                      <p className="text-white/60 print:text-gray-600 text-[10px] mb-1">Kas Keluar</p>
                      <p className="text-red-300 print:text-black text-sm font-bold">-Rp {beban.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm print:border print:border-gray-200">
                  <p className="text-sm font-bold text-gray-500 mb-3 print:text-black">Riwayat Arus Kas</p>
                  {/* Menyaring transaksi agar murni menampilkan mutasi kas fisik saja (mengecualikan 'receivable' / Catat Bon) */}
                  {transactions.filter(t => t.type !== 'receivable').length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4 print:text-black">Belum ada transaksi kas</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions
                        .filter(t => t.type !== 'receivable')
                        .slice(0, 10)
                        .map((t, i, filteredArray) => {
                          const { bg, color, label, income } = getTransactionIcon(t.type)
                          return (
                            <div key={t.id}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center print:bg-transparent print:border print:border-gray-300`} style={{ color }}>
                                    {income ? <IconTrendingUp size={16} /> : <IconBox size={16} />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 print:text-black">{label}</p>
                                    <p className="text-xs text-gray-400 print:text-gray-600">{t.description}</p>
                                  </div>
                                </div>
                                <p className={`text-sm font-bold ${income ? 'text-green-600' : 'text-red-500'} print:text-black`}>
                                  {income ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                                </p>
                              </div>
                              {i < filteredArray.length - 1 && <div className="h-px bg-gray-100 mt-3 print:bg-gray-300" />}
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation (Disembunyikan saat dicetak) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center print:hidden">
        <a href="/dashboard" className="flex flex-col items-center text-gray-400">
          <IconHome size={24} />
          <span className="text-xs mt-0.5">Beranda</span>
        </a>
        <a href="/laporan" className="flex flex-col items-center text-[#1B4F3A]">
          <IconChartBar size={24} />
          <span className="text-xs font-semibold mt-0.5">Laporan</span>
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