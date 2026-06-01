# Backlog Warung Pintar Syariah

_Berbasis dokumen PRD, spesifikasi AI, dan blueprint produk._

## 1. Ringkasan Prioritas

- High: Core transaksi, autentikasi, kalkulasi zakat otomatis, OCR, voice input
- Medium: AI edukasi/chat, notifikasi "Pintar Akuntansi", dashboard laporan, UX sederhana
- Low: Integrasi eksternal, mobile native, fitur multi-cabang

## 2. Epics dan Item Backlog

### 2.1 Autentikasi & Keamanan

1.1. Implementasi halaman `Login` dengan input Nomor HP dan PIN 6 digit.
1.2. Implementasi halaman `Daftar Warung Baru` dan pendaftaran pengguna baru.
1.3. Integrasi Supabase Auth untuk menyimpan sesi pengguna.
1.4. Terapkan Row Level Security (RLS) sehingga setiap warung hanya melihat datanya sendiri.
1.5. Pastikan PIN disimpan dalam bentuk terenkripsi / hash; tidak ada plaintext.
1.6. Tambahkan proteksi HTTPS dan enkripsi data on-rest via Supabase.

### 2.2 Modul Transaksi Dasar

2.1. Bangun form `Catat Jual` dengan field nama keterangan, nominal penjualan, dan tanggal/waktu otomatis.
2.2. Buat logika pencatatan auto-journal `Debit Kas` / `Kredit Pendapatan` untuk `Catat Jual`.
2.3. Tampilkan notifikasi edukatif "Pintar Akuntansi" setelah transaksi penjualan tersimpan.
2.4. Bangun form `Tambah Stok` dengan field nama barang, jumlah, HPP, dan total pengeluaran.
2.5. Buat logika pencatatan auto-journal `Debit Persediaan` / `Kredit Kas` untuk `Tambah Stok`.
2.6. Perbarui tabel `inventory` setelah `Tambah Stok` dengan nama barang, HPP, dan kuantitas.
2.7. Bangun form `Catat Bon` dengan field nama pelanggan, nominal bon, dan tanggal.
2.8. Simpan piutang ke tabel `receivables` dengan status `outstanding` dan dukungan pelunasan.
2.9. Tegaskan aturan syariah: tidak boleh ada bunga atau biaya tambahan pada piutang.
2.10. Sertakan daftar `Catatan Terakhir` di dashboard yang menampilkan transaksi terbaru.

### 2.3 Modul Scan Nota / OCR

3.1. Buat halaman `Scan Nota` dengan akses kamera WebRTC dari browser.
3.2. Konversi foto struk menjadi Base64 dan kirim ke backend untuk diproses oleh Google Cloud Vision API.
3.3. Implementasikan endpoint backend yang memanggil Google Cloud Vision API `DOCUMENT_TEXT_DETECTION`.
3.4. Parsing hasil OCR untuk mengekstrak nama barang, HPP, kuantitas, dan unit.
3.5. Tampilkan hasil OCR dalam form yang dapat diedit sebelum konfirmasi.
3.6. Setelah konfirmasi OCR, proses data menjadi `Tambah Stok` dan update inventory.
3.7. Sediakan fallback jika OCR gagal: pesan "Struk kurang jelas, silakan isi manual" dan form kosong.
3.8. Terapkan retry otomatis 1x pada timeout API, lalu fallback ke input manual.
3.9. Tandai hasil OCR dengan indikator "Perlu cek ulang" bila akurasi rendah.

### 2.4 Warpin AI Assistant — Voice Input

4.1. Tambahkan ikon mikrofon sentral di navigation bar untuk akses cepat.
4.2. Minta izin mikrofon browser dan jalankan streaming audio ke Google Speech-to-Text API.
4.3. Tampilkan transkripsi real-time saat user berbicara.
4.4. Buat NLU parser untuk mendeteksi intent: `jual`, `beli`, `bon`, `tanya`.
4.5. Ekstrak entitas nominal, nama barang, dan nama pelanggan dari teks suara.
4.6. Tampilkan kartu konfirmasi jurnal sebelum menyimpan transaksi suara.
4.7. Simpan transaksi sesuai intent dan buat entri jurnal otomatis setelah konfirmasi.
4.8. Tetapkan target akurasi voice recognition minimal 85% untuk intent dasar.

### 2.5 Warpin AI Assistant — Edukasi & Chat

