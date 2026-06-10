'use client'

import { useState, useEffect } from 'react'
import { IconArrowLeft, IconHome, IconChartBar, IconRobot, IconBox, IconBook, IconClock, IconChevronRight, IconSchool, IconCoin, IconStar, IconScale, IconMoon, IconChartLine, IconBulb, IconShare } from '@tabler/icons-react'

const modules = [
  {
    id: 1,
    icon: <IconCoin size={24} color="#16A34A" />,
    bg: 'bg-green-100',
    title: 'Kenapa Harus Catat Keuangan?',
    desc: 'Pentingnya mencatat setiap transaksi warung',
    duration: '3 menit baca',
    content: `Banyak pemilik warung yang merasa "toh warung saya jalan-jalan aja". Tapi tahukah kamu, tanpa catatan keuangan yang rapi, kamu tidak tahu apakah warungmu benar-benar untung atau rugi!

Bayangkan ini: kamu jual barang setiap hari, tapi uang warung dan uang rumah tangga tercampur. Di akhir bulan, uang terasa habis padahal warung ramai. Ini namanya "laba palsu" — kamu kira untung, padahal sudah rugi!

Dengan Warpin, setiap transaksi tercatat rapi. Kamu bisa tahu persis: berapa untung hari ini, berapa stok yang tersisa, dan berapa yang masih dihutang pelanggan. Yuk mulai catat dari sekarang!`
  },
  {
    id: 2,
    icon: <IconStar size={24} color="#B8860B" />,
    bg: 'bg-yellow-100',
    title: 'Apa Itu Akad Qardh?',
    desc: 'Pahami hukum bon pelanggan dalam Islam',
    duration: '4 menit baca',
    content: `Ketika pelanggan minta bon (hutang), kamu sedang melakukan akad Qardh — yaitu pinjaman kebajikan dalam Islam.

Hukumnya: kamu TIDAK BOLEH menambahkan bunga atau denda apapun atas bon tersebut. Kalau pelanggan bon Rp 20.000, yang dibayar balik juga Rp 20.000 — tidak lebih!

Kenapa? Karena menambah bunga atas pinjaman namanya RIBA, dan riba hukumnya haram dalam Islam. Warpin sudah otomatis menjaga ini — sistem tidak akan pernah menghitung bunga pada bon pelanggan kamu.

Jadi kamu bisa tenang, bon di Warpin sudah sesuai syariah! 🕌`
  },
  {
    id: 3,
    icon: <IconScale size={24} color="#2563EB" />,
    bg: 'bg-blue-100',
    title: 'Memahami Neraca Warung',
    desc: 'Belajar membaca kondisi keuangan warung kamu',
    duration: '5 menit baca',
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
    icon: <IconMoon size={24} color="#DC2626" />,
    bg: 'bg-red-100',
    title: 'Zakat Tijarah',
    desc: 'Kewajiban zakat pedagang Muslim',
    duration: '5 menit baca',
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
    icon: <IconChartLine size={24} color="#7C3AED" />,
    bg: 'bg-purple-100',
    title: 'Cara Membaca Laporan Keuangan',
    desc: 'Pahami laporan harian, mingguan, dan bulanan',
    duration: '4 menit baca',
    content: `Laporan keuangan di Warpin ada tiga: Hari Ini, Minggu Ini, dan Bulan Ini. Ini cara membacanya:

LABA RUGI = Pendapatan - Beban
- Kalau hijau → warung untung, alhamdulillah! 🎉
- Kalau merah → perlu evaluasi pengeluaran

NERACA = Foto kondisi keuangan warung hari ini
- Harta Warung: kas + stok + piutang
- Titipan: dana yang bukan milik warung

ARUS KAS = Uang masuk dan keluar
- Masuk: penjualan + pelunasan bon
- Keluar: belanja stok ke agen

Tips: Cek laporan setiap malam sebelum tutup warung!`
  },
  {
    id: 6,
    icon: <IconBulb size={24} color="#EA580C" />,
    bg: 'bg-orange-100',
    title: '5 Tips Kelola Warung Berkah',
    desc: 'Tips praktis mengelola warung kelontong',
    duration: '3 menit baca',
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

  // --- FUNGSI SHARE ---
  const handleShare = async () => {
    if (!selectedModule) return

    const shareText = `*${selectedModule.title}*\n\n${selectedModule.content}\n\n📚 Belajar bareng di Warpin (Warung Pintar Syariah)`

    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedModule.title,
          text: shareText,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback jika browser tidak support Web Share API (misal di PC)
      navigator.clipboard.writeText(shareText)
      alert('Teks berhasil disalin ke clipboard! Silakan paste untuk membagikan.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-24">

      {/* Menghilangkan scrollbar bawaan browser untuk class scrollbar-hide */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {selectedModule ? (
        /* Detail Modul */
        <>
          <div className="bg-[#1B4F3A] px-5 py-4 flex items-center gap-3">
            <button
              onClick={() => setSelectedModule(null)}
              className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <IconArrowLeft size={20} color="white" />
            </button>
            <div>
              <p className="text-white text-base font-bold">{selectedModule.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <IconClock size={11} color="rgba(255,255,255,0.6)" />
                <p className="text-white/60 text-xs">{selectedModule.duration}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`w-14 h-14 ${selectedModule.bg} rounded-2xl flex items-center justify-center mb-4`}>
                {selectedModule.icon}
              </div>
              <h2 className="text-lg font-bold text-[#1B4F3A] mb-4">{selectedModule.title}</h2>
              <div className="space-y-3">
                {selectedModule.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">{paragraph}</p>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <IconArrowLeft size={18} />
                  Kembali
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-[#1B4F3A] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#163d2d] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <IconShare size={18} />
                  Bagikan Ilmu
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Daftar Modul */
        <>
          <div className="bg-[#1B4F3A] px-5 py-4">
            <div className="flex items-center gap-3 mb-4">
              <a href="/dashboard" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <IconArrowLeft size={20} color="white" />
              </a>
              <div>
                <p className="text-white text-base font-bold">Akademi Warung</p>
                <p className="text-white/60 text-xs">Belajar keuangan & syariah</p>
              </div>
            </div>

            {/* Banner */}
            <div className="bg-white/12 rounded-2xl p-4 border border-white/15 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <IconSchool size={26} color="#FFD700" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Tingkatkan Ilmu Warungmu!</p>
                <p className="text-white/65 text-xs mt-1">6 modul gratis seputar keuangan & muamalah Islam</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 space-y-3">
            <p className="text-xs font-semibold text-gray-400">MODUL TERSEDIA</p>
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition text-left"
              >
                <div className={`w-12 h-12 ${module.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {module.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1B4F3A]">{module.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{module.desc}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <IconClock size={11} color="#aaa" />
                    <span className="text-xs text-gray-400">{module.duration}</span>
                  </div>
                </div>
                <IconChevronRight size={18} color="#ccc" />
              </button>
            ))}
          </div>
        </>
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
        <a href="/akademi" className="flex flex-col items-center text-[#1B4F3A]">
          <IconBook size={24} />
          <span className="text-xs font-semibold mt-0.5">Akademi</span>
        </a>
      </div>

    </main>
  )
}