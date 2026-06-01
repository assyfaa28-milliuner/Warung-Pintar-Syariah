# ⚖️ Compliance.md — Warung Pintar Syariah

> Dokumen kepatuhan sistem Warpin, mencakup prinsip syariah, standar akuntansi, kepatuhan data, dan persyaratan hukum yang berlaku.

---

## 1. Kepatuhan Syariah (Sharia Compliance)

### 1.1 Prinsip Dasar Muamalah yang Diterapkan

Warpin dibangun di atas fondasi prinsip muamalah Islam yang ketat. Setiap fitur dan logika bisnis dirancang untuk memastikan tidak ada pelanggaran syariah dalam pengelolaan keuangan warung.

| Prinsip | Implementasi di Warpin |
|---|---|
| **Bebas Riba** | Modul Catat Bon menggunakan Akad Qardh — tidak ada bunga atau biaya tambahan apapun atas piutang pelanggan (FR-17) |
| **Amanah (Trustworthiness)** | Dana sedekah/kembalian dicatat sebagai **Liabilitas**, bukan Pendapatan atau Modal — tidak boleh masuk ke perhitungan warung (NFR-12) |
| **Transparansi** | Setiap jurnal ditampilkan dalam bahasa sederhana kepada pemilik warung ("Pintar Akuntansi") |
| **Zakat Tijarah** | Sistem menghitung dan mengingatkan kewajiban zakat perdagangan secara otomatis berdasarkan Nisab dan Haul |
| **Tidak Mencampurkan Harta** | Sistem memisahkan secara tegas: Kas Warung (Harta Bisnis) vs Dana Titipan/Sedekah (Liabilitas) |

### 1.2 Akad Qardh — Modul Catat Bon

**Definisi:** Akad Qardh adalah akad pinjaman kebajikan dalam Islam di mana kreditur tidak diperbolehkan mengambil keuntungan (riba) dari pinjaman yang diberikan.

**Implementasi Teknis:**
- Tabel `receivables` **tidak memiliki kolom bunga (interest)** maupun denda keterlambatan
- Sistem tidak akan pernah menambah nilai bon melebihi nominal asli yang tercatat
- Validasi backend: `amount_paid <= original_amount` selalu diberlakukan
- Pelunasan parsial diperbolehkan tanpa penalti

**Business Rule (BR-01):**
```
JIKA transaksi_type = 'receivable'
MAKA amount_final = amount_original
DAN interest = 0 (selalu)
DAN late_fee = 0 (selalu)
```

### 1.3 Dana Titipan / Sedekah — Perlakuan sebagai Liabilitas

**Prinsip Syariah:** Dana kembalian pelanggan yang dititipkan atau dana sedekah/infaq yang diterima warung **bukan milik warung**. Mencampurkannya dengan modal atau pendapatan adalah pelanggaran amanah.

**Implementasi Teknis:**
- Dana titipan disimpan di tabel `sedekah_fund` yang terpisah
- Pada Neraca: selalu dikategorikan sebagai **Liabilitas (Titipan & Utang)**, bukan Aset atau Ekuitas
- Trigger database mencegah penggunaan dana sedekah sebagai modal kerja
- NFR-12: "Dana titipan/sedekah tidak boleh pernah masuk ke dalam perhitungan Modal atau Pendapatan secara otomatis"

### 1.4 Zakat Tijarah — Kewajiban Zakat Perdagangan

**Dasar Hukum:** Zakat atas harta perdagangan (tijarah) wajib dikeluarkan apabila memenuhi dua syarat: Nisab (jumlah minimum) dan Haul (periode waktu).

| Parameter | Nilai | Sumber |
|---|---|---|
| **Nisab** | Setara nilai 85 gram emas | Ijtima' ulama kontemporer |
| **Haul** | 1 tahun Hijriah | Hadits shahih |
| **Tarif Zakat** | 2,5% dari total aset wajib zakat | Ijma' ulama |
| **Cakupan Aset** | Kas + Persediaan (HPP) + Piutang (outstanding) | Fiqih muamalah |

