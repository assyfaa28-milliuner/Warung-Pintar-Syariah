'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const pinRef = useRef<HTMLInputElement | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [pinFocused, setPinFocused] = useState(false)
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
        globalThis.location.href = '/dashboard'
      }, 1200)
    } catch {
      setMessage('❌ Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F1E8] flex items-center justify-center p-4">
      <div className="w-[390px]">
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#E8E3D7]">
          <div className="bg-[#1B4F3A] px-6 pt-6 pb-6 text-center rounded-t-[28px]">
            <div className="mx-auto mb-0 flex h-28 w-28 items-center justify-center rounded-[26px] bg-[#1B4F3A]">
              <Image src="/Logo WARPIN.png" alt="Warpin" width={80} height={80} className="w-20 h-20" />
            </div>
            <h1 className="text-white text-2xl font-semibold -mt-3">Warpin</h1>
            <p className="text-white text-xs mt-1">Warung Pintar Syariah</p>
            <p className="text-[#FFD700] text-xs italic mt-0.5">Catat Warung, Sesuai Syariah.</p>
          </div>

          <div className="px-8 pb-10 pt-8 bg-white">
            <div className="mb-6 text-left">
              <h2 className="text-xl font-semibold text-gray-900">Selamat datang!</h2>
              <p className="text-sm text-gray-600 mt-1">Masuk ke warung kamu</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-3">Nomor HP</label>
                <div className="flex items-center gap-3 rounded-[20px] border border-[#E8E3D7] bg-[#F6F4EB] px-4 py-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3H8C6.9 3 6 3.9 6 5v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17.5h.009" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-3">PIN (6 digit)</label>
                <div className="grid grid-cols-6 gap-2.5 mb-3 cursor-text" onClick={() => pinRef.current?.focus()}>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 w-12 rounded-[16px] border ${pinFocused && i === pin.length ? 'border-[#1B4F3A]' : 'border-[#E8E3D7]'} bg-[#F6F4EB] flex items-center justify-center text-2xl font-semibold text-gray-700`}
                    >
                      {pin[i] ? '•' : pinFocused && i === pin.length ? <span className="block h-5 w-[2px] rounded bg-[#1B4F3A] animate-pulse" /> : ''}
                    </div>
                  ))}
                </div>
                <input
                  ref={pinRef}
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setPinFocused(true)}
                  onBlur={() => setPinFocused(false)}
                  className="sr-only"
                  aria-label="PIN 6 digit"
                />
              </div>

              {message && <p className="text-center text-sm text-gray-700">{message}</p>}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#1B4F3A] text-white py-4 rounded-[24px] text-lg font-semibold hover:bg-[#163d2d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link href="/register" className="text-[#1B4F3A] font-semibold hover:underline">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}