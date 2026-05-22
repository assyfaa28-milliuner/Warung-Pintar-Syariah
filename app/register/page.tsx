'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const [ownerName, setOwnerName] = useState('')
  const [warungName, setWarungName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRegister() {
    // Validasi input
    if (!ownerName || !warungName || !phoneNumber || !pin || !confirmPin) {
      setMessage('❌ Semua kolom wajib diisi!')
      return
    }
    if (pin.length !== 6) {
      setMessage('❌ PIN harus 6 digit!')
      return
    }
    if (pin !== confirmPin) {
      setMessage('❌ PIN tidak cocok, coba lagi!')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Daftar ke Supabase Auth pakai nomor HP sebagai email
      const fakeEmail = `${phoneNumber}@warpin.app`
      const { data, error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: pin,
      })

      if (error) {
        setMessage(`❌ ${error.message}`)
        return
      }

      // Simpan data profil warung
      const { error: profileError } = await supabase
        .from('warung_profiles')
        .insert({
          id: data.user?.id,
          owner_name: ownerName,
          warung_name: warungName,
          phone_number: phoneNumber,
          pin_hash: pin,
        })

      if (profileError) {
        setMessage(`❌ ${profileError.message}`)
        return
      }

      setMessage('✅ Pendaftaran berhasil! Silakan masuk.')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)

    } catch {
      setMessage('❌ Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1B4F3A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1B4F3A]">🕌 Warpin</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar Warung Baru</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
            <input
              type="text"
              placeholder="Contoh: Ibu Sari"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Warung</label>
            <input
              type="text"
              placeholder="Contoh: Warung Barokah"
              value={warungName}
              onChange={(e) => setWarungName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
            <input
              type="tel"
              placeholder="Contoh: 08123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buat PIN (6 digit)</label>
            <input
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ulangi PIN</label>
            <input
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          {message && (
            <p className="text-center text-sm font-medium text-gray-700">{message}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#1B4F3A] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#163d2d] transition-colors disabled:opacity-50"
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <a href="/" className="text-[#1B4F3A] font-semibold hover:underline">
              Masuk di sini
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}