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
