'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { IconArrowLeft, IconUser, IconBuildingStore, IconDeviceMobile, IconLogout, IconHome, IconChartBar, IconRobot, IconBox, IconBook, IconLock, IconDownload, IconPlus, IconWallet, IconNotes, IconX } from '@tabler/icons-react'

type Profile = {
  owner_name: string
  warung_name: string
  phone_number: string
  initial_cash?: number
  initial_debt?: number
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [showChangePIN, setShowChangePIN] = useState(false)
  const [showSaldoModal, setShowSaldoModal] = useState(false)
  const [formData, setFormData] = useState<Profile>({ owner_name: '', warung_name: '', phone_number: '', initial_cash: 0, initial_debt: 0 })
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    const { data } = await supabase
      .from('warung_profiles').select('*').eq('id', user.id).single()
    
    if (data) {
      setProfile(data)
      setFormData(data)
    }
    setLoading(false)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoading(true)
    const { error } = await supabase
      .from('warung_profiles')
      .update(formData)
      .eq('id', user.id)

    if (error) {
      setMessage('❌ Gagal update profil')
    } else {
      setMessage('✅ Profil berhasil diupdate!')
      setProfile(formData)
      setEditing(false)
      setShowSaldoModal(false)
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  async function handleChangePIN() {
    if (!oldPin || !newPin || !confirmPin) {
      setMessage('❌ Semua field wajib diisi!')
      return
    }
    if (newPin !== confirmPin) {
      setMessage('❌ PIN baru tidak cocok!')
      return
    }
    if (newPin.length !== 6) {
      setMessage('❌ PIN harus 6 digit!')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.auth.updateUser({ password: newPin })
      if (error) {
        setMessage('❌ Gagal ganti PIN: ' + error.message)
        setLoading(false)
        return
      }

      await supabase
        .from('warung_profiles')
        .update({ pin_hash: newPin })
        .eq('id', user.id)

      setMessage('✅ PIN berhasil diubah!')
      setOldPin('')
      setNewPin('')
      setConfirmPin('')
      setShowChangePIN(false)
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('❌ Terjadi kesalahan saat ganti PIN')
    }
    setLoading(false)
  }

  async function handleBackup() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setLoading(true)

      const [transactionsData, inventoryData, receivablesData] = await Promise.all([
        supabase.from('transactions').select('*').eq('warung_id', user.id),
        supabase.from('inventory').select('*').eq('warung_id', user.id),
        supabase.from('receivables').select('*').eq('warung_id', user.id),
      ])

      const backup = {
        exportDate: new Date().toISOString(),
        warung: profile,
        transactions: transactionsData.data || [],
        inventory: inventoryData.data || [],
        receivables: receivablesData.data || [],
      }

      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2)))
      element.setAttribute('download', `warpin-backup-${new Date().toISOString().split('T')[0]}.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      setMessage('✅ Backup berhasil diunduh!')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('❌ Gagal membuat backup')
    }
    setLoading(false)
  }

  async function handleAddWarung() {
    window.location.href = '/register'
  }

  async function handleLogout() {
    if (confirm('Yakin mau logout?')) {
      await supabase.auth.signOut()
      window.location.href = '/'
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] px-5 py-4 flex items-center gap-3">
        <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconArrowLeft size={20} color="white" />
        </a>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <IconUser size={20} color="white" />
        </div>
        <div>
          <p className="text-white text-base font-bold">Profil Saya</p>
          <p className="text-white/70 text-xs">Kelola data warung kamu</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {loading ? (
          <p className="text-center text-gray-400 py-8">Memuat profil...</p>
        ) : (
          <>
            {/* Card Profil */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1B4F3A] rounded-2xl flex items-center justify-center">
                  <IconBuildingStore size={32} color="white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pemilik</p>
                  <p className="text-lg font-bold text-gray-800">{profile?.owner_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{profile?.warung_name}</p>
                </div>
              </div>
            </div>

            {/* Edit Profil */}
            {editing ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <p className="text-sm font-bold text-gray-500">Edit Profil</p>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Nama Pemilik</label>
                  <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 gap-3">
                    <IconUser size={18} color="#aaa" />
                    <input type="text" value={formData.owner_name} onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Nama Warung</label>
                  <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 gap-3">
                    <IconBuildingStore size={18} color="#aaa" />
                    <input type="text" value={formData.warung_name} onChange={(e) => setFormData({ ...formData, warung_name: e.target.value })} className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Nomor HP</label>
                  <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 gap-3">
                    <IconDeviceMobile size={18} color="#aaa" />
                    <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#1B4F3A] text-white py-3 rounded-xl font-semibold text-sm">
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button onClick={() => { setEditing(false); setFormData(profile!) }} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm">
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="w-full bg-white border border-gray-200 text-[#1B4F3A] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50">
                Edit Profil
              </button>
            )}

            {/* Ganti PIN */}
            {showChangePIN ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-blue-200">
                <p className="text-sm font-bold text-gray-500">Ganti PIN</p>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">PIN Lama (6 digit)</label>
                  <input type="password" maxLength={6} value={oldPin} onChange={(e) => setOldPin(e.target.value.slice(0, 6))} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]" placeholder="••••••" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">PIN Baru (6 digit)</label>
                  <input type="password" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value.slice(0, 6))} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]" placeholder="••••••" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Ulangi PIN Baru</label>
                  <input type="password" maxLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.slice(0, 6))} className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]" placeholder="••••••" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleChangePIN} disabled={loading} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm">Ganti PIN</button>
                  <button onClick={() => { setShowChangePIN(false); setOldPin(''); setNewPin(''); setConfirmPin('') }} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm">Batal</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowChangePIN(true)} className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <IconLock size={18} /> Ganti PIN
              </button>
            )}

            {/* Tombol-tombol Aksi */}
            <div className="space-y-3">
              <button onClick={handleBackup} disabled={loading} className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <IconDownload size={18} /> Backup Data Warung
              </button>
              
              {/* Tombol Saldo Awal */}
              <button onClick={() => setShowSaldoModal(true)} className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <IconWallet size={18} /> Atur Saldo Awal
              </button>
              
              <button onClick={handleAddWarung} className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <IconPlus size={18} /> Tambah Warung Baru
              </button>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-red-600 transition flex items-center justify-center gap-2">
              <IconLogout size={18} /> Logout
            </button>

            {message && (
              <div className={`rounded-2xl p-3 text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Saldo Awal */}
      {showSaldoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-3xl w-full max-w-sm p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg text-gray-800">Atur Saldo Awal</p>
              <button onClick={() => setShowSaldoModal(false)}><IconX size={20} /></button>
            </div>
            <div>
              <label className="text-sm text-gray-500">Kas Awal (Rp)</label>
              <input type="number" value={formData.initial_cash || 0} onChange={(e) => setFormData({...formData, initial_cash: Number(e.target.value)})} className="w-full bg-gray-50 rounded-xl p-3 mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Utang Awal (Rp)</label>
              <input type="number" value={formData.initial_debt || 0} onChange={(e) => setFormData({...formData, initial_debt: Number(e.target.value)})} className="w-full bg-gray-50 rounded-xl p-3 mt-1" />
            </div>
            <button onClick={handleSave} className="w-full bg-[#1B4F3A] text-white py-3 rounded-xl font-bold">Simpan Saldo</button>
          </div>
        </div>
      )}

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