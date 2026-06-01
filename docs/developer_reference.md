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
# 🏗️ Architecture.md — Warung Pintar Syariah

> Dokumen arsitektur teknis sistem Warpin, mencakup diagram high-level, komponen sistem, skema database, dan alur data.

---

## 1. Gambaran Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Browser)                    │
│              Next.js Web App (Vercel CDN)                   │
│         TailwindCSS | Antigravity (UI Transitions)          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/TLS
                           │
           ┌───────────────▼────────────────┐
           │         SUPABASE AUTH          │
           │    (Nomor HP + PIN 6 digit)    │
           └───────────────┬────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼───────┐  ┌───────▼───────┐
│  Transaksi   │  │  Keuangan      │  │  AI Service   │
│  Service     │  │  Service       │  │  (Warpin AI)  │
│              │  │                │  │               │
│ • Catat Jual │  │ • Jurnal       │  │ • OCR Engine  │
│ • Tambah Stok│  │ • Laporan      │  │ • Speech-to-  │
│ • Scan Nota  │  │ • Neraca       │  │   Text        │
│ • Catat Bon  │  │ • Zakat Calc   │  │ • LLM Chat    │
└───────┬──────┘  └────────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────▼──────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      DATA LAYER                             │
│         PostgreSQL (Supabase) | RLS | ACID Compliance       │
│                                                             │
│  transactions | journals | inventory | receivables          │
│  warung_profile | zakat_tracker | education_content         │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼───────┐  ┌───────▼───────┐
│ Google Cloud │  │ Google Speech  │  │    Vercel     │
│ Vision API   │  │ to Text API    │  │    CDN/CI/CD  │
│ (OCR)        │  │ (Voice Input)  │  │               │
└──────────────┘  └────────────────┘  └───────────────┘
```

---

## 2. Komponen Sistem

### 2.1 Frontend Layer

| Komponen | Teknologi | Keterangan |
|---|---|---|
| Framework Utama | Next.js | SSR + SSG untuk performa optimal |
| Styling | TailwindCSS | Utility-first, responsif mobile |
| Animasi | Antigravity | Smooth UI transitions |
| Kamera/WebRTC | Browser Native API | Untuk fitur Scan Nota |
| State Management | React Context / Zustand | Manajemen state sisi klien |

### 2.2 Backend & Database Layer

| Komponen | Teknologi | Keterangan |
|---|---|---|
| Backend & Auth | Supabase | Autentikasi berbasis nomor HP & PIN |
| Database | Supabase PostgreSQL | ACID Compliance, relasional |
| Triggers & Functions | Supabase DB Functions | Auto-journaling otomatis |
| Keamanan | Row Level Security (RLS) | Isolasi data per warung |

### 2.3 AI & External Integration Layer

| Komponen | Teknologi | Fungsi |
|---|---|---|
| OCR | Google Cloud Vision API | Ekstraksi teks dari struk belanja |
| Voice Input | Google Speech-to-Text API | Perintah suara ke teks |
| AI Assistant | AI Language Model | Edukasi keuangan & muamalah |

### 2.4 Infrastruktur

| Komponen | Teknologi | Keterangan |
|---|---|---|
| Hosting | Vercel | CDN global, auto-scaling |
| CI/CD | Vercel Git Integration | Deploy otomatis dari GitHub |
| SSL/TLS | HTTPS otomatis via Vercel | Enkripsi semua komunikasi |

---

## 3. Skema Database

### 3.1 Tabel Utama

#### `warung_profiles`
```sql
CREATE TABLE warung_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name    VARCHAR(255) NOT NULL,
  warung_name   VARCHAR(255) NOT NULL,
  phone_number  VARCHAR(20) UNIQUE NOT NULL,
  pin_hash      VARCHAR(255) NOT NULL,  -- bcrypt hash
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  type            VARCHAR(20) NOT NULL, -- 'sale' | 'purchase' | 'receivable' | 'payment'
  description     VARCHAR(500),
  amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted      BOOLEAN DEFAULT FALSE  -- soft delete only
);
```

#### `journal_entries`
```sql
CREATE TABLE journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  transaction_id  UUID REFERENCES transactions(id) NOT NULL,
  account_name    VARCHAR(100) NOT NULL,
  account_type    VARCHAR(20) NOT NULL,  -- 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  debit_amount    DECIMAL(15, 2) DEFAULT 0,
  credit_amount   DECIMAL(15, 2) DEFAULT 0,
  description     TEXT,
  journal_date    DATE NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- CONSTRAINT: debit_amount + credit_amount > 0 always
);
```

#### `inventory`
```sql
CREATE TABLE inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  item_name       VARCHAR(255) NOT NULL,
  hpp             DECIMAL(15, 2) NOT NULL,  -- Harga Pokok Pembelian
  quantity        INTEGER DEFAULT 0,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `receivables` (Piutang Bon)