**Alur Kalkulasi (FR-27 s.d. FR-30):**
1. Sistem menghitung `total_assets = kas_warung + nilai_persediaan + piutang_outstanding`
2. Bandingkan dengan nilai Nisab terkini (85 gram × harga emas hari ini)
3. Jika `total_assets >= nisab` → catat waktu pencapaian Nisab
4. Setelah 1 tahun Hijriah berlalu (`haul`) → hitung `zakat = total_assets × 2.5%`
5. Tampilkan notifikasi kewajiban zakat di dashboard

---

## 2. Kepatuhan Akuntansi

### 2.1 Double-Entry Bookkeeping

Warpin mengimplementasikan sistem pembukuan berpasangan (double-entry) secara otomatis di latar belakang.

**Prinsip:** Setiap transaksi selalu memiliki dua sisi:
- **Debit** = pertambahan Aset atau pengurangan Liabilitas/Ekuitas
- **Kredit** = pengurangan Aset atau pertambahan Liabilitas/Ekuitas/Pendapatan

**Jurnal Otomatis per Transaksi:**

| Transaksi | Debit | Kredit |
|---|---|---|
| Catat Jual (Penjualan) | Kas Warung | Pendapatan Penjualan |
| Tambah Stok (Pembelian) | Persediaan Barang | Kas Warung |
| Catat Bon (Piutang) | Piutang Bon | Pendapatan Penjualan |
| Pelunasan Bon | Kas Warung | Piutang Bon |
| Terima Dana Sedekah | Kas Warung | Dana Titipan (Liabilitas) |

**Validasi Sistem (NFR-11):**
```
CONSTRAINT: SUM(debit_amount) = SUM(credit_amount) per transaction_id
JIKA tidak seimbang → sistem MENOLAK transaksi
```

### 2.2 Struktur Akun (Chart of Accounts)

| Kode | Nama Akun | Tipe | Keterangan |
|---|---|---|---|
| 1-001 | Kas Warung | Aset | Uang tunai di laci kasir |
| 1-002 | Persediaan Barang | Aset | Nilai stok berdasarkan HPP |
| 1-003 | Piutang Bon | Aset | Total bon belum terlunasi |
| 2-001 | Dana Titipan / Sedekah | Liabilitas | Bukan milik warung |
| 3-001 | Modal Warung | Ekuitas | Modal awal pemilik |
| 4-001 | Pendapatan Penjualan | Pendapatan | Omzet penjualan |
| 5-001 | HPP Pembelian | Beban | Biaya pembelian stok |

### 2.3 Neraca (Balance Sheet)

```
HARTA WARUNG (Aset)                 TITIPAN & UTANG (Liabilitas + Ekuitas)
─────────────────────────────       ──────────────────────────────────────
Kas Warung          Rp xxx.xxx       Dana Titipan/Sedekah    Rp xxx.xxx
Persediaan Barang   Rp xxx.xxx       Modal Warung            Rp xxx.xxx
Piutang Bon         Rp xxx.xxx       Laba Ditahan            Rp xxx.xxx
                    ──────────                               ──────────
TOTAL ASET          Rp xxx.xxx       TOTAL LIABILITAS+EKUITAS Rp xxx.xxx
```

**Validasi:** Total Aset selalu harus sama dengan Total Liabilitas + Ekuitas.

---

## 3. ACID Compliance

Warpin menjamin integritas data keuangan melalui ACID Compliance penuh pada level database (PostgreSQL Supabase).

| Properti | Definisi | Implementasi |
|---|---|---|
| **Atomicity** | Semua langkah transaksi berhasil, atau semuanya dibatalkan | PostgreSQL transactions dengan BEGIN/COMMIT/ROLLBACK |
| **Consistency** | Data selalu dalam kondisi valid sebelum dan sesudah transaksi | CHECK constraints, triggers validasi |
| **Isolation** | Transaksi yang berjalan bersamaan tidak saling mengganggu | PostgreSQL isolation levels |
| **Durability** | Data yang sudah tersimpan tidak akan hilang | Supabase persistent storage dengan backup |

