# 🤖 Panduan Fitur AI Verifikasi Dokumen Checklist

## Apa Ini?

Fitur baru yang menggunakan **Google Gemini AI** untuk **memverifikasi dokumen secara otomatis** pada checklist operasi. Saat berkas diunggah untuk sebuah item checklist, AI akan menganalisis dokumen tersebut dan menentukan apakah sudah sesuai kriteria atau belum.

### Hasil Otomatis dari AI:
- ✅ **Verified** → Dokumen sesuai kriteria (nama jelas, nomor identitas terbaca, dll)
- ❌ **Rejected** → Dokumen tidak sesuai + alasan penolakan dari AI

---

## Cara Kerja (Alur Singkat)

```
User Upload Dokumen
        ↓
File Tersimpan di Server
        ↓
Background Job Otomatis Jalan
        ↓
Dokumen Dikirim ke Google Gemini AI
        ↓
AI Menganalisis Dokumen
        ↓
Status Checklist Auto-Update (Verified / Rejected)
        ↓
Alasan AI Tersimpan di Database
```

---

## Setup Awal (Wajib Dilakukan Sekali)

### 1. Pull Branch Terbaru
```bash
git pull origin feature/role-testing
```

### 2. Install Dependencies & Migrasi Database
```bash
composer install
npm install
php artisan migrate
```

### 3. Isi API Key Gemini di `.env`
Buka file `.env`, cari bagian paling bawah, isi:
```env
GEMINI_API_KEY=isi_api_key_gemini_kamu_disini
```

> 💡 **Cara Dapat API Key Gemini (Gratis):**
> 1. Buka https://aistudio.google.com/app/apikey
> 2. Login dengan akun Gmail pribadi
> 3. Klik "Create API key" → "Create API key in new project"
> 4. Copy kunci yang muncul dan paste ke `.env`

### 4. Build Frontend
```bash
npm run build
```

---

## Integrasi ke Fitur Upload (Untuk Developer Upload)

Setelah setup selesai, tambahkan **1 baris kode** di controller upload kamu.

Tepat **SETELAH** file berhasil disimpan dan `attachment_path` di-update, tambahkan:

```php
\App\Jobs\VerifyChecklistDocumentJob::dispatch($item);
```

### Contoh Penerapan:
```php
// Kode upload kamu yang sudah ada
$path = $file->store('checklists/attachments', 'public');
$item->update([
    'attachment_path' => $path,
    'status' => 'In Progress',
]);

// === TAMBAHKAN BARIS INI ===
\App\Jobs\VerifyChecklistDocumentJob::dispatch($item);
// ============================
```

> ⚠️ **Penting:** Variabel `$item` harus bertipe `App\Models\OperationChecklistItem`.

---

## Menjalankan Queue Worker

Agar background job AI bisa berjalan, **queue worker harus aktif**. Buka terminal terpisah dan jalankan:

```bash
php artisan queue:work
```

> 💡 Biarkan terminal ini tetap terbuka selama development. Queue worker ini yang memproses verifikasi AI di belakang layar.

---

## Testing Manual (Tanpa UI Upload)

Tersedia Artisan Command untuk testing tanpa perlu klik-klik di website:

### Langkah Testing:

#### 1. Siapkan File Test
Taruh file gambar/PDF ke folder:
```
storage/app/public/checklists/attachments/
```
Contoh: copy foto KTP dan rename jadi `test_dokumen.jpg`

#### 2. Update Database
Buka phpMyAdmin → tabel `operation_checklist_items` → Edit salah satu item:
- Set `attachment_path` = `checklists/attachments/test_dokumen.jpg`
- Set `status` = `In Progress`

#### 3. Jalankan Command
```bash
# Test langsung (sinkron, hasil langsung kelihatan)
php artisan test:ai-verify {ID_ITEM} --sync

# Contoh:
php artisan test:ai-verify 1 --sync
```

#### 4. Lihat Hasil
Buka phpMyAdmin → tabel `operation_checklist_items`:
- Kolom `status` → Berubah jadi `Verified` atau `Rejected`
- Kolom `ai_validation_result` → Alasan dari AI

---

## Prompt AI yang Sudah Dikonfigurasi

Setiap jenis checklist punya instruksi berbeda untuk AI. Prompt disimpan di kolom `ai_validation_prompt` pada tabel `checklist_template_items`:

| Item Checklist | Kriteria yang Dicek AI |
|---|---|
| **Identifikasi Profil** | Dokumen identitas resmi (KTP/Paspor/SIM), nama lengkap terbaca, nomor identitas ada, foto wajah jelas |
| **Cek Status Red Notice** | Referensi nomor Red Notice/Interpol, nama subjek, berasal dari instansi resmi |
| **Koordinasi Negara Asal** | Kop surat instansi jelas, referensi nama/nomor kasus, ada tanda tangan/stempel |

> 💡 Prompt bisa diubah langsung via phpMyAdmin di tabel `checklist_template_items` kolom `ai_validation_prompt`.

---

## Skenario Testing

| Skenario | File yang Dipakai | Hasil yang Diharapkan |
|---|---|---|
| Foto formal biasa | Pasfoto 3x4 | ❌ Rejected — bukan dokumen identitas |
| KTP asli | Scan/foto KTP | ✅ Verified — dokumen identitas valid |
| Paspor | Scan halaman depan paspor | ✅ Verified — ada nomor & nama |
| Dokumen random | Surat undangan rapat | ❌ Rejected — bukan dokumen identitas |
| File buram | Foto blur/gelap | ❌ Rejected — tidak terbaca jelas |

---

## Struktur File Baru

```
app/
├── Console/Commands/
│   └── TestAiVerify.php              ← Command testing manual
├── Jobs/
│   └── VerifyChecklistDocumentJob.php ← Background job verifikasi AI
└── Services/
    └── GeminiVerificationService.php  ← Core service komunikasi ke Gemini API

config/
└── services.php                       ← Ditambah konfigurasi Gemini

database/migrations/
└── 2026_08_24_..._add_ai_validation_columns_to_checklist_tables.php
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Error `GEMINI_API_KEY belum diatur` | Isi `GEMINI_API_KEY` di file `.env` |
| Error `HTTP 401` | API Key salah atau belum aktif. Buat ulang di https://aistudio.google.com/app/apikey |
| Error `HTTP 404 model not found` | Jalankan `php artisan config:clear` untuk refresh konfigurasi |
| Status tidak berubah setelah upload | Pastikan `php artisan queue:work` sedang berjalan di terminal terpisah |
| File tidak ditemukan | Pastikan file ada di `storage/app/public/` dan `attachment_path` benar |

---

## Kontak

Kalau ada pertanyaan atau error, hubungi **Ivander** 😄