```sql
CREATE TABLE receivables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  customer_name   VARCHAR(255) NOT NULL,
  amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  bon_date        DATE NOT NULL,
  due_date        DATE,
  status          VARCHAR(20) DEFAULT 'outstanding',  -- 'outstanding' | 'paid'
  paid_at         TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- NOTE: NO interest field — Akad Qardh (bebas riba)
);
```

#### `zakat_tracker`
```sql
CREATE TABLE zakat_tracker (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) UNIQUE NOT NULL,
  total_assets    DECIMAL(15, 2) DEFAULT 0,  -- kas + persediaan + piutang
  nisab_reached_at TIMESTAMP WITH TIME ZONE,
  haul_due_at     TIMESTAMP WITH TIME ZONE,
  zakat_amount    DECIMAL(15, 2) DEFAULT 0,  -- 2.5% dari total_assets
  notified        BOOLEAN DEFAULT FALSE,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `sedekah_fund` (Dana Titipan — Liabilitas)
```sql
CREATE TABLE sedekah_fund (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  amount          DECIMAL(15, 2) NOT NULL,
  source          TEXT,  -- keterangan asal dana
  fund_date       DATE NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- CRITICAL: fund ini adalah LIABILITAS, bukan aset/pendapatan warung
);
```

---

## 4. Alur Data per Modul

### 4.1 Alur Catat Jual
```
User Input → Validasi Form (FR-01)
  → INSERT transactions (type='sale')
  → TRIGGER: auto_journal_sale()
    → INSERT journal_entries (Debit: Kas Warung)
    → INSERT journal_entries (Kredit: Pendapatan Penjualan)
  → UPDATE dashboard (real-time via Supabase Realtime)
  → Tampilkan notifikasi "Pintar Akuntansi" (FR-03)
```

### 4.2 Alur Scan Nota (OCR)
```
Foto Struk (WebRTC/Camera)
  → Upload ke Server / Base64
  → POST ke Google Cloud Vision API
  → Parse hasil OCR (nama barang, harga, kuantitas)
  → Tampilkan form editable untuk koreksi (FR-11)
  → User konfirmasi
  → Alur Tambah Stok (FR-06 & FR-07)
```

### 4.3 Alur Warpin AI (Voice)
```
User tekan ikon mikrofon
  → Rekam audio via WebRTC
  → Stream audio ke Google Speech-to-Text API
  → Hasil transkrip teks → NLU Parser (identifikasi intent)
  → Intent: 'jual' | 'beli' | 'bon'
  → Tampilkan kartu konfirmasi jurnal (UX-15)
  → User konfirmasi → alur transaksi terkait
```

### 4.4 Alur Kalkulasi Zakat
```
TRIGGER: setiap INSERT/UPDATE transaksi signifikan
  → FUNCTION: calculate_total_assets(warung_id)
    → SUM kas + SUM persediaan (HPP × qty) + SUM piutang outstanding
  → Bandingkan dengan nilai Nisab (85 gram emas terkini)
  → Jika total_assets >= Nisab:
    → Catat nisab_reached_at (jika belum)
    → Hitung haul_due_at = nisab_reached_at + 1 tahun Hijriah
    → Jika NOW() >= haul_due_at:
      → zakat_amount = total_assets × 2.5%
      → Kirim notifikasi ke dashboard
```

---

## 5. Row Level Security (RLS) Policy

```sql
-- Semua tabel dilindungi RLS: setiap warung hanya bisa akses datanya sendiri

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warung_own_data" ON transactions
  USING (warung_id = auth.uid());

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warung_own_journals" ON journal_entries
  USING (warung_id = auth.uid());

