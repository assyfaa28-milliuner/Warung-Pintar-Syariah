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
