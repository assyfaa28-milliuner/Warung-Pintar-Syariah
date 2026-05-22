'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogin() {
    if (!phoneNumber || !pin) {
      setMessage('❌ Nomor HP dan PIN wajib diisi!')
      return
    }
    if (pin.length !== 6) {
      setMessage('❌ PIN harus 6 digit!')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const fakeEmail = `${phoneNumber}@warpin.app`
      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: pin,
      })

      if (error) {
        setMessage('❌ Nomor HP atau PIN salah, coba lagi!')
        return
      }

      setMessage('✅ Login berhasil! Mengalihkan...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)

    } catch {
      setMessage('❌ Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#1B4F3A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1B4F3A]">🕌 Warpin</h1>
          <p className="text-gray-500 text-sm mt-1">Warung Pintar Syariah</p>
          <p className="text-gray-400 text-xs mt-1 italic">Catat Warung, Sesuai Syariah.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor HP
            </label>
            <input
              type="tel"
              placeholder="Contoh: 08123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN (6 digit)
            </label>
            <input
              type="password"
              placeholder="••••••"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1B4F3A]"
            />
          </div>

          {message && (
            <p className="text-center text-sm font-medium text-gray-700">{message}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#1B4F3A] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#163d2d] transition-colors disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <a href="/register" className="text-[#1B4F3A] font-semibold hover:underline">
              Daftar Warung Baru
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}