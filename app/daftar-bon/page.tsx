'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconNotes, IconCheck, IconPlus, IconUser, IconCalendar } from '@tabler/icons-react'

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

  useEffect(() => { fetchReceivables() }, [])

  async function fetchReceivables() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { globalThis.location.href = '/'; return }

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

    await supabase
      .from('receivables')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', receivable.id)

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
      <div className="bg-[#DC2626] px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconNotes size={20} color="white" />
        </div>
        <div>
          <p className="text-white text-base font-bold">Daftar Bon</p>
          <p className="text-white/70 text-xs">Piutang pelanggan yang belum lunas</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Total Piutang */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Piutang Belum Lunas</p>
          <p className="text-3xl font-bold text-red-500">
            Rp {totalPiutang.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400 mt-1">{receivables.length} pelanggan belum bayar</p>
        </div>

        {/* Notifikasi */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="font-semibold text-green-700 text-sm">{message}</p>
          </div>
        )}

        {/* Daftar Bon */}
        {loading ? (
          <p className="text-center text-gray-400 py-8 text-sm">Memuat data...</p>
        ) : receivables.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <IconCheck size={32} color="#16A34A" />
            </div>
            <p className="text-gray-700 font-semibold">Tidak ada bon yang belum lunas!</p>
            <p className="text-gray-400 text-sm mt-1">Semua pelanggan sudah bayar 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receivables.map((receivable) => (
              <div key={receivable.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <IconUser size={20} color="#DC2626" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{receivable.customer_name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <IconCalendar size={12} color="#aaa" />
                        <p className="text-xs text-gray-400">{receivable.bon_date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-500">
                      Rp {receivable.amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-400">Tanpa bunga 🕌</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleLunas(receivable)}
                  className="w-full bg-[#1B4F3A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#163d2d] transition-colors flex items-center justify-center gap-2"
                >
                  <IconCheck size={16} />
                  Tandai Lunas
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tombol Tambah Bon */}
        <a
          href="/catat-bon"
          className="flex items-center justify-center gap-2 bg-[#DC2626] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
        >
          <IconPlus size={18} />
          Catat Bon Baru
        </a>

      </div>
    </main>
  )
}