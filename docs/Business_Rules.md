# 📋 Business_Rules.md — Warung Pintar Syariah

> Dokumen aturan bisnis lengkap platform Warpin, mencakup logika akuntansi, prinsip syariah, aturan per modul, validasi sistem, dan definisi operasional.

---

## 1. Aturan Bisnis Inti (Core Business Rules)

### BR-CORE-01: Integritas Double-Entry
```
ATURAN: Setiap transaksi keuangan HARUS menghasilkan minimal 2 entri jurnal
CONSTRAINT: SUM(debit_amount) HARUS SAMA DENGAN SUM(credit_amount) per transaction_id
JIKA TIDAK SAMA → sistem MENOLAK transaksi dan rollback seluruh operasi
DASAR: NFR-11, prinsip double-entry bookkeeping
```

### BR-CORE-02: Soft Delete Only
```
ATURAN: Data transaksi, jurnal, dan keuangan TIDAK BOLEH dihapus secara permanen
MEKANISME: Gunakan is_deleted = TRUE (soft delete)
ALASAN: Audit trail harus tetap lengkap untuk keperluan akuntansi dan kepatuhan syariah
DASAR: NFR-08
```

### BR-CORE-03: ACID Compliance
```
ATURAN: Semua operasi database yang melibatkan data keuangan harus bersifat ACID
- Atomicity: semua langkah berhasil, atau semuanya batal
- Consistency: data selalu dalam kondisi valid
- Isolation: transaksi tidak saling mengganggu
- Durability: data yang tersimpan bersifat permanen
DASAR: NFR-10
```

### BR-CORE-04: Isolasi Data Per Warung
```
ATURAN: Data setiap warung harus terisolasi secara ketat
MEKANISME: Row Level Security (RLS) — warung_id = auth.uid()
KONSEKUENSI: Pengguna A tidak bisa melihat, mengubah, atau menghapus data Pengguna B
DASAR: NFR-09
```

---

## 2. Aturan Bisnis Modul Catat Jual

### BR-JUAL-01: Validasi Input
```
ATURAN: Field yang wajib diisi sebelum transaksi dapat disimpan:
  - description (nama barang/keterangan): tidak boleh kosong
  - amount (nominal penjualan): harus berupa angka positif > 0
  - transaction_at: otomatis dari sistem (tidak boleh input manual masa depan)
DASAR: FR-01
```

### BR-JUAL-02: Penjurnalan Otomatis Penjualan
```
ATURAN: Setiap Catat Jual yang tersimpan HARUS secara otomatis menghasilkan:
  DEBIT  → Kas Warung (Uang Laci)    sebesar amount
  KREDIT → Pendapatan Penjualan      sebesar amount
MEKANISME: PostgreSQL trigger AFTER INSERT pada transactions WHERE type = 'sale'
TIDAK BOLEH: Ada transaksi penjualan tanpa entri jurnal yang sesuai
DASAR: FR-02
```

### BR-JUAL-03: Notifikasi Edukatif
```
ATURAN: Setelah setiap Catat Jual berhasil disimpan, sistem HARUS menampilkan
        notifikasi "Pintar Akuntansi" dalam bahasa sehari-hari
CONTOH: "✅ Mantap! Uang masuk ke laci (Kas +Rp X) dan pemasukan tercatat!"
DASAR: FR-03
```

### BR-JUAL-04: Realtime di Dashboard
```
ATURAN: Transaksi Catat Jual harus muncul di "Catatan Terakhir" dashboard
        dalam waktu real-time setelah disimpan
DASAR: FR-04
```

---

## 3. Aturan Bisnis Modul Tambah Stok

### BR-STOK-01: Validasi Input Stok
```
ATURAN: Field yang wajib diisi:
  - item_name (nama barang): tidak boleh kosong
  - quantity (kuantitas): integer positif > 0
  - hpp (harga beli per satuan): angka positif > 0
  - total_amount: dihitung otomatis (quantity × hpp), tidak boleh dimanipulasi
DASAR: FR-05
```

### BR-STOK-02: Penjurnalan Otomatis Pembelian Stok
```
ATURAN: Setiap Tambah Stok yang tersimpan HARUS menghasilkan:
  DEBIT  → Persediaan Barang   sebesar total_amount
  KREDIT → Kas Warung          sebesar total_amount
DASAR: FR-06
```