5.1. Buat antarmuka chat edukatif untuk pertanyaan seputar keuangan warung dan syariah.
5.2. Integrasikan prompt system yang menggunakan Bahasa Indonesia sederhana.
5.3. Siapkan topik edukasi utama: cara fitur Warpin, laporan keuangan, zakat tijarah, akad qardh, dan manajemen warung.
5.4. Tampilkan respons singkat maksimal 3 paragraf untuk menjaga kemudahan pemahaman.
5.5. Bangun notifikasi rule-based "Pintar Akuntansi" setelah transaksi:
- Catat Jual: jelaskan kas masuk + pendapatan
- Tambah Stok: jelaskan persediaan bertambah dan kas berkurang
- Catat Bon: jelaskan piutang tercatat tanpa bunga

### 2.6 Kalkulasi Zakat Tijarah Otomatis

6.1. Buat fungsi Supabase / Postgres untuk menghitung total aset: kas + nilai persediaan + piutang.
6.2. Buat fungsi `get_current_nisab()` yang mengonversi 85 gram emas ke nilai rupiah.
6.3. Bangun trigger untuk mengeksekusi kalkulasi zakat setiap INSERT/UPDATE pada transaksi dan inventory.
6.4. Lacak `nisab_reached_at` saat total aset mencapai atau melewati nisab.
6.5. Hitung `haul_due_at` berdasarkan 354 hari Hijriah sejak `nisab_reached_at`.
6.6. Ketika Nisab dan Haul terpenuhi, hitung zakat 2,5% dan tampilkan notifikasi pada dashboard.
6.7. Pastikan logika zakat berjalan sepenuhnya di backend, tanpa intervensi pengguna.
6.8. Tambahkan flag notifikasi di tabel zakat untuk menghindari notifikasi duplikat.

### 2.7 Dashboard & Laporan

7.1. Bangun dashboard utama dengan kartu:
- Total Kas Warung
- Untung Hari Ini
- Total Piutang Bon
- Catatan Terakhir
- Tombol aksi cepat (Catat Jual, Tambah Stok, Scan Nota, Catat Bon)
7.2. Buat halaman laporan keuangan dengan filter periode: Hari Ini, Minggu Ini, Bulan Ini.
7.3. Tampilkan ringkasan arus kas, untung bersih, dan pemasukan vs pengeluaran.
7.4. Buat halaman neraca yang memisahkan `Harta Warung` dan `Titipan & Utang` secara jelas.
7.5. Tampilkan saldo dana titipan/sedekah sebagai liabilitas, bukan modal atau pendapatan.
7.6. Tambahkan modul `Akademi Warung` untuk menampilkan konten edukasi terbaru.

### 2.8 UX & Non-Fungsional

8.1. Pastikan UI menggunakan tombol besar, kontras tinggi, dan label bahasa sehari-hari.
8.2. Hindari istilah akuntansi teknis di antarmuka pengguna.
8.3. Pastikan semua interaksi transaksi terselesaikan dalam maksimal 3 langkah.
8.4. Optimalkan loading dashboard agar < 3 detik pada koneksi 4G.
8.5. Pastikan semua entri jurnal balanced; tolak transaksi tidak seimbang.
8.6. Terapkan soft delete dan audit trail untuk data keuangan.
8.7. Pastikan aplikasi responsif pada perangkat smartphone (lebar minimum 360px).
8.8. Pastikan fitur Scan Nota bekerja pada browser yang mendukung WebRTC.
8.9. Tambahkan monitoring penggunaan API dan rate limiting untuk Google Cloud Vision dan Speech-to-Text.

### 2.9 Infrastruktur & Dokumentasi

9.1. Siapkan deployment ke Vercel dengan pipeline build Next.js.
9.2. Siapkan Supabase project untuk database, auth, dan fungsi backend.
9.3. Tambahkan dokumentasi pengembang untuk konfigurasi API key dan environment variable.
9.4. Tambahkan dokumentasi pengguna singkat untuk panduan penggunaan fitur utama.
9.5. Buat pengujian end-to-end untuk alur `Catat Jual`, `Tambah Stok`, `Scan Nota`, `Catat Bon`, dan notifikasi zakat.

## 3. Item Backlog Tambahan (Fitur Masa Depan)

- Integrasi marketplace eksternal (Tokopedia / Shopee)
- Dukungan offline / cache lokal untuk transaksi saat koneksi lemah
- Fitur multi-cabang atau multi-warung
- Integrasi pembayaran digital (QRIS / transfer bank)
- Aplikasi mobile native iOS / Android

---

_File ini dibuat sebagai backlog produk di `docs/backlog.md` berdasarkan PRD, spesifikasi AI, dan dokumen blueprint Warung Pintar Syariah._