---

## 4. Kepatuhan Keamanan Data

### 4.1 Perlindungan Data Pengguna

| Aspek | Standar | Implementasi |
|---|---|---|
| **Enkripsi PIN** | bcrypt hashing | PIN tidak pernah disimpan sebagai plaintext |
| **Enkripsi at-rest** | AES-256 | Supabase database encryption |
| **Enkripsi in-transit** | TLS 1.2+ | HTTPS wajib via Vercel |
| **Isolasi Data** | Per-warung RLS | Setiap warung hanya akses datanya sendiri |

### 4.2 Row Level Security (RLS)

RLS (NFR-09) memastikan data setiap warung terisolasi secara ketat. Pengguna A tidak dapat mengakses data Pengguna B meskipun menggunakan aplikasi yang sama.

```sql
-- Contoh policy RLS untuk tabel transactions
CREATE POLICY "warung_own_data" ON transactions
  FOR ALL USING (warung_id = auth.uid());
```

### 4.3 Audit Trail

- NFR-08: Setiap transaksi keuangan tercatat dalam audit trail yang tidak dapat dimodifikasi
- Sistem hanya menggunakan **soft delete** (`is_deleted = TRUE`) — data tidak pernah dihapus permanen
- Seluruh perubahan data memiliki timestamp (`created_at`, `updated_at`)

---

## 5. Kepatuhan Aksesibilitas

| Standar | Persyaratan | Implementasi |
|---|---|---|
| **WCAG AA** | Kontras warna minimum | Rasio kontras ≥ 4.5:1 untuk teks normal |
| **Ramah Lansia** | Tombol berukuran besar | Minimum touch target 44×44px |
| **Bahasa Sederhana** | Tanpa istilah teknis | Semua label dalam bahasa sehari-hari |
| **Responsif** | Lebar layar ≥ 360px | TailwindCSS responsive grid |

---

## 6. Review Syariah & Audit

### 6.1 Rekomendasi Review Berkala

- Logika penjurnalan otomatis harus direview oleh pihak yang memahami fiqih muamalah sebelum production launch
- Audit jurnal berkala untuk memastikan konsistensi dengan prinsip syariah
- Unit test mencakup seluruh skenario transaksi (FR per modul)

### 6.2 Risiko Kepatuhan Syariah (dari PRD)

| Risiko | Tingkat | Mitigasi |
|---|---|---|
| Kesalahan logika akuntansi syariah | **Tinggi** | Review fiqih muamalah + unit test komprehensif |
| Percampuran dana sedekah dengan modal | **Tinggi** | Constraint database + trigger validation |
| Penambahan bunga tidak disengaja | **Sedang** | Validasi strict: `interest = 0` selalu |

---

## 7. Glossary Kepatuhan

| Istilah | Definisi |
|---|---|
| **Akad Qardh** | Pinjaman kebajikan tanpa bunga — dasar Modul Catat Bon |
| **Riba** | Tambahan yang diharamkan atas pinjaman atau utang |
| **Nisab** | Batas minimum harta wajib zakat (setara 85 gram emas) |
| **Haul** | Satu tahun Hijriah berlalunya aset yang melampaui Nisab |
| **Zakat Tijarah** | Zakat perdagangan 2,5% dari total aset wajib |
| **Liabilitas** | Kewajiban/utang — dana sedekah termasuk kategori ini |
| **ACID** | Atomicity, Consistency, Isolation, Durability |
| **RLS** | Row Level Security — isolasi data per pengguna |
| **Muamalah** | Hukum Islam yang mengatur transaksi dan hubungan antar manusia |

---

*Compliance.md — Warung Pintar Syariah v1.0*
*Dokumen ini harus direview oleh ahli fiqih muamalah sebelum go-live produksi.*