### BR-STOK-03: Update Inventori Otomatis
```
ATURAN: Setiap Tambah Stok harus memperbarui tabel inventory:
  - Jika item_name sudah ada → tambah quantity, update hpp (weighted average)
  - Jika item_name baru → insert record baru
TIDAK BOLEH: Quantity inventory menjadi negatif
DASAR: FR-07
```

---

## 4. Aturan Bisnis Modul Scan Nota (OCR)

### BR-OCR-01: Konfirmasi Wajib Sebelum Simpan
```
ATURAN: Hasil OCR TIDAK BOLEH langsung disimpan ke database
WAJIB: Tampilkan form editable kepada pengguna untuk review dan koreksi
ALASAN: Akurasi OCR tidak 100% — pengguna harus memvalidasi
DASAR: FR-11
```

### BR-OCR-02: Fallback Manual Wajib Tersedia
```
ATURAN: Fitur input manual harus SELALU tersedia sebagai alternatif OCR
        bahkan jika OCR berhasil (pengguna bisa pilih edit manual)
DASAR: R-02, R-05 (mitigasi risiko)
```

### BR-OCR-03: Setelah Konfirmasi → Ikut Aturan Tambah Stok
```
ATURAN: Data dari OCR yang sudah dikonfirmasi diproses mengikuti
        seluruh aturan BR-STOK-01 s.d. BR-STOK-03
DASAR: FR-12
```

---

## 5. Aturan Bisnis Modul Catat Bon (Piutang)

### BR-BON-01: Akad Qardh — ZERO INTEREST (KRUSIAL!)
```
ATURAN: TIDAK BOLEH ADA bunga, denda, atau biaya tambahan apapun
        atas piutang yang tercatat dalam modul ini
DASAR SYARIAH: Akad Qardh — pinjaman kebajikan, riba hukumnya haram
IMPLEMENTASI TEKNIS:
  - Tabel receivables TIDAK memiliki kolom interest atau late_fee
  - Validasi backend: amount_paid selalu ≤ original_amount
  - Sistem tidak akan pernah menghitung atau menampilkan bunga
DASAR: FR-17
```

### BR-BON-02: Validasi Input Bon
```
ATURAN: Field yang wajib diisi:
  - customer_name: tidak boleh kosong
  - amount: angka positif > 0
  - bon_date: otomatis hari ini (dapat disesuaikan ke tanggal lebih awal)
STATUS DEFAULT: 'outstanding'
DASAR: FR-13
```

### BR-BON-03: Penjurnalan Otomatis Bon
```
ATURAN: Setiap Catat Bon tersimpan HARUS menghasilkan:
  DEBIT  → Piutang Bon          sebesar amount
  KREDIT → Pendapatan Penjualan sebesar amount
DASAR: FR-14, prinsip double-entry
```

### BR-BON-04: Pelunasan Bon
```
ATURAN: Saat bon dilunasi (full/parsial):
  DEBIT  → Kas Warung    sebesar amount_paid
  KREDIT → Piutang Bon   sebesar amount_paid
  UPDATE status = 'paid' HANYA jika amount_paid = original_amount
  Pelunasan parsial → status tetap 'outstanding', sisa diupdate
DASAR: FR-16
```

### BR-BON-05: Tampilan Dashboard
```
ATURAN: Total piutang outstanding harus ditampilkan di dashboard utama
        dan ikut dalam kalkulasi neraca warung
DASAR: FR-15
```

---

## 6. Aturan Bisnis Dana Sedekah / Titipan

### BR-SEDEKAH-01: Dana Sedekah adalah LIABILITAS (KRUSIAL!)
```
ATURAN: Dana sedekah, infaq, atau kembalian pelanggan yang dititipkan
        HARUS dicatat sebagai Liabilitas (Titipan & Utang)
        BUKAN sebagai Pendapatan, Modal, atau Kas Warung
DASAR SYARIAH: Dana ini bukan milik warung — amanah kepada pemiliknya
IMPLEMENTASI:
  DEBIT  → Kas Warung           (karena uang fisik diterima)
  KREDIT → Dana Titipan/Sedekah (Liabilitas — bukan pendapatan!)
DASAR: NFR-12
```

