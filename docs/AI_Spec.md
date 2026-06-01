# 🤖 AI_Spec.md — Warung Pintar Syariah

> Spesifikasi lengkap seluruh fitur kecerdasan buatan (AI) yang terintegrasi dalam platform Warpin, mencakup OCR, Speech-to-Text, AI Assistant, dan Kalkulasi Zakat Otomatis.

---

## 1. Ringkasan Fitur AI

| Fitur AI | Teknologi | Status | Prioritas |
|---|---|---|---|
| OCR Pemindai Nota | Google Cloud Vision API | Fase 3 | Tinggi |
| Warpin AI — Voice Input | Google Speech-to-Text API | Fase 3 | Tinggi |
| Warpin AI — Chat/Edukasi | AI Language Model (LLM) | Fase 3 | Tinggi |
| Kalkulasi Zakat Otomatis | Supabase DB Functions/Triggers | Fase 2 | Tinggi |
| "Pintar Akuntansi" Notifikasi | Rule-based + LLM | Fase 2 | Sedang |

---

## 2. AI Fitur 1: OCR Pemindai Nota (Scan Nota)

### 2.1 Deskripsi
AI memproses gambar struk belanja grosir dan mengekstraksi data barang, harga, dan kuantitas secara otomatis menggunakan teknologi Optical Character Recognition (OCR).

### 2.2 Spesifikasi Teknis

| Parameter | Spesifikasi |
|---|---|
| **API** | Google Cloud Vision API — Document Text Detection |
| **Input** | Foto struk belanja (JPEG/PNG, maks. 10MB) |
| **Capture Method** | WebRTC via browser (FR-09) |
| **Output** | Data terstruktur: nama barang, HPP, kuantitas |
| **Target Akurasi** | ≥ 80% pada struk yang terbaca jelas (FR-10, KPI) |
| **Response Time** | < 10 detik setelah foto diambil (NFR-02) |

### 2.3 Alur Proses

```
1. User membuka Modul Scan Nota
2. Browser meminta izin kamera (WebRTC)
3. User memotret struk belanja
4. Gambar dikonversi ke Base64 / dikirim ke backend
5. Backend POST ke Google Cloud Vision API
   └── Feature: DOCUMENT_TEXT_DETECTION
6. API mengembalikan teks mentah (raw text)
7. Parser mengekstraksi:
   ├── Nama barang → item_name
   ├── Harga satuan → hpp (Harga Pokok Pembelian)
   └── Kuantitas → quantity
8. Hasil ditampilkan dalam form editable (FR-11)
9. User review & koreksi jika perlu
10. User konfirmasi → trigger alur Tambah Stok
```

### 2.4 Contoh Payload API

**Request ke Google Cloud Vision:**
```json
{
  "requests": [
    {
      "image": {
        "content": "<BASE64_ENCODED_IMAGE>"
      },
      "features": [
        {
          "type": "DOCUMENT_TEXT_DETECTION",
          "maxResults": 1
        }
      ]
    }
  ]
}
```

**Response Parsing (contoh output struk):**
```
Raw OCR Text: "GULA PASIR 2 KG @8500 = 17000\nMIE INSTAN 5 PCS @3000 = 15000"
Parsed Result:
  [
    { item_name: "GULA PASIR", hpp: 8500, quantity: 2, unit: "KG" },
    { item_name: "MIE INSTAN", hpp: 3000, quantity: 5, unit: "PCS" }
  ]
```

### 2.5 Penanganan Error & Fallback

| Kondisi | Penanganan |
|---|---|
| Struk buram / tidak terbaca | Tampilkan pesan: "Struk kurang jelas, silakan isi manual" + form kosong |
| API timeout | Retry otomatis 1x, lalu fallback ke input manual |
| Akurasi rendah (< 80%) | Tandai field dengan indikator "Perlu cek ulang" berwarna kuning |
| Kuota API habis | Fallback langsung ke form input manual (R-05) |

### 2.6 Mitigasi Risiko (R-02, R-05)

- Form editable **selalu tersedia** setelah OCR — user dapat mengoreksi sebelum konfirmasi
- Rate limiting diterapkan untuk mencegah penggunaan berlebihan kuota API
- Monitoring penggunaan API harian/bulanan

---

## 3. AI Fitur 2: Warpin AI Assistant — Perintah Suara

