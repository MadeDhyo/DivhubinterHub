# Bagian 4: Data dan Teknologi (Tugas Rayhan)

Berdasarkan konteks sistem operasional (OCMS - Operation & Checklist Management System) untuk NCB Interpol dan file `.env` yang diberikan, berikut adalah rincian untuk bagian yang ditugaskan kepada Anda:

## 16. Struktur Data Awal
Berikut adalah rancangan awal struktur tabel (Database: `ocms_db`) untuk mendukung kebutuhan Operation, Checklist, Readiness, dan Document Management:

1. **`users`**
   - `id` (PK)
   - `name`
   - `email`
   - `password`
   - `role_id` (FK)
   - `last_login_ip`
   - `created_at`, `updated_at`

2. **`roles` & `permissions`**
   - Mendefinisikan akses, misalnya: Pimpinan, Admin, Operator.
   - Tabel: `roles` (id, name), `permissions` (id, name), dan pivot `role_permission`.

3. **`operations`** (Manajemen Operasi)
   - `id` (PK)
   - `title`
   - `description`
   - `status` (Draft, Ongoing, Completed)
   - `start_date`
   - `end_date`
   - `created_by` (FK -> users)
   - `created_at`, `updated_at`

4. **`checklists` & `checklist_items`** (Checklist Engine)
   - `checklists`: `id`, `operation_id`, `name`, `status`
   - `checklist_items`: `id`, `checklist_id`, `task_description`, `is_checked`, `checked_by`, `checked_at`

5. **`readiness_scores`** (Skoring Kesiapan)
   - `id` (PK)
   - `operation_id` (FK)
   - `score_value` (Integer/Decimal)
   - `evaluation_notes`
   - `evaluated_by` (FK -> users)
   - `evaluated_at`

6. **`documents`** (Manajemen Dokumen)
   - `id` (PK)
   - `operation_id` (FK)
   - `file_name`
   - `file_path`
   - `document_type`
   - `uploaded_by` (FK)
   - `created_at`, `updated_at`

---

## 17. Teknologi yang Disarankan
Sesuai dengan *environment* yang sudah disiapkan di file `.env` dan arahan dari tim (perintah `php artisan`), berikut teknologi yang disarankan:

- **Backend / Framework Utama**: **Laravel (PHP)**. Pilihan yang sangat tepat dan solid untuk pengembangan sistem web dengan arsitektur MVC.
- **Database**: **MySQL** (sesuai *config* `DB_CONNECTION=mysql` dan DB `ocms_db`).
- **Frontend / Antarmuka**: 
  - **Blade Templating** bawaan Laravel untuk efisiensi di awal.
  - **Vite** (sesuai *config* `VITE_APP_NAME`) untuk *module bundling*.
  - **Tailwind CSS** atau Bootstrap untuk UI/UX yang cepat, responsif, dan rapi.
  - *Opsional*: React/Vue.js (Inertia.js) jika ingin *Dashboard* terasa sangat reaktif seperti *Single Page Application* (SPA).
- **Keamanan (Security)**:
  - **Laravel Sanctum / Breeze** untuk autentikasi dasar.
  - **Custom IP Whitelist Middleware** untuk memfilter akses *Local Area Network* sesuai variabel `ALLOWED_IP_SUBNETS=127.0.0.1,::1,192.168.80.0/24`.
- **Manajemen File/Queue/Cache**: 
  - Sesuai `.env`, menggunakan disk `local` untuk awal pengembangan, Queue/Cache dengan `database`, dan Redis jika *scale-up* dibutuhkan nanti.

---

## 18. MVP (Minimum Viable Product), Tahap 1
Untuk mengejar *deliverable* awal agar produk bisa diuji coba secara fungsi utama, batasan MVP Tahap 1 disarankan fokus pada:

1. **Autentikasi & Role Akses (Basic)**:
   - Login pengguna berhasil.
   - Pengecekan IP Whitelist (Hanya IP LAN / Localhost yang bisa akses).
   - Pembagian *Role* dasar (Admin, Pimpinan, dan Operator).
2. **Dashboard Pimpinan**:
   - Tampilan visual *read-only* atau ringkasan status dari operasi yang sedang berjalan.
3. **Modul Operasi & Checklist (Core)**:
   - CRUD (Create, Read, Update, Delete) data Operasi.
   - Fitur membuat Checklist untuk sebuah Operasi, dan *user* bisa memberikan centang (tandai selesai) pada item tersebut.
4. **Modul Dokumen (Sederhana)**:
   - Kemampuan *upload* dokumen penting (PDF/Word/Excel) ke dalam *storage* internal dan menautkannya dengan data Operasi tertentu.
5. **Readiness Score**:
   - Perhitungan poin kesiapan secara manual/sederhana berdasarkan kelengkapan *checklist* dan dokumen. (Belum melibatkan logika otomasi atau bobot yang sangat kompleks).

*(Tahap 2 dan seterusnya akan fokus ke pengembangan otomatisasi, notifikasi lanjutan, log aktivitas kompleks, dan optimasi performa)*.