### BR-SEDEKAH-02: Validasi Penjurnalan
```
ATURAN: Sistem HARUS menolak jurnal yang menempatkan dana sedekah
        sebagai Pendapatan atau Modal
MEKANISME: Database trigger validasi sebelum INSERT journal_entries
DASAR: NFR-12
```

---

## 7. Aturan Bisnis Neraca

### BR-NERACA-01: Keseimbangan Neraca
```
ATURAN: Total Aset selalu harus sama dengan Total Liabilitas + Ekuitas
FORMULA:
  Total Aset = Kas Warung + Persediaan Barang + Piutang Bon
  Total Liabilitas = Dana Titipan/Sedekah
  Total Ekuitas = Modal Warung + Laba Ditahan
  HARUS: Total Aset = Total Liabilitas + Total Ekuitas
DASAR: FR-26, prinsip akuntansi dasar
```

### BR-NERACA-02: Pemisahan Kategori
```
ATURAN: Neraca HARUS memisahkan secara visual dan logis:
  KIRI (Harta Warung / Aset):
    - Kas Warung (Uang di laci)
    - Persediaan Barang (nilai HPP × qty)
    - Piutang Bon (outstanding)
  KANAN (Titipan & Utang / Liabilitas + Ekuitas):
    - Dana Titipan/Sedekah (Liabilitas)
    - Modal Warung (Ekuitas)
    - Laba Ditahan (Ekuitas)
DASAR: FR-26, UX-12
```

---

## 8. Aturan Bisnis Zakat Tijarah

### BR-ZAKAT-01: Kalkulasi Total Aset Wajib Zakat
```
ATURAN: Total aset yang diperhitungkan untuk zakat:
  total_assets = kas_warung + nilai_persediaan + piutang_outstanding
  CATATAN: Dana sedekah (liabilitas) TIDAK termasuk dalam total_assets
DASAR: FR-27
```

### BR-ZAKAT-02: Pengecekan Nisab
```
ATURAN: Nisab zakat tijarah = setara nilai 85 gram emas
TRIGGER: Setiap ada perubahan data aset signifikan
  JIKA total_assets >= nisab:
    → Catat nisab_reached_at (jika belum ada)
  JIKA total_assets < nisab:
    → Reset nisab_reached_at = NULL
DASAR: FR-28
```

### BR-ZAKAT-03: Pengecekan Haul
```
ATURAN: Haul = 1 tahun Hijriah ≈ 354 hari
KONDISI WAJIB ZAKAT:
  1. total_assets >= nisab (konsisten selama haul)
  2. NOW() >= nisab_reached_at + 354 hari (haul tercapai)
DASAR: FR-29
```

### BR-ZAKAT-04: Kalkulasi dan Notifikasi Zakat
```
ATURAN: Jika Nisab DAN Haul terpenuhi:
  zakat_amount = total_assets × 2.5%
  → Tampilkan notifikasi kewajiban zakat di dashboard
  → Sertakan jumlah yang harus dibayarkan
TARIF: 2.5% (dua setengah persen) — sesuai ijma' ulama
DASAR: FR-30
```

---

## 9. Aturan Bisnis Dashboard & Laporan

### BR-DASHBOARD-01: Informasi Wajib di Beranda
```
ATURAN: Dashboard beranda HARUS menampilkan (real-time):
  1. Total Kas Warung (paling menonjol)
  2. Untung Hari Ini (laba bersih harian)
  3. Total Piutang Bon (outstanding)
  4. 5 Catatan Terakhir (transaksi terbaru)
  5. 4 Tombol Aksi Cepat: Catat Jual, Tambah Stok, Scan Nota, Catat Bon
DASAR: FR-22, FR-23, UX-04, UX-05
```

### BR-DASHBOARD-02: Notifikasi Aktif
```
ATURAN: Dashboard HARUS menampilkan notifikasi aktif untuk:
  - Bon yang hampir/sudah jatuh tempo
  - Kewajiban zakat tijarah yang sudah due
DASAR: UX-06
```