### 3.1 Deskripsi
Asisten AI yang memungkinkan pemilik warung mencatat transaksi melalui perintah suara dalam Bahasa Indonesia, menggunakan Google Speech-to-Text API untuk konversi audio ke teks, kemudian Natural Language Understanding (NLU) untuk mengekstraksi intent dan entitas transaksi.

### 3.2 Spesifikasi Teknis

| Parameter | Spesifikasi |
|---|---|
| **Speech API** | Google Speech-to-Text API |
| **Bahasa** | Bahasa Indonesia (`id-ID`) |
| **Input** | Audio real-time via mikrofon browser |
| **Output** | Intent transaksi + entitas (jenis, nominal, barang) |
| **Mode** | Streaming (real-time transcription) |
| **Context** | Disimpan per sesi untuk konsistensi (FR-21) |

### 3.3 Alur Proses

```
1. User menekan ikon mikrofon (kuning emas di nav bar)
2. Browser meminta izin mikrofon
3. Audio streaming dikirim ke Google Speech-to-Text API
4. Transkripsi real-time ditampilkan di layar (UX-14)
5. Setelah user selesai berbicara → NLU Parser memproses teks:
   ├── Intent Detection: jual | beli | bon | tanya
   ├── Entity Extraction: nominal, nama barang, nama pelanggan
   └── Validasi: apakah data cukup untuk membuat jurnal?
6. Jika intent valid → tampilkan "Kartu Konfirmasi Jurnal" (UX-15)
7. User konfirmasi (tap "Ya, Simpan") atau batalkan
8. Jika dikonfirmasi → alur transaksi terkait dieksekusi
```

### 3.4 Contoh Perintah Suara yang Dikenali

| Perintah Suara | Intent | Parsing |
|---|---|---|
| "Jual gula satu kilo dua belas ribu" | `jual` | item: "gula", qty: 1, nominal: 12000 |
| "Beli mie instan sepuluh bungkus tiga puluh ribu" | `beli` | item: "mie instan", qty: 10, nominal: 30000 |
| "Catat bon Ibu Sari lima puluh ribu" | `bon` | customer: "Ibu Sari", nominal: 50000 |
| "Berapa untung hari ini?" | `tanya_laporan` | query: laba_hari_ini |
| "Apa itu zakat tijarah?" | `tanya_edukasi` | topik: "zakat tijarah" |

### 3.5 NLU Parser — Logic

```javascript
// Contoh logika parsing (pseudo-code)
function parseTransactionIntent(transcript) {
  const jualKeywords = ['jual', 'laku', 'terjual', 'bayar'];
  const beliKeywords = ['beli', 'beli stok', 'kulak', 'kulakan', 'belanja'];
  const bonKeywords = ['bon', 'utang', 'catat utang', 'belum bayar'];

  let intent = detectIntent(transcript, { jualKeywords, beliKeywords, bonKeywords });
  let nominal = extractNominal(transcript);   // regex + angka kata
  let itemName = extractItemName(transcript); // setelah keyword jual/beli
  let customerName = extractCustomer(transcript); // setelah kata 'bon/utang'

  return { intent, nominal, itemName, customerName };
}
```

### 3.6 Kartu Konfirmasi Jurnal (UX-15)

Sebelum transaksi disimpan, sistem menampilkan kartu konfirmasi:

```
┌─────────────────────────────────────────┐
│  🎙️ Warpin AI mendengar:                │
│  "Jual gula satu kilo dua belas ribu"   │
│                                         │
│  📋 Jurnal yang akan dibuat:            │
│  ✅ Kas Warung       +Rp 12.000 (Debit) │
│  ✅ Pendapatan       +Rp 12.000 (Kredit)│
│  📦 Barang: Gula | Nominal: Rp 12.000  │
│                                         │
│  [❌ Batal]          [✅ Ya, Simpan]    │
└─────────────────────────────────────────┘
```

---

## 4. AI Fitur 3: Warpin AI Assistant — Edukasi & Chat

### 4.1 Deskripsi
Warpin AI berfungsi sebagai chatbot edukatif yang menjawab pertanyaan seputar keuangan warung dan muamalah Islam dalam Bahasa Indonesia yang sederhana dan mudah dipahami oleh pemilik warung.

### 4.2 Spesifikasi Teknis