-- Pola yang sama diterapkan pada: inventory, receivables, zakat_tracker, sedekah_fund
```

---

## 6. Non-Functional Architecture

| Aspek | Target | Mekanisme |
|---|---|---|
| **Uptime** | ≥ 99% per bulan | Vercel SLA |
| **Load Time** | ≤ 3 detik (4G) | Next.js SSG/SSR + CDN |
| **API Response** | < 500ms | Supabase edge functions |
| **OCR Response** | < 10 detik | Google Cloud Vision API |
| **Skalabilitas** | Auto-scaling | Vercel + Supabase |
| **Enkripsi** | At-rest & in-transit | Supabase built-in + HTTPS |

---

*Architecture.md — Warung Pintar Syariah v1.0*
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
# 🛠️ Dev_Guide.md — Warung Pintar Syariah

> Panduan lengkap untuk developer dalam melakukan setup, pengembangan, testing, dan deployment platform Warpin.

---

## 1. Prasyarat (Prerequisites)

Pastikan tools berikut sudah terinstal di sistem kamu:

| Tool | Versi Minimum | Kegunaan |
|---|---|---|
| Node.js | v18.x atau lebih baru | Runtime JavaScript |
| npm / yarn / pnpm | Terbaru | Package manager |
| Git | Terbaru | Version control |
| Browser modern | Chrome / Firefox / Safari terbaru | Testing UI dan WebRTC |

**Akun yang diperlukan:**
- Akun [Supabase](https://supabase.com) (gratis untuk development)
- Akun [Vercel](https://vercel.com) (gratis untuk deployment)
- Akun [Google Cloud Platform](https://cloud.google.com) dengan Vision API & Speech-to-Text API aktif

---

## 2. Setup Proyek (Local Development)

### 2.1 Clone Repository

```bash
git clone https://github.com/<username>/warung-pintar-syariah.git
cd warung-pintar-syariah
```

### 2.2 Instalasi Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 2.3 Konfigurasi Environment Variables

Buat file `.env.local` di root proyek:

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# ============================================
# GOOGLE CLOUD API KEYS
# ============================================
GOOGLE_CLOUD_VISION_API_KEY=<your-vision-api-key>
GOOGLE_SPEECH_TO_TEXT_API_KEY=<your-stt-api-key>

# ============================================
# AI LANGUAGE MODEL (untuk Warpin AI Chat)
# ============================================
AI_API_KEY=<your-ai-provider-api-key>
AI_MODEL_NAME=<model-name>

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Warung Pintar Syariah
```

> ⚠️ **JANGAN** commit file `.env.local` ke repository. Pastikan sudah ada di `.gitignore`.

### 2.4 Setup Database Supabase

