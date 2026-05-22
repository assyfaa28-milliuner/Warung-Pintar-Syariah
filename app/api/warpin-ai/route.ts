import { NextRequest, NextResponse } from 'next/server'

function getReply(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes('zakat')) {
    return 'Zakat tijarah itu zakat yang wajib dikeluarkan dari harta perdagangan ya Kak! 🕌 Kalau total harta warung sudah mencapai nisab (setara 85 gram emas) dan sudah berlalu 1 tahun, wajib dikeluarkan 2,5% dari total harta. Warpin sudah otomatis menghitung ini di halaman Neraca!'
  }

  if (msg.includes('bon') || msg.includes('piutang') || msg.includes('hutang')) {
    return 'Bon pelanggan di Warpin dicatat pakai Akad Qardh ya Kak! 😊 Artinya pinjaman kebajikan tanpa bunga. Jadi kalau pelanggan bon Rp 50.000, yang dibayar balik juga Rp 50.000 — tidak boleh ditambah bunga karena itu namanya riba yang dilarang dalam Islam.'
  }

  if (msg.includes('akad qardh') || msg.includes('riba')) {
    return 'Akad Qardh itu akad pinjaman kebajikan dalam Islam Kak! 🕌 Tidak boleh ada tambahan bunga atau denda apapun. Warpin sudah otomatis menjaga ini — sistem tidak akan pernah menambahkan bunga pada bon pelanggan kamu.'
  }

  if (msg.includes('neraca')) {
    return 'Neraca itu ibarat foto kondisi warung hari ini Kak! 📸 Bagian Harta Warung isinya semua yang warung punya: uang di laci, barang di rak, dan bon yang belum lunas. Buka menu Neraca di bawah untuk lihat kondisi warung kamu sekarang!'
  }

  if (msg.includes('laporan') || msg.includes('untung') || msg.includes('rugi')) {
    return 'Laporan keuangan di Warpin bisa dilihat di menu Laporan Kak! 📊 Di sana ada filter Hari Ini, Minggu Ini, dan Bulan Ini. Untung Bersih itu hasil dari Uang Masuk dikurangi Uang Keluar. Kalau hijau berarti untung, kalau merah berarti perlu evaluasi!'
  }

  if (msg.includes('catat jual') || msg.includes('penjualan')) {
    return 'Untuk catat penjualan, tap tombol Catat Jual di dashboard Kak! 🛒 Isi nama barang dan nominalnya, lalu simpan. Sistem otomatis mencatat jurnal: Uang Laci bertambah dan Pemasukan bertambah. Mudah kan!'
  }

  if (msg.includes('stok') || msg.includes('belanja') || msg.includes('beli')) {
    return 'Untuk catat belanja stok ke agen, tap tombol Tambah Stok di dashboard Kak! 📦 Isi nama barang, kuantitas, dan harga beli per satuan. Total otomatis dihitung. Stok di database juga langsung terupdate!'
  }

  if (msg.includes('tips') || msg.includes('saran') || msg.includes('kelola')) {
    return 'Tips kelola keuangan warung ala Warpin Kak! 💡 Pertama, catat setiap transaksi sekecil apapun. Kedua, pisahkan uang warung dan uang rumah tangga. Ketiga, cek laporan setiap hari sebelum tutup warung. Keempat, jangan lupa sisihkan untuk zakat kalau sudah mencapai nisab!'
  }

  if (msg.includes('halo') || msg.includes('hai') || msg.includes('assalamu') || msg.includes('hei')) {
    return 'Wa\'alaikumsalam! Selamat datang di Warpin AI Kak! 😊 Saya siap membantu kamu memahami keuangan warung dan prinsip syariah. Silakan tanya apa saja!'
  }

  if (msg.includes('terima kasih') || msg.includes('makasih')) {
    return 'Sama-sama Kak! 😊 Semoga warungnya makin berkah dan lancar ya! Kalau ada pertanyaan lain seputar keuangan atau syariah, saya siap membantu!'
  }

  return 'Maaf Kak, saya belum bisa menjawab pertanyaan itu. 😊 Coba tanya seputar: zakat tijarah, bon pelanggan, akad qardh, cara baca neraca, laporan keuangan, atau tips kelola warung ya!'
}

export async function POST(request: NextRequest) {
  const { message } = await request.json()
  const reply = getReply(message)
  return NextResponse.json({ reply })
}