| Parameter | Spesifikasi |
|---|---|
| **Model** | AI Language Model (LLM) |
| **Bahasa** | Bahasa Indonesia |
| **Konteks** | Disimpan per sesi |
| **Scope** | Keuangan warung + muamalah + panduan Warpin |
| **Fase Awal** | Mockup interaktif sebelum integrasi AI penuh |

### 4.3 System Prompt (Referensi)

```
Kamu adalah Warpin AI, asisten keuangan warung yang ramah dan berbasis syariah.
Kamu membantu pemilik warung Indonesia memahami keuangan mereka.

Panduan respons:
- Gunakan Bahasa Indonesia yang sangat sederhana dan ramah
- Hindari istilah teknis akuntansi; gunakan bahasa sehari-hari
- Jika ditanya tentang muamalah, berikan jawaban berdasarkan fiqih yang umum diterima
- Jika ditanya tentang fitur Warpin, arahkan ke fitur yang tersedia
- Selalu awali dengan sapaan hangat
- Maksimal 3 paragraf per jawaban agar tidak membingungkan

Topik yang bisa dijawab:
1. Cara menggunakan fitur Warpin (Catat Jual, Tambah Stok, dll.)
2. Penjelasan laporan keuangan dalam bahasa sederhana
3. Edukasi zakat tijarah, akad qardh, hukum bon tanpa bunga
4. Tips mengelola keuangan warung
```

### 4.4 Contoh Q&A

| Pertanyaan Pengguna | Contoh Respons Warpin AI |
|---|---|
| "Apa itu zakat tijarah?" | "Zakat tijarah itu zakat yang wajib dikeluarkan dari keuntungan berdagang Bu/Pak. Kalau harta warung sudah mencapai nisab (minimal setara 85 gram emas) dan sudah berlalu satu tahun, maka wajib dikeluarkan 2,5% dari total harta warung..." |
| "Kenapa bon pelanggan saya tidak boleh dikasih bunga?" | "Dalam Islam, memberi pinjaman (bon) kepada pelanggan itu termasuk akad qardh, yaitu pinjaman kebajikan. Menambahkan bunga atau denda di atasnya hukumnya riba, yang dilarang dalam Islam. Warpin sudah otomatis menjaga ini untuk Ibu/Bapak..." |
| "Gimana cara baca laporan neraca?" | "Neraca itu ibarat 'foto kondisi warung hari ini' Bu/Pak. Bagian kiri (Harta Warung) isinya semua yang warung punya: uang di laci, barang di rak, dan bon yang belum dilunasi pelanggan. Bagian kanan (Titipan & Utang) isinya kewajiban warung..." |

### 4.5 "Pintar Akuntansi" — Notifikasi Edukatif Otomatis

Setelah setiap transaksi disimpan, sistem menampilkan penjelasan edukatif dalam bahasa sederhana:

| Transaksi | Notifikasi "Pintar Akuntansi" |
|---|---|
| Catat Jual | "✅ Mantap! Uang masuk ke laci kasir (Kas +Rp 12.000) dan warung Bapak/Ibu punya catatan pemasukan baru." |
| Tambah Stok | "📦 Stok bertambah! Barang masuk ke rak (Persediaan +Rp 30.000), uang berkurang dari laci (Kas -Rp 30.000). Ini namanya Debit Persediaan, Kredit Kas." |
| Catat Bon | "📝 Bon tercatat! Pelanggan berutang (Piutang +Rp 50.000). Jangan lupa ingatkan dengan sopan ya, dan tanpa bunga sesuai syariah." |

---

## 5. AI Fitur 4: Kalkulasi Zakat Tijarah Otomatis

### 5.1 Deskripsi
Sistem memantau total aset warung secara berkala menggunakan Supabase Database Functions dan Triggers, lalu menghitung dan menginformasikan kewajiban zakat perdagangan tanpa intervensi pengguna.

### 5.2 Spesifikasi Teknis

| Parameter | Spesifikasi |
|---|---|
| **Engine** | Supabase PostgreSQL Functions + Triggers |
| **Trigger** | Setiap INSERT/UPDATE pada tabel transactions atau inventory |
| **Nisab Reference** | Setara 85 gram emas (threshold dapat dikonfigurasi) |
| **Haul Tracking** | 1 tahun Hijriah (~354 hari) dari tanggal Nisab tercapai |
| **Tarif Zakat** | 2,5% dari total aset wajib zakat |