**Langkah 1: Buat Project Supabase**
1. Login ke [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Catat `Project URL` dan `Anon Key`

**Langkah 2: Jalankan SQL Schema**

Buka **SQL Editor** di Supabase dashboard, lalu jalankan script berikut secara berurutan:

```sql
-- 1. Buat tabel warung_profiles
CREATE TABLE warung_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name    VARCHAR(255) NOT NULL,
  warung_name   VARCHAR(255) NOT NULL,
  phone_number  VARCHAR(20) UNIQUE NOT NULL,
  pin_hash      VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Buat tabel transactions
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'purchase', 'receivable', 'payment')),
  description     VARCHAR(500),
  amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  transaction_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted      BOOLEAN DEFAULT FALSE
);

-- 3. Buat tabel journal_entries
CREATE TABLE journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  transaction_id  UUID REFERENCES transactions(id) NOT NULL,
  account_name    VARCHAR(100) NOT NULL,
  account_type    VARCHAR(20) NOT NULL,
  debit_amount    DECIMAL(15, 2) DEFAULT 0,
  credit_amount   DECIMAL(15, 2) DEFAULT 0,
  description     TEXT,
  journal_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Buat tabel inventory
CREATE TABLE inventory (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id   UUID REFERENCES warung_profiles(id) NOT NULL,
  item_name   VARCHAR(255) NOT NULL,
  hpp         DECIMAL(15, 2) NOT NULL,
  quantity    INTEGER DEFAULT 0,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Buat tabel receivables (piutang bon)
CREATE TABLE receivables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id       UUID REFERENCES warung_profiles(id) NOT NULL,
  customer_name   VARCHAR(255) NOT NULL,
  amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  bon_date        DATE NOT NULL,
  due_date        DATE,
  status          VARCHAR(20) DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'paid')),
  paid_at         TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Buat tabel zakat_tracker
CREATE TABLE zakat_tracker (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id         UUID REFERENCES warung_profiles(id) UNIQUE NOT NULL,
  total_assets      DECIMAL(15, 2) DEFAULT 0,
  nisab_reached_at  TIMESTAMP WITH TIME ZONE,
  haul_due_at       TIMESTAMP WITH TIME ZONE,
  zakat_amount      DECIMAL(15, 2) DEFAULT 0,
  notified          BOOLEAN DEFAULT FALSE,
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Buat tabel sedekah_fund
CREATE TABLE sedekah_fund (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warung_id   UUID REFERENCES warung_profiles(id) NOT NULL,
  amount      DECIMAL(15, 2) NOT NULL,
  source      TEXT,
  fund_date   DATE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Langkah 3: Setup Row Level Security (RLS)**

```sql
-- Enable RLS pada semua tabel
ALTER TABLE warung_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedekah_fund ENABLE ROW LEVEL SECURITY;

-- Policy: setiap warung hanya bisa akses datanya sendiri
CREATE POLICY "own_data" ON transactions FOR ALL USING (warung_id = auth.uid());
CREATE POLICY "own_data" ON journal_entries FOR ALL USING (warung_id = auth.uid());
CREATE POLICY "own_data" ON inventory FOR ALL USING (warung_id = auth.uid());
CREATE POLICY "own_data" ON receivables FOR ALL USING (warung_id = auth.uid());
CREATE POLICY "own_data" ON zakat_tracker FOR ALL USING (warung_id = auth.uid());
CREATE POLICY "own_data" ON sedekah_fund FOR ALL USING (warung_id = auth.uid());
```

**Langkah 4: Setup Trigger Auto-Journaling**

```sql
-- Function: auto jurnal untuk transaksi penjualan
CREATE OR REPLACE FUNCTION auto_journal_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'sale' THEN
    -- Debit: Kas Warung
    INSERT INTO journal_entries (warung_id, transaction_id, account_name, account_type, debit_amount, credit_amount, journal_date)
    VALUES (NEW.warung_id, NEW.id, 'Kas Warung', 'asset', NEW.amount, 0, CURRENT_DATE);
    -- Kredit: Pendapatan Penjualan
    INSERT INTO journal_entries (warung_id, transaction_id, account_name, account_type, debit_amount, credit_amount, journal_date)
    VALUES (NEW.warung_id, NEW.id, 'Pendapatan Penjualan', 'revenue', 0, NEW.amount, CURRENT_DATE);

  ELSIF NEW.type = 'purchase' THEN
    -- Debit: Persediaan Barang
    INSERT INTO journal_entries (warung_id, transaction_id, account_name, account_type, debit_amount, credit_amount, journal_date)
    VALUES (NEW.warung_id, NEW.id, 'Persediaan Barang', 'asset', NEW.amount, 0, CURRENT_DATE);
    -- Kredit: Kas Warung
    INSERT INTO journal_entries (warung_id, transaction_id, account_name, account_type, debit_amount, credit_amount, journal_date)
    VALUES (NEW.warung_id, NEW.id, 'Kas Warung', 'asset', 0, NEW.amount, CURRENT_DATE);

  ELSIF NEW.type = 'receivable' THEN
    -- Debit: Piutang Bon
    INSERT INTO journal_entries (warung_id, transaction_id, account_name, account_type, debit_amount, credit_amount, journal_date)
    VALUES (NEW.warung_id, NEW.id, 'Piutang Bon', 'asset', NEW.amount, 0, CURRENT_DATE);
    -- Kredit: Pendapatan Penjualan
    INSERT INTO journal_entries (warung_id, transaction_id, account_name, account_type, debit_amount, credit_amount, journal_date)
    VALUES (NEW.warung_id, NEW.id, 'Pendapatan Penjualan', 'revenue', 0, NEW.amount, CURRENT_DATE);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger ke tabel transactions
CREATE TRIGGER trigger_auto_journal
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION auto_journal_on_transaction();
```

### 2.5 Jalankan Development Server

```bash
npm run dev
# Buka browser: http://localhost:3000
```

---

## 3. Struktur Proyek

```
warung-pintar-syariah/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx        # Halaman login HP + PIN
│   │   └── register/page.tsx     # Pendaftaran warung baru
│   ├── (dashboard)/
│   │   ├── page.tsx              # Dashboard beranda (home)
│   │   ├── catat-jual/page.tsx   # Modul Catat Jual
│   │   ├── tambah-stok/page.tsx  # Modul Tambah Stok
│   │   ├── scan-nota/page.tsx    # Modul Scan Nota (OCR)
│   │   ├── catat-bon/page.tsx    # Modul Catat Bon
│   │   ├── laporan/page.tsx      # Laporan Keuangan
│   │   ├── neraca/page.tsx       # Neraca Warung
│   │   └── warpin-ai/page.tsx    # Warpin AI Assistant
│   └── layout.tsx
├── components/
│   ├── ui/                       # Komponen UI dasar (TailwindCSS)
│   ├── dashboard/                # Widget dashboard
│   ├── forms/                    # Form-form transaksi
│   ├── ai/                       # Komponen AI (voice, chat)
│   └── charts/                   # Grafik laporan
├── lib/
│   ├── supabase/                 # Supabase client & helpers
│   ├── google-vision/            # Google Vision API wrapper
│   ├── google-speech/            # Google Speech-to-Text wrapper
│   ├── zakat/                    # Logika kalkulasi zakat
│   └── utils/                   # Helper functions
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── public/                       # Aset statis
├── .env.local                    # Environment variables (jangan di-commit!)
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 4. Panduan Pengembangan per Modul

### 4.1 Modul Catat Jual

**File:** `app/(dashboard)/catat-jual/page.tsx`

Field yang wajib ada:
- `description` — nama barang/keterangan (text input)
- `amount` — nominal penjualan (number input, hanya angka positif)
- `transaction_at` — otomatis dari `new Date()`

Setelah submit → insert ke tabel `transactions` dengan `type = 'sale'` → trigger auto-jurnal berjalan otomatis.

### 4.2 Modul Scan Nota (OCR)

**File:** `app/(dashboard)/scan-nota/page.tsx`

```typescript
// Contoh integrasi Google Cloud Vision API
async function processOCR(imageBase64: string) {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 })
  });
  const data = await response.json();
  return data.parsedItems; // [{ item_name, hpp, quantity }]
}
```

**API Route:** `app/api/ocr/route.ts` — jangan expose API key di sisi klien!

### 4.3 Warpin AI (Voice)

**File:** `app/(dashboard)/warpin-ai/page.tsx`

```typescript
// Contoh implementasi Web Speech API (native browser)
const recognition = new window.webkitSpeechRecognition();
recognition.lang = 'id-ID';
recognition.continuous = false;
recognition.interimResults = true;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  parseAndConfirmTransaction(transcript);
};

recognition.start();
```

---

## 5. Testing

### 5.1 Unit Testing

```bash
npm run test
```

Fokus unit test pada:
- Logika double-entry: `SUM(debit) === SUM(credit)` per transaksi
- Kalkulasi zakat: nisab check, haul calculation, 2.5%
- Validasi form: nominal > 0, no interest pada receivables
- OCR parser: ekstraksi nama barang, harga, kuantitas

### 5.2 End-to-End Testing

```bash
npm run test:e2e
```

Skenario E2E wajib:
- [ ] Registrasi warung baru dengan nomor HP
- [ ] Login dengan PIN 6 digit
- [ ] Catat Jual → cek jurnal otomatis terbentuk
- [ ] Tambah Stok → cek inventory terupdate
- [ ] Scan Nota → upload foto dummy → cek hasil parsing
- [ ] Catat Bon → pastikan tidak ada bunga
- [ ] Pelunasan Bon → cek status berubah ke 'paid'
- [ ] Dashboard → cek saldo, piutang, transaksi terakhir
- [ ] Laporan → filter harian/mingguan/bulanan

---

## 6. Deployment ke Vercel

### 6.1 Setup Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy ke production
vercel --prod
```

### 6.2 Environment Variables di Vercel

Tambahkan semua variabel dari `.env.local` ke Vercel Dashboard:
`Settings → Environment Variables`

### 6.3 Konfigurasi CI/CD

Hubungkan repository GitHub ke Vercel:
1. Vercel Dashboard → "New Project"
2. Import GitHub repository
3. Set environment variables
4. Setiap push ke `main` → auto-deploy ke production
5. Setiap pull request → auto-deploy ke preview URL

---

## 7. Panduan Kontribusi

### 7.1 Branching Strategy

```
main          → production (protected)
develop       → staging / integration
feature/*     → fitur baru (dari develop)
fix/*         → bugfix (dari develop)
hotfix/*      → critical fix (dari main)
```

### 7.2 Commit Convention

```
feat: tambah modul scan nota OCR
fix: perbaiki kalkulasi zakat untuk piutang
refactor: restrukturisasi auto-journal trigger
docs: update README dengan setup instructions
test: tambah unit test untuk double-entry validation
```

### 7.3 Code Review Checklist

- [ ] Tidak ada API key yang ter-expose di sisi klien
- [ ] RLS policy diuji — akses lintas warung harus ditolak
- [ ] `interest = 0` selalu untuk tabel receivables
- [ ] Dana sedekah tidak masuk ke Pendapatan atau Modal
- [ ] Double-entry seimbang (`debit = kredit`) di semua skenario transaksi
- [ ] Soft delete only — tidak ada hard delete pada data keuangan

---

## 8. Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Kamera tidak aktif | Browser tidak support WebRTC | Gunakan Chrome/Firefox terbaru; pastikan HTTPS |
| OCR tidak akurat | Struk buram atau terhalang | Tambahkan panduan foto di UI; fallback manual selalu tersedia |
| Auto-jurnal tidak terbentuk | Trigger belum terpasang | Jalankan ulang SQL trigger di Supabase SQL Editor |
| Login gagal terus | PIN salah hash | Pastikan bcrypt digunakan; cek `SUPABASE_SERVICE_ROLE_KEY` |
| RLS blocking query | Policy salah | Cek `warung_id = auth.uid()` di setiap policy |
| API timeout | Koneksi lemah | Implementasikan retry logic + tampilkan form manual |

---

*Dev_Guide.md — Warung Pintar Syariah v1.0*
# 🔐 Security.md — Warung Pintar Syariah

> Dokumen keamanan sistem Warpin, mencakup model ancaman, mekanisme perlindungan data, autentikasi, enkripsi, audit trail, dan panduan keamanan untuk developer.

---

## 1. Prinsip Keamanan Utama

Warpin menganut prinsip **"Security by Design"** — keamanan bukan tambahan di akhir, melainkan bagian dari setiap keputusan arsitektur dan pengembangan.

| Prinsip | Deskripsi |
|---|---|
| **Defense in Depth** | Berlapis: HTTPS → Auth → RLS → Enkripsi |
| **Least Privilege** | Setiap pengguna hanya akses data miliknya sendiri (RLS) |
| **Zero Trust** | Tidak ada request yang dipercaya tanpa verifikasi |
| **Data Minimization** | Hanya kumpulkan data yang benar-benar dibutuhkan |
| **Soft Delete Only** | Data keuangan tidak pernah dihapus permanen |

---

## 2. Model Ancaman (Threat Model)

### 2.1 Aset yang Dilindungi

| Aset | Tingkat Sensitivitas | Keterangan |
|---|---|---|
| Data transaksi keuangan warung | 🔴 Sangat Tinggi | Inti bisnis pengguna |
| PIN pengguna | 🔴 Sangat Tinggi | Akses ke akun |
| Data piutang pelanggan | 🔴 Tinggi | Informasi personal pelanggan warung |
| Nomor HP pemilik warung | 🟠 Tinggi | PII (Personally Identifiable Information) |
| Data inventori & HPP | 🟡 Sedang | Informasi bisnis |

### 2.2 Ancaman Potensial

| ID | Ancaman | Vektor | Tingkat Risiko | Mitigasi |
|---|---|---|---|---|
| T-01 | Kebocoran PIN | Brute force, phishing | 🔴 Tinggi | bcrypt hashing, rate limiting login |
| T-02 | Akses lintas warung | IDOR (Insecure Direct Object Reference) | 🔴 Tinggi | Row Level Security (RLS) |
| T-03 | Man-in-the-middle | Intersepsi HTTP | 🔴 Tinggi | HTTPS/TLS wajib di semua komunikasi |
| T-04 | SQL Injection | Input tidak tervalidasi | 🟠 Sedang | Supabase parameterized queries |
| T-05 | API key exposure | Hardcode di frontend | 🔴 Tinggi | Semua API call via server-side routes |
| T-06 | Session hijacking | Cookie theft, XSS | 🟠 Sedang | Supabase Auth session management |
| T-07 | Data manipulation | Modifikasi jurnal setelah tersimpan | 🔴 Tinggi | Soft delete only + audit trail |
| T-08 | Oversharing data | User A lihat data User B | 🔴 Tinggi | RLS policy ketat |

---

## 3. Autentikasi & Otorisasi

### 3.1 Sistem Login

**Metode:** Nomor HP + PIN 6 Digit

Keputusan desain ini dibuat karena target pengguna (pemilik warung) lebih familiar dengan nomor HP daripada email/username.

| Aspek | Spesifikasi |
|---|---|
| **Identifier** | Nomor HP (unik per warung) |
| **Credential** | PIN 6 digit |
| **Hashing** | bcrypt (cost factor ≥ 12) |
| **Session** | Managed by Supabase Auth (JWT) |
| **Token Expiry** | Sesuai konfigurasi Supabase (default: 1 jam, refresh token aktif) |

### 3.2 Penyimpanan PIN

```
❌ DILARANG: Menyimpan PIN dalam plaintext
❌ DILARANG: Menyimpan PIN dalam MD5 atau SHA1
✅ WAJIB: bcrypt dengan salt rounds ≥ 12

Implementasi:
const bcrypt = require('bcrypt');
const saltRounds = 12;
const pinHash = await bcrypt.hash(userPin, saltRounds);
// Simpan pinHash ke kolom pin_hash di warung_profiles
```

### 3.3 Validasi PIN saat Login

```typescript
// Server-side validation — JANGAN lakukan ini di sisi klien!
const isValid = await bcrypt.compare(inputPin, storedPinHash);
if (!isValid) {
  // Log attempt gagal
  // Increment failed_attempts counter
  throw new Error('PIN salah');
}
```

### 3.4 Rate Limiting Login

| Kondisi | Tindakan |
|---|---|
| 3x PIN salah dalam 5 menit | Tampilkan peringatan + cooldown 1 menit |
| 5x PIN salah dalam 10 menit | Kunci akun sementara 15 menit |
| 10x PIN salah dalam 1 jam | Notifikasi ke nomor HP pemilik |

### 3.5 Otorisasi — Row Level Security (RLS)

Setiap request data divalidasi di level database. Pengguna A tidak dapat mengakses data Pengguna B meskipun menggunakan token valid.

```sql
-- Semua tabel menggunakan pola policy yang sama:
CREATE POLICY "warung_own_data_only" ON [table_name]
  FOR ALL
  USING (warung_id = auth.uid())
  WITH CHECK (warung_id = auth.uid());
```

---

## 4. Enkripsi Data

### 4.1 Enkripsi In-Transit

| Layer | Mekanisme | Standar |
|---|---|---|
| Browser ↔ Vercel | HTTPS/TLS 1.3 | Otomatis via Vercel |
| Vercel ↔ Supabase | HTTPS/TLS 1.3 | Otomatis |
| Supabase ↔ Google APIs | HTTPS/TLS 1.3 | Otomatis |

**NFR-05:** Semua komunikasi menggunakan HTTPS/TLS. Tidak ada exception — aplikasi tidak boleh berjalan di HTTP di environment manapun kecuali localhost.

### 4.2 Enkripsi At-Rest

| Data | Mekanisme |
|---|---|
| Database PostgreSQL | Enkripsi at-rest oleh Supabase (AES-256) |
| PIN pengguna | bcrypt hash — tidak dapat di-decrypt |
| File/media (jika ada) | Supabase Storage encryption |

### 4.3 API Key Protection

```
❌ DILARANG: Meletakkan API key di file frontend (.js, .tsx, .jsx)
❌ DILARANG: Meletakkan API key di environment variable NEXT_PUBLIC_*
✅ WAJIB: Semua API call ke Google Vision & Speech → lewat server-side API routes
✅ WAJIB: API key hanya ada di server-side environment variables

Contoh struktur aman:
// app/api/ocr/route.ts (SERVER SIDE — aman)
const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY; // tidak di-expose ke browser
```

---

## 5. Keamanan Data Keuangan

### 5.1 Audit Trail (NFR-08)

Seluruh data transaksi keuangan memiliki audit trail yang tidak dapat dimodifikasi.

| Aturan | Implementasi |
|---|---|
| **Tidak ada hard delete** | `is_deleted = TRUE` (soft delete) untuk semua data keuangan |
| **Immutable journals** | Entri jurnal tidak dapat diupdate setelah dibuat — hanya insert |
| **Timestamp otomatis** | `created_at` di semua tabel menggunakan `DEFAULT NOW()` |
| **User ID tersimpan** | `warung_id` selalu dicatat di setiap transaksi |

### 5.2 Validasi Integritas Data

```sql
-- Constraint: nomor tidak bisa negatif
ALTER TABLE transactions ADD CONSTRAINT positive_amount CHECK (amount > 0);
ALTER TABLE receivables ADD CONSTRAINT positive_receivable CHECK (amount > 0);

-- Constraint: inventory tidak minus
ALTER TABLE inventory ADD CONSTRAINT non_negative_qty CHECK (quantity >= 0);
```

### 5.3 Proteksi Dana Sedekah

```sql
-- Trigger: Dana sedekah TIDAK BOLEH masuk ke jurnal sebagai Pendapatan
CREATE OR REPLACE FUNCTION validate_sedekah_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_name IN ('Pendapatan Penjualan', 'Modal Warung') 
     AND EXISTS (SELECT 1 FROM sedekah_fund WHERE id = NEW.transaction_id) THEN
    RAISE EXCEPTION 'Dana sedekah tidak boleh dicatat sebagai Pendapatan atau Modal!';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Keamanan Aplikasi (AppSec)

### 6.1 Input Validation

| Input | Validasi |
|---|---|
| Nomor HP | Format Indonesia: `^08[0-9]{8,11}$` |
| PIN | Tepat 6 digit: `^[0-9]{6}$` |
| Nominal transaksi | Numerik positif, max 15 digit |
| Nama barang/pelanggan | Max 255 karakter, sanitasi XSS |
| File OCR | Hanya JPEG/PNG, max 10MB |

### 6.2 Pencegahan Injection

| Ancaman | Pencegahan |
|---|---|
| SQL Injection | Supabase menggunakan parameterized queries secara default |
| XSS | Next.js auto-escape output; sanitasi semua input pengguna |
| CSRF | Supabase Auth menggunakan token-based auth (bukan cookie session tradisional) |

### 6.3 Security Headers (Next.js)

Tambahkan di `next.config.js`:

```javascript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=self, microphone=self' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  }
];
```

---

## 7. Keamanan Fitur AI & Kamera

### 7.1 WebRTC Kamera (Scan Nota & Voice)

| Aspek | Implementasi |
|---|---|
| Izin kamera/mikrofon | Hanya diminta saat user aktif menggunakan fitur |
| Data gambar | Diproses di sisi server — tidak disimpan permanen |
| Audio recording | Tidak disimpan — hanya dikirim ke Speech-to-Text API |
| Fallback | Form manual selalu tersedia jika kamera/mikrofon ditolak |

### 7.2 Google APIs Security

```
✅ API key disimpan server-side only
✅ Request ke Google APIs melalui Next.js API routes (server)
✅ Rate limiting pada endpoint OCR dan Speech-to-Text
✅ Monitoring penggunaan API untuk deteksi anomali
```

---

## 8. Monitoring & Incident Response

### 8.1 Log yang Harus Dimonitor

| Event | Tingkat | Tindakan |
|---|---|---|
| Login gagal berulang (≥5x) | 🔴 Tinggi | Alert + kunci sementara |
| Akses lintas warung dicegah RLS | 🔴 Tinggi | Investigasi segera |
| API key usage anomali | 🟠 Sedang | Review & rotate key |
| Error double-entry tidak seimbang | 🔴 Tinggi | Freeze transaksi + audit |
| Upload file OCR ukuran aneh | 🟡 Rendah | Log untuk review |

### 8.2 Checklist Audit Keamanan Berkala

- [ ] Review log login gagal setiap minggu
- [ ] Audit RLS policy setiap sprint
- [ ] Rotate API keys Google Cloud setiap 90 hari
- [ ] Scan dependency vulnerabilities: `npm audit`
- [ ] Review akses Supabase service role key — minimal exposure
- [ ] Backup database dan verifikasi restore procedure setiap bulan

---

## 9. Panduan Keamanan untuk Developer

### DO ✅

- Selalu gunakan Supabase client yang sudah dikonfigurasi dengan RLS
- Validasi semua input di sisi server (API routes)
- Gunakan `bcrypt` dengan `saltRounds >= 12` untuk PIN
- Simpan semua secret di environment variables server-side
- Gunakan soft delete (`is_deleted = true`) untuk semua data keuangan
- Test RLS: pastikan akses lintas warung selalu ditolak

### DON'T ❌

- Jangan expose API key di sisi klien atau `NEXT_PUBLIC_*`
- Jangan hardcode credentials atau secret apapun di kode
- Jangan simpan PIN dalam plaintext atau hash lemah (MD5, SHA1)
- Jangan lakukan hard delete pada data transaksi atau jurnal
- Jangan bypass RLS menggunakan service role key di sisi klien
- Jangan simpan foto struk atau audio voice secara permanen

---

## 10. Compliance Keamanan

| Standar | Status | Keterangan |
|---|---|---|
| HTTPS everywhere | ✅ Wajib | Vercel auto-TLS |
| Enkripsi at-rest | ✅ Wajib | Supabase built-in |
| PIN tidak plaintext | ✅ Wajib | bcrypt hashing |
| Data isolation per warung | ✅ Wajib | Row Level Security |
| Audit trail immutable | ✅ Wajib | Soft delete only |
| API key server-side only | ✅ Wajib | Next.js API routes |

---

*Security.md — Warung Pintar Syariah v1.0*
*Dokumen ini harus direview oleh tim keamanan sebelum go-live produksi.*
