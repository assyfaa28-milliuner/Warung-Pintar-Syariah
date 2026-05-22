'use client'

import { useState } from 'react'

const modules = [
  {
    id: 1,
    emoji: '💰',
    title: 'Kenapa Harus Catat Keuangan?',
    desc: 'Pelajari pentingnya mencatat setiap transaksi warung',
    content: `Banyak pemilik warung yang merasa "toh warung saya jalan-jalan aja". Tapi tahukah kamu, tanpa catatan keuangan yang rapi, kamu tidak tahu apakah warungmu benar-benar untung atau rugi!

Bayangkan ini: kamu jual barang setiap hari, tapi uang warung dan uang rumah tangga tercampur. Di akhir bulan, uang terasa habis padahal warung ramai. Ini namanya "laba palsu" — kamu kira untung, padahal sudah rugi!

Dengan Warpin, setiap transaksi tercatat rapi. Kamu bisa tahu persis: berapa untung hari ini, berapa stok yang tersisa, dan berapa yang masih dihutang pelanggan. Yuk mulai catat dari sekarang!`
  },
  {
    id: 2,
    emoji: '🕌',
    title: 'Apa Itu Akad Qardh?',
    desc: 'Pahami hukum bon pelanggan dalam Islam',
    content: `Ketika pelanggan minta bon (hutang), kamu sedang melakukan akad Qardh — yaitu pinjaman kebajikan dalam Islam.

Hukumnya: kamu TIDAK BOLEH menambahkan bunga atau denda apapun atas bon tersebut. Kalau pelanggan bon Rp 20.000, yang dibayar balik juga Rp 20.000 — tidak lebih!

Kenapa? Karena menambah bunga atas pinjaman namanya RIBA, dan riba hukumnya haram dalam Islam. Warpin sudah otomatis menjaga ini — sistem tidak akan pernah menghitung bunga pada bon pelanggan kamu.

Jadi kamu bisa tenang, bon di Warpin sudah sesuai syariah! 🕌`
  },
  {
    id: 3,
    emoji: '⚖️',
    title: 'Memahami Neraca Warung',
    desc: 'Belajar membaca kondisi keuangan warung kamu',
    content: `Neraca itu ibarat "foto kondisi warung hari ini". Tidak perlu pusing, ini penjelasan sederhananya:

HARTA WARUNG (Aset) — semua yang warung PUNYA:
- Uang di laci kasir
- Barang di rak (dinilai dari harga beli)
- Bon pelanggan yang belum lunas

TITIPAN & UTANG (Liabilitas) — semua yang warung WAJIB KEMBALIKAN:
- Dana sedekah atau kembalian pelanggan yang dititipkan

Rumusnya sederhana: Harta Warung = Modal + Keuntungan yang kamu simpan.

Kalau Harta Warung terus bertambah setiap bulan, berarti warungmu sehat dan berkembang! 🎉`
  },
  {
    id: 4,
    emoji: '🌙',
    title: 'Zakat Tijarah — Kewajiban Pedagang Muslim',
    desc: 'Pelajari kewajiban zakat atas harta dagangan',
    content: `Sebagai pedagang Muslim, ada kewajiban zakat yang disebut Zakat Tijarah (zakat perdagangan).

Syaratnya ada dua:
1. NISAB: Total harta warung (uang + stok + bon) sudah mencapai nilai setara 85 gram emas
2. HAUL: Sudah berlalu 1 tahun penuh (tahun Hijriah) sejak nisab tercapai

Kalau kedua syarat terpenuhi, wajib mengeluarkan 2,5% dari total harta warung.

Contoh: Harta warung Rp 10.000.000 → Zakat = Rp 250.000

Warpin otomatis memantau ini dan akan memberitahu kamu saat zakat sudah wajib dikeluarkan. Semoga harta kita selalu berkah! 🕌`
  },
  {
    id: 5,
    emoji: '📊',
    title: 'Cara Membaca Laporan Keuangan',
    desc: 'Pahami laporan harian, mingguan, dan bulanan',
    content: `Laporan keuangan di Warpin ada tiga: Hari Ini, Minggu Ini, dan Bulan Ini. Ini cara membacanya:

UNTUNG BERSIH = Uang Masuk - Uang Keluar
- Kalau hijau → warung untung, alhamdulillah! 🎉
- Kalau merah → perlu evaluasi pengeluaran

UANG MASUK = semua penjualan + pelunasan bon pelanggan
UANG KELUAR = semua belanja stok ke agen/grosir

Tips: Cek laporan setiap malam sebelum tutup warung. Kalau uang keluar hampir sama dengan uang masuk, berarti margin keuntungan kamu tipis — pertimbangkan untuk menaikkan harga jual sedikit!`
  },
  {
    id: 6,
    emoji: '💡',
    title: '5 Tips Kelola Warung yang Berkah',
    desc: 'Tips praktis mengelola warung kelontong',
    content: `Berikut 5 tips dari Warpin untuk warung yang berkah dan menguntungkan:

1. CATAT SETIAP TRANSAKSI 📝
Sekecil apapun, catat! Jangan andalkan ingatan karena ingatan bisa salah.

2. PISAHKAN UANG WARUNG & RUMAH TANGGA 👛
Ini kunci utama! Kalau tercampur, kamu tidak akan pernah tahu kondisi warung sebenarnya.

3. CEK STOK RUTIN 📦
Tambah stok sebelum habis, bukan setelah habis. Pelanggan yang tidak dapat barang bisa pindah ke warung lain!

4. TAGIH BON DENGAN SOPAN 😊
Bon yang tidak ditagih = uang yang hilang. Tagih dengan ramah dan catat setiap pelunasan.

5. SISIHKAN UNTUK ZAKAT 🕌
Kalau warung sudah berkembang dan mencapai nisab, jangan lupa kewajiban zakat tijarah!`
  }
]

