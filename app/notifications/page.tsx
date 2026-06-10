'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconAlertTriangle, IconNotes, IconPackage, IconHome, IconChartBar, IconMicrophone, IconBox, IconBook } from '@tabler/icons-react'

type Notification = {
  id: string
  type: 'stok_tipis' | 'bon_belum_lunas'
  title: string
  description: string
  timestamp: string
  actionUrl?: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  async function fetchNotifications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    const notifs: Notification[] = []

    // Check stok tipis (qty <= 5)
    const { data: inventory } = await supabase
      .from('inventory').select('*').eq('warung_id', user.id).lte('quantity', 5)
    
    if (inventory && inventory.length > 0) {
      inventory.forEach(item => {
        notifs.push({
          id: `stok-${item.id}`,
          type: 'stok_tipis',
          title: `Stok ${item.item_name} Menipis`,
          description: `Sisa ${item.quantity} pcs — segera tambah stok!`,
          timestamp: new Date().toISOString(),
          actionUrl: '/stok'
        })
      })
    }

    // Check bon belum lunas
    const { data: receivables } = await supabase
      .from('receivables').select('*').eq('warung_id', user.id).eq('status', 'outstanding')
    
    if (receivables && receivables.length > 0) {
      receivables.forEach(bon => {
        notifs.push({
          id: `bon-${bon.id}`,
          type: 'bon_belum_lunas',
          title: `Bon ${bon.customer_name} Belum Lunas`,
          description: `Rp ${bon.amount.toLocaleString('id-ID')} — segera tagih dengan sopan 😊`,
          timestamp: bon.bon_date,
          actionUrl: '/daftar-bon'
        })
      })
    }

    // Jika tidak ada notifikasi
    if (notifs.length === 0) {
      notifs.push({
        id: 'empty',
        type: 'stok_tipis', // Pakai tipe ini saja untuk styling hijau (di-handle di class bawah)
        title: '✨ Semua Lancar!',
        description: 'Tidak ada notifikasi penting. Warung kamu dalam kondisi baik!',
        timestamp: new Date().toISOString(),
      })
    }

    setNotifications(notifs)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <span className="text-lg">🔔</span>
        </div>
        <div>
          <p className="text-white text-base font-bold">Notifikasi</p>
          <p className="text-white/70 text-xs">Update penting warung kamu</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3">

        {loading ? (
          <p className="text-center text-gray-400 py-8">Memuat notifikasi...</p>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-700 font-semibold">Tidak ada notifikasi</p>
          </div>
        ) : (
          notifications.map(notif => (
            <a // <--- INI TAG YANG TADI HILANG DAN BIKIN ERROR
              key={notif.id}
              href={notif.actionUrl || '#'}
              className={`rounded-2xl p-4 shadow-sm block hover:shadow-md transition ${
                notif.id === 'empty' 
                  ? 'bg-green-50 border border-green-200' 
                  : notif.type === 'stok_tipis'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.id === 'empty' ? 'bg-green-100' :
                  notif.type === 'stok_tipis' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {notif.type === 'stok_tipis' ? (
                    <IconPackage size={20} color={notif.id === 'empty' ? '#16A34A' : '#CA8A04'} />
                  ) : (
                    <IconNotes size={20} color="#DC2626" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    notif.id === 'empty' ? 'text-green-700' :
                    notif.type === 'stok_tipis' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {notif.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    notif.id === 'empty' ? 'text-green-600' :
                    notif.type === 'stok_tipis' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {notif.description}
                  </p>
                </div>
                {notif.actionUrl && (
                  <div className={`text-xs font-semibold px-2 py-1 rounded ${
                    notif.type === 'stok_tipis' ? 'bg-yellow-200 text-yellow-700' : 'bg-red-200 text-red-700'
                  }`}>
                    Lihat →
                  </div>
                )}
              </div>
            </a>
          ))
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center">
        <a href="/dashboard" className="flex flex-col items-center text-gray-400">
          <IconHome size={24} />
          <span className="text-xs mt-0.5">Beranda</span>
        </a>
        <a href="/laporan" className="flex flex-col items-center text-gray-400">
          <IconChartBar size={24} />
          <span className="text-xs mt-0.5">Laporan</span>
        </a>
        <a href="/warpin-ai" className="flex flex-col items-center">
          <div className="bg-[#B8860B] rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg">
            <IconMicrophone size={24} color="white" />
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