# 🕌 Warung Pintar Syariah (Warpin)

> **Catat Warung, Sesuai Syariah.**

Platform manajemen keuangan dan operasional berbasis web yang dirancang khusus untuk usaha mikro warung kelontong di Indonesia. Warpin menggabungkan pencatatan keuangan sederhana, prinsip akuntansi syariah otomatis, dan kecerdasan buatan (AI) dalam satu ekosistem yang mudah digunakan.

---

## 📋 Informasi Proyek

| Atribut | Detail |
|---|---|
| **Nama Produk** | Warung Pintar Syariah (Warpin) |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | Mei 2026 |
| **Status** | Draft |
| **Penyusun** | Nur Assyfa Taufiq |
| **NIM** | 2310102063 |
| **Tipe Dokumen** | Blueprint Project PRD |

---

## 🌟 Visi & Misi

**Visi:** Mewujudkan ekosistem warung kelontong yang tercatat rapi, halal, dan mandiri secara finansial.

**Misi:** Mengintegrasikan pencatatan keuangan harian, pemisahan aset syariah, dan kecerdasan buatan untuk meningkatkan kepercayaan diri pemilik warung dalam mengelola usahanya.

---

## 🎯 Permasalahan yang Diselesaikan

| # | Masalah | Dampak |
|---|---|---|
| 1 | Rendahnya literasi teknologi dan akuntansi | Tidak ada pencatatan keuangan yang akurat |
| 2 | Laba palsu akibat percampuran kas warung dan uang rumah tangga | Pemilik tidak mengetahui kondisi keuangan bisnis yang sesungguhnya |
| 3 | Risiko pencampuran dana kembalian/sedekah sebagai modal kerja | Pelanggaran amanah finansial dan potensi masalah syariah |
| 4 | Aplikasi kasir yang ada terlalu kompleks | Penolakan adopsi teknologi |

---

## ✨ Fitur Utama

### 1. 🛒 Modul Catat Jual
Formulir cepat mencatat pemasukan dari penjualan. Sistem secara otomatis menjurnal transaksi di latar belakang (Debit Kas + Kredit Pendapatan).

### 2. 📦 Modul Tambah Stok
Pencatatan pengeluaran ketika berbelanja ke agen/grosir, disertai pembaruan inventori otomatis.

### 3. 📷 Modul Scan Nota (OCR)
Pemindai struk belanja grosir menggunakan Google Cloud Vision API untuk input stok secara otomatis.

### 4. 📝 Modul Catat Bon (Piutang)
Pencatatan piutang pelanggan berbasis **Akad Qardh** — pinjaman kebajikan tanpa bunga, bebas riba.

### 5. 🤖 Warpin AI Assistant
Asisten AI melalui perintah suara dan teks untuk pencatatan transaksi dan edukasi keuangan syariah interaktif.

### 6. 📊 Dashboard & Laporan Keuangan
Laporan harian, mingguan, bulanan dengan tampilan Neraca yang memisahkan Harta Warung dari Titipan/Utang.

### 7. 🕌 Otomasi Zakat Tijarah
Kalkulasi otomatis kewajiban zakat perdagangan berdasarkan Nisab (85 gram emas) dan Haul (1 tahun Hijriah).

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js, TailwindCSS, Antigravity |
| **Backend & Auth** | Supabase (Auth + PostgreSQL) |
| **Database** | Supabase PostgreSQL (ACID Compliance) |
| **OCR** | Google Cloud Vision API |
| **Speech-to-Text** | Google Speech-to-Text API |
| **AI Assistant** | AI Language Model |
| **Hosting** | Vercel (CDN Global) |
| **CI/CD** | Vercel Git Integration (GitHub) |

---

## 🗺️ Roadmap Pengembangan

| Fase | Periode | Deliverable |
|---|---|---|
| **Fase 1** | Perancangan (UTS) | Arsitektur, UI/UX, logika syariah, ERD, PRD |
| **Fase 2** | Inti/Core (Pasca UTS) | Repository, Supabase Auth, CRUD transaksi, UI dasar |
| **Fase 3** | Integrasi AI (Pra-UAS) | OCR, Speech-to-Text, auto-journaling, pengujian |
| **Fase 4** | Deployment (UAS) | Production Vercel, end-to-end testing, dokumentasi |

---

## 📈 Target KPI Tahun Pertama

| KPI | Target |
|---|---|
| Pemilik Warung Terdaftar | 10.000+ warung |
| Pengguna Aktif Bulanan | 7.000+ pengguna |
| Transaksi Tercatat | 500.000+ transaksi |
| Akurasi OCR | ≥ 80% |
| Efisiensi Pencatatan | 3x lebih cepat vs buku tulis |

---

## 📚 Dokumentasi Lanjutan

| Dokumen | Deskripsi |
|---|---|
| [Architecture.md](./Architecture.md) | Arsitektur sistem, database schema, dan diagram teknis |
| [Compliance.md](./Compliance.md) | Kepatuhan syariah, ACID, RLS, dan standar hukum |
| [AI_Spec.md](./AI_Spec.md) | Spesifikasi lengkap fitur AI (OCR, Voice, Zakat) |
| [Dev_Guide.md](./Dev_Guide.md) | Panduan setup, development, dan deployment |
| [Security.md](./Security.md) | Keamanan data, enkripsi, dan audit trail |
| [Business_Rules.md](./Business_Rules.md) | Aturan bisnis, logika akuntansi, dan syariah |

---

## 🌿 Design Guidelines

| Elemen | Spesifikasi |
|---|---|
| **Warna Primer** | Hijau Tua `#1B4F3A` — identitas syariah & kepercayaan |
| **Warna Aksen AI** | Kuning Emas `#B8860B` — ikon Warpin AI |
| **Warna Positif** | Hijau Terang — indikator pemasukan |
| **Warna Negatif** | Merah — indikator pengeluaran |
| **Font** | Poppins / Inter, minimal 16px body |
| **Bahasa UI** | Bahasa Indonesia; tanpa istilah teknis akuntansi |

---

## 👤 Target Pengguna

**Pemilik Warung** — Ibu rumah tangga atau kepala keluarga, usia 35–65 tahun, yang menjalankan warung kelontong dari rumah dengan literasi digital rendah hingga sedang.

---

*Warung Pintar Syariah — Catat Warung, Sesuai Syariah.*
*Dokumen ini bersifat hidup dan akan diperbarui seiring perkembangan produk.*
