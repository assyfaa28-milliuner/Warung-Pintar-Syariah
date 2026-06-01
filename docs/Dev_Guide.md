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