### BR-LAPORAN-01: Filter Periode
```
ATURAN: Laporan keuangan dapat difilter berdasarkan:
  - Hari Ini
  - Minggu Ini
  - Bulan Ini
TAMPILAN WAJIB: Uang Laci (Arus Kas), Untung Bersih (Laba Rugi),
                Grafik Masuk vs Keluar
DASAR: FR-24, FR-25
```

---

## 10. Aturan Bisnis UI/UX

### BR-UX-01: Bahasa Tanpa Istilah Teknis
```
ATURAN: Antarmuka pengguna TIDAK BOLEH menggunakan istilah teknis akuntansi
PENGGANTI yang disetujui:
  "Kas Warung" atau "Uang di Laci" → bukan "Cash" atau "Kas"
  "Untung Hari Ini" → bukan "Net Profit" atau "Laba Bersih"
  "Uang Masuk" → bukan "Revenue" atau "Pendapatan"
  "Uang Keluar" → bukan "Expense" atau "Beban"
  "Harta Warung" → bukan "Aset" atau "Assets"
  "Titipan & Utang" → bukan "Liabilitas" atau "Liabilities"
DASAR: NFR-17
```

### BR-UX-02: Maksimum 3 Langkah per Transaksi
```
ATURAN: Pengguna harus dapat menyelesaikan satu transaksi dalam
        tidak lebih dari 3 langkah interaksi
CONTOH Catat Jual:
  Langkah 1: Tap tombol "Catat Jual"
  Langkah 2: Isi nama barang dan nominal → tap "Simpan"
  Langkah 3: Konfirmasi notifikasi sukses
DASAR: NFR-18
```

### BR-UX-03: Aksesibilitas Minimal
```
ATURAN: Desain harus memenuhi WCAG AA minimum:
  - Rasio kontras warna minimal 4.5:1 untuk teks biasa
  - Touch target minimal 44×44px untuk semua tombol
  - Font size minimal 16px untuk body text
DASAR: NFR-16
```

---

## 11. Aturan Bisnis Performa

| ID | Aturan | Nilai | Dasar |
|---|---|---|---|
| BR-PERF-01 | Halaman dashboard load time | ≤ 3 detik pada 4G | NFR-01 |
| BR-PERF-02 | Respons OCR Scan Nota | < 10 detik | NFR-02 |
| BR-PERF-03 | API response time | ≤ 500ms untuk operasi standar | NFR-03 |
| BR-PERF-04 | Uptime aplikasi | ≥ 99% per bulan | NFR-04 |
| BR-PERF-05 | Akurasi OCR (struk terbaca) | ≥ 80% | FR-10, KPI |

---

## 12. Referensi Functional Requirements

| FR Code | Modul | Status |
|---|---|---|
| FR-01 – FR-04 | Modul Catat Jual | In Scope Fase 2 |
| FR-05 – FR-08 | Modul Tambah Stok | In Scope Fase 2 |
| FR-09 – FR-12 | Modul Scan Nota (OCR) | In Scope Fase 3 |
| FR-13 – FR-17 | Modul Catat Bon | In Scope Fase 2 |
| FR-18 – FR-21 | Warpin AI Assistant | In Scope Fase 3 |
| FR-22 – FR-26 | Dashboard & Laporan | In Scope Fase 2 |
| FR-27 – FR-30 | Otomasi Zakat Tijarah | In Scope Fase 2 |

---

## 13. Out-of-Scope (Fase 1) — Aturan Bisnis yang TIDAK Berlaku

Aturan-aturan berikut **tidak diimplementasikan** dalam Fase 1:

- ❌ Multi-cabang: hanya satu warung per akun
- ❌ Marketplace integration: tidak ada sinkronisasi Tokopedia/Shopee
- ❌ Penggajian karyawan: tidak ada modul payroll
- ❌ Pembayaran digital langsung: tidak ada QRIS/transfer bank dari dalam aplikasi
- ❌ Aplikasi native iOS/Android: hanya web-based

---

*Business_Rules.md — Warung Pintar Syariah v1.0*
*Seluruh aturan bisnis ini bersumber langsung dari PRD v1.0 — Nur Assyfa Taufiq (NIM: 2310102063)*