### 5.3 Formula Kalkulasi

```sql
-- Function: calculate_zakat_obligation(warung_id UUID)
DECLARE
  v_total_kas       DECIMAL := 0;
  v_total_persediaan DECIMAL := 0;
  v_total_piutang   DECIMAL := 0;
  v_total_assets    DECIMAL := 0;
  v_nisab           DECIMAL := get_current_nisab();  -- 85 gram × harga emas hari ini
  v_zakat_amount    DECIMAL := 0;
BEGIN
  -- 1. Hitung kas warung
  SELECT COALESCE(SUM(amount), 0) INTO v_total_kas
  FROM kas_summary WHERE warung_id = $1;

  -- 2. Hitung nilai persediaan (HPP × qty)
  SELECT COALESCE(SUM(hpp * quantity), 0) INTO v_total_persediaan
  FROM inventory WHERE warung_id = $1;

  -- 3. Hitung piutang outstanding
  SELECT COALESCE(SUM(amount), 0) INTO v_total_piutang
  FROM receivables WHERE warung_id = $1 AND status = 'outstanding';

  -- 4. Total aset wajib zakat
  v_total_assets := v_total_kas + v_total_persediaan + v_total_piutang;

  -- 5. Cek Nisab
  IF v_total_assets >= v_nisab THEN
    -- Catat waktu nisab tercapai (jika belum)
    -- Track haul (1 tahun Hijriah)
    -- Hitung zakat
    v_zakat_amount := v_total_assets * 0.025;  -- 2.5%
  END IF;

  RETURN v_zakat_amount;
END;
```

### 5.4 Alur Notifikasi Zakat

```
TRIGGER aktif → kalkulasi_zakat()
  ↓
total_assets >= nisab?
  → YA: apakah nisab_reached_at sudah dicatat?
         → BELUM: catat nisab_reached_at = NOW()
         → SUDAH: hitung haul_due_at = nisab_reached_at + 354 hari
  ↓
NOW() >= haul_due_at?
  → YA: hitung zakat_amount = total_assets × 2.5%
         UPDATE zakat_tracker SET notified = FALSE
         Dashboard menampilkan notifikasi zakat
  → TIDAK: tidak ada notifikasi (haul belum tercapai)
```

### 5.5 Tampilan Notifikasi Zakat di Dashboard

```
┌───────────────────────────────────────────────────────────┐
│  🕌 KEWAJIBAN ZAKAT TIJARAH                               │
│                                                           │
│  Alhamdulillah, warung Ibu/Bapak sudah berkah!           │
│  Total harta warung: Rp 8.500.000                        │
│  Nisab saat ini: Rp 7.200.000 (≈ 85 gram emas)          │
│  Haul: sudah 1 tahun                                     │
│                                                           │
│  💰 Zakat yang wajib dikeluarkan: Rp 212.500 (2,5%)     │
│                                                           │
│  [📚 Pelajari Lebih Lanjut]   [✅ Sudah Dibayar]         │
└───────────────────────────────────────────────────────────┘
```

---

## 6. Fase Implementasi AI

| Fitur | Fase | Keterangan |
|---|---|---|
| "Pintar Akuntansi" (rule-based) | Fase 2 | Notifikasi edukatif sederhana pasca transaksi |
| Kalkulasi Zakat (DB Functions) | Fase 2 | Otomasi penuh berbasis trigger database |
| OCR Scan Nota | Fase 3 | Google Cloud Vision API integration |
| Voice Input (Speech-to-Text) | Fase 3 | Google Speech-to-Text API integration |
| Warpin AI Chat (LLM) | Fase 3 | AI Language Model untuk edukasi interaktif |
| AI Chat Penuh + Konteks Panjang | Fase 4+ | Post-launch enhancement |

---

## 7. KPI & Metrik AI

| Metrik | Target |
|---|---|
| Akurasi OCR (struk terbaca jelas) | ≥ 80% |
| Intent Recognition Voice | ≥ 85% (internal target) |
| Response Time OCR | < 10 detik |
| Satisfaksi Pengguna AI Chat | ≥ 4.0/5.0 (post-launch survey) |
| Adopsi Fitur Voice | ≥ 40% pengguna aktif (6 bulan) |

---

*AI_Spec.md — Warung Pintar Syariah v1.0*