export default function Akademi() {
  const [selectedModule, setSelectedModule] = useState<typeof modules[0] | null>(null)

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Header */}
      <div className="bg-[#1B4F3A] text-white px-4 py-5 flex items-center gap-3">
        {selectedModule ? (
          <button onClick={() => setSelectedModule(null)} className="text-white text-2xl">←</button>
        ) : (
          <a href="/dashboard" className="text-white text-2xl">←</a>
        )}
        <div>
          <h1 className="text-xl font-bold">📚 Akademi Warung</h1>
          <p className="text-sm opacity-80">Belajar keuangan & syariah</p>
        </div>
      </div>

      {selectedModule ? (
        /* Detail Modul */
        <div className="px-4 py-5">
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="text-center mb-4">
              <span className="text-5xl">{selectedModule.emoji}</span>
              <h2 className="text-xl font-bold text-[#1B4F3A] mt-2">{selectedModule.title}</h2>
            </div>
            <div className="space-y-3">
              {selectedModule.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-700 text-sm leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <button
              onClick={() => setSelectedModule(null)}
              className="w-full mt-6 bg-[#1B4F3A] text-white py-3 rounded-xl font-semibold hover:bg-[#163d2d] transition-colors"
            >
              ← Kembali ke Daftar Modul
            </button>
          </div>
        </div>
      ) : (
        /* Daftar Modul */
        <div className="px-4 py-5 space-y-3">
          <p className="text-gray-500 text-sm">Pilih modul yang ingin kamu pelajari:</p>
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className="w-full bg-white rounded-2xl p-4 shadow text-left hover:shadow-md transition flex items-center gap-4"
            >
              <span className="text-3xl">{module.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-[#1B4F3A]">{module.title}</p>
                <p className="text-xs text-gray-400 mt-1">{module.desc}</p>
              </div>
              <span className="text-gray-300 text-xl">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center">
        <a href="/dashboard" className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">🏠</span>
          <span className="text-xs">Beranda</span>
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
        <a href="/akademi" className="flex flex-col items-center text-[#1B4F3A]">
          <span className="text-2xl">📚</span>
          <span className="text-xs font-semibold">Akademi</span>
        </a>
      </div>

    </main>
  )
}