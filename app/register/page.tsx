'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const pinRef = useRef<HTMLInputElement | null>(null)
  const confirmPinRef = useRef<HTMLInputElement | null>(null)
  const [ownerName, setOwnerName] = useState('')
  const [warungName, setWarungName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinFocused, setPinFocused] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)
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
      // PERBAIKAN 1: Menggunakan globalThis sebagai pengganti window
      setTimeout(() => {
        globalThis.location.href = '/'
      }, 2000)

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
            <h1 className="text-white text-2xl font-semibold -mt-3">Daftar Warung Baru</h1>
            <p className="text-[#FFD700] text-xs italic mt-1">Catat Warung, Sesuai Syariah.</p>
          </div>

          <div className="px-8 pb-10 pt-8 bg-white">
            <div className="space-y-4">
              <div>
                {/* PERBAIKAN 2: Menambahkan htmlFor dan id untuk Nama Pemilik */}
                <label htmlFor="ownerName" className="block text-sm text-gray-700 mb-2">Nama Pemilik</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#E5E2D8] bg-[#F8F7F2] px-4 py-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center border border-[#E5E2D8] bg-white text-gray-600">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    id="ownerName"
                    type="text"
                    placeholder="Contoh: Ibu Sari"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                {/* PERBAIKAN 3: Menambahkan htmlFor dan id untuk Nama Warung */}
                <label htmlFor="warungName" className="block text-sm text-gray-700 mb-2">Nama Warung</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#E5E2D8] bg-[#F8F7F2] px-4 py-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center border border-[#E5E2D8] bg-white text-gray-600">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8h16v8H4V8Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 16h16" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <input
                    id="warungName"
                    type="text"
                    placeholder="Contoh: Warung Barokah"
                    value={warungName}
                    onChange={(e) => setWarungName(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                {/* PERBAIKAN 4: Menambahkan htmlFor dan id untuk Nomor HP */}
                <label htmlFor="phoneNumber" className="block text-sm text-gray-700 mb-3">Nomor HP</label>
                <div className="flex items-center gap-3 rounded-[26px] border border-[#E8E3D7] bg-[#F6F4EB] px-4 py-4">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3H8C6.9 3 6 3.9 6 5v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17.5h.009" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent text-base text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                {/* PERBAIKAN 5: Menambahkan htmlFor dan id untuk Buat PIN */}
                <label htmlFor="pinInput" className="block text-sm text-gray-700 mb-3">Buat PIN (6 digit)</label>
                <div
                  className="grid grid-cols-6 gap-2.5 mb-3 cursor-text"
                  onClick={() => pinRef.current?.focus()}
                >
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
                  id="pinInput"
                  ref={pinRef}
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setPinFocused(true)}
                  onBlur={() => setPinFocused(false)}
                  className="sr-only"
                  aria-label="Buat PIN 6 digit"
                />
              </div>

              <div>
                {/* PERBAIKAN 6: Menambahkan htmlFor dan id untuk Ulangi PIN */}
                <label htmlFor="confirmPinInput" className="block text-sm text-gray-700 mb-3">Ulangi PIN</label>
                <div
                  className="grid grid-cols-6 gap-2.5 mb-3 cursor-text"
                  onClick={() => confirmPinRef.current?.focus()}
                >
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 w-12 rounded-[16px] border ${confirmFocused && i === confirmPin.length ? 'border-[#1B4F3A]' : 'border-[#E8E3D7]'} bg-[#F6F4EB] flex items-center justify-center text-2xl font-semibold text-gray-700`}
                    >
                      {confirmPin[i] ? '•' : confirmFocused && i === confirmPin.length ? <span className="block h-5 w-[2px] rounded bg-[#1B4F3A] animate-pulse" /> : ''}
                    </div>
                  ))}
                </div>
                <input
                  id="confirmPinInput"
                  ref={confirmPinRef}
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  className="sr-only"
                  aria-label="Ulangi PIN 6 digit"
                />
              </div>

              {message && (
                <p className="text-center text-sm text-gray-700">{message}</p>
              )}

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#1B4F3A] text-white py-4 rounded-[24px] text-lg font-semibold hover:bg-[#163d2d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Sudah punya akun?{' '}
                <Link href="/" className="text-[#1B4F3A] font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}