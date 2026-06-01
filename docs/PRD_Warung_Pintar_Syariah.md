# Product Requirements Document (PRD)
## Warung Pintar Syariah
### Platform Digitalisasi UMKM — Manajemen Keuangan & Operasional Berbasis Web

---

**Versi Dokumen:** 1.0  
**Tanggal:** Mei 2025  
**Penulis:** Nur Assyfa Taufiq — 2310102063  
**Status:** Draft (Fase Perancangan UTS)

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Identifikasi Masalah](#2-latar-belakang--identifikasi-masalah)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Sasaran Pengguna (Target Users)](#4-sasaran-pengguna-target-users)
5. [Ruang Lingkup Produk](#5-ruang-lingkup-produk)
6. [Fitur & Persyaratan Fungsional](#6-fitur--persyaratan-fungsional)
7. [Persyaratan Non-Fungsional](#7-persyaratan-non-fungsional)
8. [Arsitektur Sistem & Teknologi](#8-arsitektur-sistem--teknologi)
9. [Skema Database](#9-skema-database)
10. [Desain UI/UX](#10-desain-uiux)
11. [Roadmap Pengembangan](#11-roadmap-pengembangan)
12. [Risiko & Mitigasi](#12-risiko--mitigasi)
13. [Kriteria Keberhasilan (Success Metrics)](#13-kriteria-keberhasilan-success-metrics)
14. [Glosarium](#14-glosarium)

---

## 1. Ringkasan Eksekutif

**Warung Pintar Syariah (Warpin)** adalah aplikasi manajemen keuangan dan operasional berbasis web yang dirancang khusus untuk usaha mikro warung kelontong di Indonesia. Sistem ini bertujuan mengatasi permasalahan pembukuan pada segmen UMKM yang memiliki literasi teknologi dan akuntansi rendah, dengan mengintegrasikan prinsip-prinsip kepatuhan akuntansi syariah secara otomatis ke dalam setiap alur pencatatan.

Produk ini dibangun di atas tumpukan teknologi modern (Next.js, Supabase, Vercel) dan memanfaatkan kecerdasan buatan (Google Cloud Vision API & Speech-to-Text API) untuk menyederhanakan input data. Warpin bukan sekadar aplikasi kasir; ia adalah sistem yang secara aktif memisahkan harta bisnis dari dana titipan umat, menghitung kewajiban zakat, dan mendidik pemilik warung melalui asisten AI interaktif.

---

## 2. Latar Belakang & Identifikasi Masalah

### 2.1 Konteks Masalah

Warung kelontong adalah tulang punggung ekonomi mikro Indonesia. Namun, mayoritas pemiliknya menghadapi masalah struktural yang berulang dalam pengelolaan keuangan usaha mereka.

### 2.2 Masalah yang Diidentifikasi

| No. | Masalah | Dampak |
|-----|---------|--------|
| 1 | **Rendahnya literasi teknologi (gaptek) dan akuntansi** pada pemilik warung | Tidak ada pencatatan keuangan yang akurat; keputusan bisnis bersifat intuitif |
| 2 | **Laba palsu akibat percampuran kas** — uang hasil penjualan warung bercampur dengan uang kebutuhan rumah tangga | Pemilik tidak mengetahui kondisi keuangan bisnis yang sesungguhnya |
| 3 | **Risiko pencampuran dana kembalian/sedekah** — uang kembalian pelanggan yang dititipkan sebagai infaq berpotensi masuk ke modal kerja | Pelanggaran amanah finansial dan potensi masalah syariah |
| 4 | **Aplikasi kasir yang ada terlalu kompleks** — penuh istilah teknis yang tidak familiar bagi pedagang awam | Penolakan adopsi teknologi; tetap menggunakan buku tulis manual |

### 2.3 Kebutuhan yang Belum Terpenuhi

Saat ini belum ada aplikasi manajemen warung yang secara simultan memenuhi tiga kebutuhan berikut:
- Antarmuka yang sangat sederhana dan ramah untuk pengguna dengan literasi digital rendah.
- Integrasi prinsip akuntansi syariah secara otomatis (pemisahan kas, perhitungan zakat).
- Pencatatan double-entry bookkeeping yang terjadi di latar belakang tanpa membebankan konsep akuntansi kepada pengguna.

---

## 3. Tujuan Produk

### 3.1 Tujuan Utama

1. **Menyederhanakan pencatatan keuangan** — Menciptakan aplikasi yang dapat digunakan oleh pemilik warung dengan literasi digital minimal, tanpa perlu memahami istilah akuntansi.
2. **Menegakkan pemisahan aset syariah** — Memisahkan secara tegas antara hak milik bisnis (Kas) dan dana titipan umat (Sedekah/Infaq) sebagai Liabilitas.
3. **Mengotomasi kepatuhan syariah** — Menjalankan kalkulasi nisab, haul, dan zakat tijarah secara otomatis di latar belakang sistem.
4. **Mendidik pengguna** — Memberikan penjelasan akuntansi yang mudah dipahami setelah setiap transaksi dicatat, serta menyediakan modul edukasi (Akademi Warung).

### 3.2 Tujuan Sekunder

- Meningkatkan kepercayaan diri pemilik warung dalam mengelola keuangan usaha.
- Memfasilitasi pemilik warung untuk memahami kondisi keuangan usaha secara real-time (laba/rugi, piutang, stok).

---

## 4. Sasaran Pengguna (Target Users)

### 4.1 Pengguna Utama: Pemilik Warung Kelontong

| Atribut | Deskripsi |
|---------|-----------|
| **Demografi** | Usia 35–65 tahun; ibu rumah tangga atau kepala keluarga yang menjalankan warung dari rumah |
| **Literasi Digital** | Rendah hingga sedang; mampu menggunakan WhatsApp dan aplikasi pesan |
| **Literasi Keuangan** | Sangat rendah; pencatatan saat ini menggunakan buku tulis atau tidak sama sekali |
| **Motivasi** | Ingin mengetahui untung/rugi harian; ingin mencatat bon (piutang) secara lebih rapi |
| **Kekhawatiran** | Takut salah menggunakan teknologi; tidak mengerti istilah teknis |

### 4.2 Pengguna Sistem (Backend)

- **Sistem Backend (Supabase)** — Menjalankan logika otomatis: kalkulasi zakat tijarah, monitoring batas nisab & haul, dan penjurnalan double-entry secara transparan.

---

## 5. Ruang Lingkup Produk

### 5.1 Dalam Ruang Lingkup (In Scope)

- Modul pencatatan transaksi penjualan (Catat Jual)
- Modul pencatatan pembelian stok (Tambah Stok)
- Modul pemindai nota fisik menggunakan kamera (Scan Nota / OCR)
- Modul pencatatan bon/piutang pelanggan berbasis Akad Qardh (Catat Bon)
- Asisten AI berbasis suara dan teks (Warpin AI Assistant)
- Sistem penjurnalan double-entry otomatis di latar belakang
- Kalkulator otomatis zakat tijarah (nisab & haul)
- Pemisahan saldo kas bisnis dan dana titipan/sedekah
- Laporan keuangan ringkas (harian, mingguan, bulanan)
- Neraca sederhana (Sisa Harta & Titipan)
- Modul edukasi interaktif (Akademi Warung)
- Sistem autentikasi berbasis nomor HP dan PIN

### 5.2 Di Luar Ruang Lingkup (Out of Scope — Versi Ini)

- Integrasi dengan marketplace eksternal (Tokopedia, Shopee)
- Fitur multi-cabang / multi-warung
- Modul penggajian karyawan
- Integrasi pembayaran digital (QRIS, transfer bank langsung dari aplikasi)
- Aplikasi mobile native (iOS/Android) — produk ini berbasis web

---

## 6. Fitur & Persyaratan Fungsional

### 6.1 Modul Autentikasi

**FR-AUTH-01:** Sistem harus menyediakan halaman login dengan input Nomor HP dan PIN 6 digit.  
**FR-AUTH-02:** Sistem harus menyediakan halaman pendaftaran warung baru ("Daftar Warung Baru").  
**FR-AUTH-03:** Autentikasi dikelola sepenuhnya oleh Supabase Auth.  
**FR-AUTH-04:** Setiap sesi pengguna harus terisolasi dan data antar warung tidak boleh saling terlihat.

---

### 6.2 Modul Catat Jual

**Deskripsi:** Formulir cepat untuk mencatat setiap pemasukan uang ke laci kasir dari penjualan barang.

**FR-JUAL-01:** Sistem harus menyediakan form input dengan field: nama barang/keterangan, nominal penjualan, dan tanggal/waktu otomatis.  
**FR-JUAL-02:** Setelah transaksi tersimpan, sistem harus secara otomatis membuat entri jurnal:
- **Debit:** Akun Kas (Uang Laci)
- **Kredit:** Akun Pendapatan

**FR-JUAL-03:** Sistem harus menampilkan notifikasi edukasi ("Pintar Akuntansi") yang menjelaskan jurnal yang dibuat dalam bahasa sederhana setelah transaksi berhasil.  
**FR-JUAL-04:** Setiap transaksi harus muncul di "Catatan Terakhir" pada dashboard utama.

---

### 6.3 Modul Tambah Stok

**Deskripsi:** Formulir untuk mencatat pengeluaran uang ketika pemilik berbelanja barang ke agen/grosir.

**FR-STOK-01:** Sistem harus menyediakan form input dengan field: nama barang, jumlah (kuantitas), harga beli per satuan (HPP), dan total pengeluaran.  
**FR-STOK-02:** Setelah transaksi tersimpan, sistem harus secara otomatis membuat entri jurnal:
- **Debit:** Akun Persediaan Barang
- **Kredit:** Akun Kas (Uang Laci)

**FR-STOK-03:** Data stok harus memperbarui tabel `inventory` di database (nama barang, HPP, kuantitas sisa).  
**FR-STOK-04:** Sistem harus menampilkan notifikasi edukasi ("Pintar Akuntansi") setelah transaksi berhasil.

---

### 6.4 Modul Scan Nota

**Deskripsi:** Antarmuka pemindai visual yang memungkinkan pemilik warung memotret struk belanja grosir untuk input stok masuk secara otomatis.

**FR-SCAN-01:** Sistem harus mengaktifkan akses kamera perangkat pengguna melalui browser.  
**FR-SCAN-02:** Gambar struk yang diambil harus dikirim ke Google Cloud Vision API untuk diproses melalui OCR (Optical Character Recognition).  
**FR-SCAN-03:** Hasil ekstraksi OCR (nama barang, harga, kuantitas) harus ditampilkan dalam form yang dapat diedit pengguna sebelum dikonfirmasi.  
**FR-SCAN-04:** Setelah konfirmasi, data harus diproses sama seperti alur Modul Tambah Stok (FR-STOK-02 dan FR-STOK-03).

---

### 6.5 Modul Catat Bon (Piutang Pelanggan)

**Deskripsi:** Modul pencatatan piutang pelanggan berbasis Akad Qardh (pinjaman kebajikan tanpa bunga), sesuai prinsip syariah bebas riba.

**FR-BON-01:** Sistem harus menyediakan form input dengan field: nama pelanggan (penghutang), nominal bon, dan tanggal bon.  
**FR-BON-02:** Sistem harus menyimpan data ke tabel `receivables` dengan status jatuh tempo.  
**FR-BON-03:** Nilai total piutang (Total Piutang Bon) harus ditampilkan pada dashboard utama dan terhubung langsung dengan kalkulasi total kekayaan bersih (neraca) warung.  
**FR-BON-04:** Sistem harus mendukung pencatatan pelunasan bon oleh pelanggan.  
**FR-BON-05:** Tidak boleh ada penambahan bunga atau biaya atas piutang yang tercatat (bebas riba / Akad Qardh).

---

### 6.6 Warpin AI Assistant

**Deskripsi:** Asisten kecerdasan buatan yang berfungsi sebagai antarmuka penjurnalan melalui perintah suara dan sebagai pusat edukasi keuangan interaktif bagi pemilik warung.

**FR-AI-01:** Sistem harus menampilkan ikon mikrofon sentral yang mudah diakses dari semua halaman (navigation bar).  
**FR-AI-02:** Sistem harus mengintegrasikan Google Speech-to-Text API untuk mengonversi perintah suara pengguna menjadi teks.  
**FR-AI-03:** Sistem harus mampu memproses perintah suara dan mengidentifikasi jenis transaksi (jual/beli/bon) serta nilainya untuk auto-journaling.  
**FR-AI-04:** Warpin AI harus mampu menjawab pertanyaan edukatif seputar keuangan dan syariah dalam bahasa yang sederhana.  
**FR-AI-05:** (Mockup/Fase Awal) Asisten ini berfungsi sebagai mockup interaktif untuk membiasakan pengguna dengan pola interaksi asisten sebelum integrasi AI penuh.

---

### 6.7 Otomasi Zakat Tijarah

**Deskripsi:** Fitur backend yang secara otomatis memantau total nilai aset warung dan menghitung kewajiban zakat perdagangan.

**FR-ZAKAT-01:** Sistem harus secara otomatis menghitung total nilai aset warung (kas + nilai persediaan + piutang) secara berkala.  
**FR-ZAKAT-02:** Sistem harus membandingkan total aset dengan nilai Nisab yang berlaku (setara 85 gram emas).  
**FR-ZAKAT-03:** Sistem harus melacak durasi kepemilikan aset yang melampaui Nisab (Haul = 1 tahun Hijriah).  
**FR-ZAKAT-04:** Ketika Nisab dan Haul terpenuhi, sistem harus menampilkan notifikasi kewajiban zakat kepada pemilik warung beserta jumlah yang harus dibayarkan (2,5% dari total aset wajib zakat).  
**FR-ZAKAT-05:** Logika kalkulasi dijalankan sepenuhnya oleh Supabase (database backend) tanpa intervensi pengguna.

---

### 6.8 Dashboard & Laporan Keuangan

**FR-DASH-01:** Dashboard utama harus menampilkan:
- Total Kas Warung (saldo real-time)
- Untung Hari Ini (laba harian)
- Total Piutang Bon (total piutang aktif)
- Catatan Terakhir (5 transaksi terbaru)
- Tombol Aksi Cepat (Catat Jual, Tambah Stok, Scan Nota, Catat Bon)
- Akademi Warung (konten edukasi terbaru)

**FR-DASH-02:** Halaman Laporan Keuangan harus menampilkan ringkasan yang dapat difilter berdasarkan periode: Hari Ini, Minggu Ini, Bulan Ini, dengan informasi:
- Uang Laci / Arus Kas
- Untung Bersih (Laba Rugi)
- Ringkasan Pemasukan vs Pengeluaran (grafik batang)

**FR-DASH-03:** Halaman Neraca (Sisa Harta & Titipan) harus menampilkan pemisahan tegas antara:
- **Harta Warung** (Aset bisnis: kas + persediaan + piutang)
- **Titipan & Utang** (Liabilitas: dana sedekah/infaq, utang ke pemasok jika ada)

---

### 6.9 Dana Titipan / Sedekah (Charity Funds)

**FR-CHARITY-01:** Sistem harus menyediakan akun terpisah untuk mencatat akumulasi sisa uang kembalian pelanggan yang dititipkan sebagai infaq/sedekah.  
**FR-CHARITY-02:** Dana titipan ini harus dicatat sebagai **Liabilitas** (bukan pendapatan atau modal) dalam neraca warung.  
**FR-CHARITY-03:** Saldo dana titipan harus selalu terpisah dari saldo Kas Warung dan tidak boleh digunakan sebagai modal kerja.

---

## 7. Persyaratan Non-Fungsional

### 7.1 Kemudahan Penggunaan (Usability)

**NFR-UX-01:** Antarmuka harus dirancang dengan prinsip **"ramah lansia"** — menggunakan tombol berukuran besar, kontras warna yang tinggi, dan label teks yang jelas.  
**NFR-UX-02:** Tidak boleh ada terminologi teknis akuntansi yang muncul di antarmuka pengguna. Semua label menggunakan bahasa sehari-hari (contoh: "Uang Laci" bukan "Kas"; "Untung Bersih" bukan "Laba Neto").  
**NFR-UX-03:** Pengguna harus dapat menyelesaikan pencatatan satu transaksi dalam tidak lebih dari 3 (tiga) langkah interaksi.

### 7.2 Keandalan & Integritas Data

**NFR-REL-01:** Sistem harus menjamin **ACID Compliance** (Atomicity, Consistency, Isolation, Durability) pada semua transaksi keuangan.  
**NFR-REL-02:** Setiap entri jurnal double-entry harus selalu seimbang (Total Debit = Total Kredit). Sistem harus menolak transaksi yang tidak seimbang.  
**NFR-REL-03:** Data keuangan tidak boleh dapat dihapus secara permanen oleh pengguna (soft delete / audit trail).

### 7.3 Kinerja (Performance)

**NFR-PERF-01:** Halaman dashboard harus dimuat dalam waktu kurang dari 3 detik pada koneksi 4G.  
**NFR-PERF-02:** Proses OCR (Scan Nota) harus memberikan respons dalam waktu kurang dari 10 detik setelah foto diambil.

### 7.4 Keamanan (Security)

**NFR-SEC-01:** Semua data pengguna harus terenkripsi saat transit (HTTPS) dan saat istirahat (at-rest encryption oleh Supabase).  
**NFR-SEC-02:** Autentikasi menggunakan sistem PIN terenkripsi yang dikelola oleh Supabase Auth; tidak ada password plaintext yang disimpan.  
**NFR-SEC-03:** Data setiap warung harus terisolasi secara ketat (Row Level Security / RLS) — satu pemilik warung tidak dapat mengakses data warung lain.

### 7.5 Kompatibilitas

**NFR-COMP-01:** Aplikasi harus dapat diakses dan berfungsi penuh pada browser Chrome, Firefox, dan Safari versi terbaru.  
**NFR-COMP-02:** Antarmuka harus responsif dan dapat digunakan dengan nyaman pada perangkat smartphone (layar ≥ 360px lebar).  
**NFR-COMP-03:** Fitur Scan Nota memerlukan browser yang mendukung WebRTC (akses kamera).

### 7.6 Estetika & Animasi

**NFR-ANIM-01:** Transisi antar halaman dan interaksi form harus menggunakan animasi yang mulus (smooth) menggunakan library **Antigravity**.  
**NFR-ANIM-02:** Skema warna utama menggunakan hijau tua (#1B4332 atau serupa) sebagai identitas visual yang merepresentasikan nilai syariah dan kepercayaan.

---

## 8. Arsitektur Sistem & Teknologi

### 8.1 Tumpukan Teknologi (Technology Stack)

| Lapisan | Teknologi | Fungsi Spesifik |
|---------|-----------|-----------------|
| **Frontend (Antarmuka)** | Next.js | Framework utama untuk membangun halaman aplikasi yang modern, ringan, dan responsif (SSR & SSG) |
| **Animasi & Interaksi** | Antigravity | Memberikan efek transisi antarmuka yang mulus (smooth UI) untuk pergerakan menu dan form input |
| **Backend & Auth** | Supabase | Mengelola sistem login (autentikasi pengguna berbasis nomor HP + PIN) dan keamanan data |
| **Database Utama** | Supabase (PostgreSQL) | Menyimpan data persediaan, piutang, dan jurnal double-entry keuangan dalam skema relasional |
| **OCR (Pemindai Nota)** | Google Cloud Vision API | Ekstraksi otomatis citra struk/nota menjadi data teks terstruktur |
| **Perintah Suara** | Google Speech-to-Text API | Konversi perintah suara pengguna untuk auto-journaling melalui Warpin AI |
| **Deployment (Hosting)** | Vercel | Menjadikan aplikasi online dan dapat diakses cepat dari perangkat apapun |

### 8.2 Diagram Alur Sistem (Deskriptif)

```
Pengguna (Browser)
        │
        ▼
   Next.js Frontend (Vercel)
        │
        ├──── Supabase Auth ─────── Verifikasi Sesi
        │
        ├──── Supabase PostgreSQL ── CRUD Data (Transaksi, Stok, Bon)
        │              │
        │              └──── Trigger Otomatis ──── Jurnal Double-Entry
        │                                    └──── Kalkulasi Zakat
        │
        ├──── Google Cloud Vision API ── OCR Nota (Scan Nota)
        │
        └──── Google Speech-to-Text API ── Perintah Suara (Warpin AI)
```

---

## 9. Skema Database

Database diimplementasikan menggunakan **Supabase PostgreSQL** dengan dua domain utama.

### 9.1 Domain Operasional Bisnis

#### Tabel: `users`
Menyimpan data autentikasi pemilik warung.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik pengguna |
| `phone_number` | VARCHAR | Nomor HP sebagai identitas login |
| `pin_hash` | VARCHAR | Hash PIN 6 digit (terenkripsi) |
| `warung_name` | VARCHAR | Nama warung |
| `created_at` | TIMESTAMP | Waktu pendaftaran |

#### Tabel: `inventory`
Mencatat entitas nama barang, harga pokok pembelian (HPP), dan sisa stok kuantitas.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik item |
| `user_id` | UUID (FK → users) | Pemilik warung |
| `item_name` | VARCHAR | Nama barang |
| `hpp` | NUMERIC | Harga pokok pembelian per satuan |
| `quantity` | INTEGER | Sisa stok kuantitas |
| `updated_at` | TIMESTAMP | Waktu pembaruan terakhir |

#### Tabel: `receivables`
Modul Catat Bon — menyimpan identitas penghutang, nominal, dan status jatuh tempo.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik bon |
| `user_id` | UUID (FK → users) | Pemilik warung |
| `customer_name` | VARCHAR | Nama pelanggan/penghutang |
| `amount` | NUMERIC | Nominal piutang |
| `date_issued` | DATE | Tanggal bon dibuat |
| `due_date` | DATE | Tanggal jatuh tempo (opsional) |
| `status` | ENUM | `outstanding` / `paid` |
| `akad` | VARCHAR | Default: `Qardh` |

---

### 9.2 Domain Akuntansi & Syariah

#### Tabel: `journal_entries`
Tabel utama double-entry bookkeeping — mencatat setiap mutasi Debit dan Kredit dengan presisi tanpa anomali.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik entri jurnal |
| `user_id` | UUID (FK → users) | Pemilik warung |
| `transaction_date` | TIMESTAMP | Waktu transaksi |
| `description` | TEXT | Keterangan transaksi (contoh: "Jual Beras 5kg") |
| `account_debit` | VARCHAR | Nama akun yang didebit (contoh: "Kas", "Persediaan") |
| `account_credit` | VARCHAR | Nama akun yang dikredit (contoh: "Pendapatan", "Kas") |
| `amount` | NUMERIC | Nilai transaksi |
| `source_module` | VARCHAR | Modul asal: `catat_jual`, `tambah_stok`, `scan_nota`, `catat_bon` |
| `created_at` | TIMESTAMP | Waktu pencatatan |

> **Aturan Integritas:** Setiap transaksi menghasilkan minimal satu baris debit dan satu baris kredit dengan nilai yang sama (balanced entry).

#### Tabel: `charity_funds`
Tabel khusus (Liabilitas) penyimpan akumulasi sisa uang kembalian atau infaq pelanggan.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `id` | UUID (PK) | ID unik catatan |
| `user_id` | UUID (FK → users) | Pemilik warung |
| `amount_added` | NUMERIC | Jumlah dana yang ditambahkan |
| `date_added` | TIMESTAMP | Waktu penambahan |
| `description` | TEXT | Keterangan (contoh: "Kembalian Pak Ahmad") |
| `cumulative_balance` | NUMERIC | Saldo akumulatif dana titipan |

> **Catatan Syariah:** Saldo tabel ini **TIDAK BOLEH** masuk ke dalam perhitungan Modal atau Pendapatan. Status akuntansinya adalah **Liabilitas (Dana Titipan Umat)**.

---

## 10. Desain UI/UX

### 10.1 Prinsip Desain

1. **Aksesibilitas Utama** — Tombol berukuran besar, kontras warna tinggi (WCAG AA minimum), label jelas tanpa jargon.
2. **Kemudahan Kognitif** — Tidak lebih dari 4 aksi utama yang terlihat sekaligus di halaman manapun.
3. **Umpan Balik Langsung** — Setiap aksi pengguna direspons dengan notifikasi ("Pintar Akuntansi") yang menjelaskan apa yang terjadi.
4. **Animasi Bermakna** — Transisi halaman menggunakan Antigravity untuk memberikan konteks navigasi yang jelas (bukan sekadar estetika).

### 10.2 Struktur Navigasi

```
Navigasi Bawah (Bottom Navigation Bar):
┌──────────┬──────────┬────────────┬──────────┬──────────┐
│ Beranda  │ Laporan  │  AI Suara  │  Belajar │  Profil  │
│  (Home)  │(Reports) │ (Warpin AI)│ (Akademi)│ (Profile)│
└──────────┴──────────┴────────────┴──────────┴──────────┘
                            ▲
                    (Ikon Mikrofon Kuning — Aksi Utama Sentral)
```

### 10.3 Halaman Utama yang Dirancang

| Halaman | Komponen Utama |
|---------|----------------|
| **Login** | Input Nomor HP, Input PIN 6 digit, Tombol "MASUK", Link "Daftar Warung Baru" |
| **Dashboard (Beranda)** | Kartu Total Kas, Kartu Untung Hari Ini, Kartu Total Piutang Bon, Grid Aksi Cepat (4 tombol), Daftar Catatan Terakhir, Carousel Akademi Warung |
| **Laporan Keuangan** | Filter periode (Hari Ini / Minggu Ini / Bulan Ini), Kartu Uang Laci, Kartu Untung Bersih, Grafik Ringkasan Masuk-Keluar |
| **Neraca (Sisa Harta & Titipan)** | Kartu Harta Warung (Aset), Kartu Titipan & Utang (Liabilitas) |
| **Warpin AI (Al Suara)** | Antarmuka percakapan suara, Transkripsi real-time, Konfirmasi jurnal otomatis |

### 10.4 Skema Warna

| Peran | Warna | Keterangan |
|-------|-------|------------|
| Primer | Hijau Tua | Identitas utama aplikasi (syariah & kepercayaan) |
| Aksen / CTA AI | Kuning/Emas | Ikon Warpin AI — menonjol, mudah ditemukan |
| Latar | Putih | Kontras tinggi, bersih, mudah dibaca |
| Teks Utama | Hijau Tua Gelap | Heading dan label penting |
| Positif (Pemasukan) | Hijau Terang | Indikator pemasukan / nilai positif |
| Negatif (Pengeluaran) | Merah | Indikator pengeluaran / nilai negatif |

---

## 11. Roadmap Pengembangan

### Fase 1: Perancangan (Periode UTS)
**Deliverable:**
- Penyusunan arsitektur sistem lengkap
- Desain UI/UX high-contrast di seluruh modul
- Rumusan logika akuntansi syariah (double-entry mapping)
- Perancangan skema database awal (ERD)
- Dokumen PRD ini

### Fase 2: Inti / Core (Pasca UTS)
**Deliverable:**
- Inisialisasi repository kode
- Integrasi Vercel (deployment) & Supabase Auth (login)
- Implementasi modul CRUD transaksi manual (Jurnal Umum)
- Pembangunan UI dasar semua halaman (tanpa AI)
- Pengujian alur transaksi dasar end-to-end

### Fase 3: Integrasi AI (Pra-UAS)
**Deliverable:**
- Implementasi endpoint Google Cloud Vision API (OCR untuk Scan Nota)
- Implementasi Google Speech-to-Text API (Warpin AI — perintah suara)
- Integrasi logika auto-journaling berbasis input suara
- Pengujian akurasi OCR pada berbagai jenis nota/struk

### Fase Akhir: Deployment & Finalisasi (Periode UAS)
**Deliverable:**
- Deployment penuh repositori ke Vercel (production build)
- Pengujian menyeluruh (end-to-end testing) di berbagai perangkat
- Dokumentasi pengguna (panduan singkat pemakaian)
- Presentasi dan demonstrasi produk akhir

---

## 12. Risiko & Mitigasi

| No. | Risiko | Probabilitas | Dampak | Strategi Mitigasi |
|-----|--------|-------------|--------|-------------------|
| 1 | Akurasi OCR rendah pada struk yang kusut/buram | Sedang | Tinggi | Menyediakan form edit manual setelah OCR; memungkinkan koreksi sebelum konfirmasi |
| 2 | Pengguna menolak adopsi teknologi (gaptek) | Tinggi | Tinggi | Desain UI yang sangat sederhana; penyediaan tutorial video di Akademi Warung; tombol berukuran besar |
| 3 | Keterbatasan kuota API Google (Vision & Speech-to-Text) | Rendah | Sedang | Implementasi rate limiting; monitoring penggunaan API; fallback ke input manual |
| 4 | Koneksi internet tidak stabil di lokasi warung | Sedang | Sedang | Desain aplikasi ringan (Next.js SSG); mempertimbangkan caching lokal di iterasi berikutnya |
| 5 | Kesalahan logika akuntansi syariah | Rendah | Sangat Tinggi | Review kode oleh pihak yang memahami fiqih muamalah; audit jurnal secara berkala |
| 6 | Keamanan data pengguna (kebocoran PIN) | Rendah | Sangat Tinggi | Menggunakan hash bcrypt untuk PIN; Row Level Security (RLS) di Supabase; HTTPS wajib |

---

## 13. Kriteria Keberhasilan (Success Metrics)

### 13.1 Metrik Teknis

- **Waktu muat dashboard:** < 3 detik pada koneksi 4G
- **Akurasi OCR:** ≥ 80% pada struk yang terbaca jelas
- **Uptime aplikasi:** ≥ 99% (didukung SLA Vercel)
- **Konsistensi jurnal:** 100% entri jurnal harus balanced (Debit = Kredit)

### 13.2 Metrik Produk

- Pengguna dapat menyelesaikan pencatatan transaksi pertama dalam < 5 menit tanpa panduan
- Seluruh 5 modul utama dapat diakses dan digunakan tanpa error pada sesi demonstrasi UAS
- Pemisahan saldo Kas Warung dan Dana Titipan terlihat jelas dan akurat di halaman Neraca

---

## 14. Glosarium

| Istilah | Definisi |
|---------|----------|
| **Akad Qardh** | Akad pinjaman kebajikan dalam Islam — tidak boleh ada tambahan bunga (riba) atas pinjaman yang diberikan |
| **Double-Entry Bookkeeping** | Sistem pencatatan akuntansi di mana setiap transaksi selalu dicatat di dua sisi: Debit dan Kredit, dengan jumlah yang selalu seimbang |
| **HPP** | Harga Pokok Pembelian — harga beli barang dari pemasok/agen sebelum dijual kembali |
| **Haul** | Dalam konteks zakat: satu tahun penuh (tahun Hijriah) berlalunya aset yang melampaui Nisab |
| **Nisab** | Batas minimum harta yang mewajibkan zakat — untuk zakat tijarah setara dengan nilai 85 gram emas |
| **OCR** | Optical Character Recognition — teknologi yang mengubah gambar teks menjadi data teks digital |
| **ACID Compliance** | Sifat transaksi database yang menjamin Atomicity (semua atau tidak ada), Consistency (data selalu valid), Isolation (transaksi tidak saling mengganggu), Durability (data tersimpan permanen) |
| **Zakat Tijarah** | Zakat perdagangan — kewajiban zakat atas aset bisnis yang telah mencapai Nisab dan Haul |
| **RLS (Row Level Security)** | Fitur keamanan database PostgreSQL yang membatasi akses data berdasarkan identitas pengguna yang sedang login |
| **Liabilitas** | Kewajiban atau hutang — dalam konteks Warpin, dana sedekah/infaq pelanggan dicatat sebagai liabilitas karena bukan milik warung |
| **Warpin** | Singkatan/nama panggilan dari Warung Pintar Syariah |
| **UMKM** | Usaha Mikro, Kecil, dan Menengah |

---

*Dokumen ini merupakan bagian dari Projek UTS: Platform Digitalisasi UMKM.*  
*Nur Assyfa Taufiq — 2310102063*
