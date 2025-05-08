# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]
### Added
- Struktur folder untuk MVC: `controllers`, `models`, `routes`, `middleware`.
- Rute dasar `/api/users` dengan metode GET dan POST.
- Middleware bawaan (CORS, JSON parser, logger dengan Morgan).
- Penanganan error global (error handler middleware).

---

## [1.0.0] - 2025-04-08
### Added
- Inisiasi project Node.js dengan Express.js.
- Setup folder structure mirip Laravel.
- File starter:
  - `server.js` untuk booting server
  - `app.js` untuk konfigurasi middleware dan routing
  - `routes/api.js` sebagai entry point untuk API
  - `controllers/UserController.js` dengan endpoint sederhana
- File `.env` dan konfigurasi dotenv.
- `package.json` dengan script dev (`npm run dev`) menggunakan `nodemon`.

---

## [1.1.0] - 2025-04-22
### Added
- CLI untuk generate template helper berdasarkan kategori (`utils index`).
- Struktur folder helper berbasis kategori (contoh: `dateHelper`, `stringHelper`, dll).
- File `utils/index.js` untuk centralized exports semua helper.
- Script CLI `generate:helper` di dalam `package.json`.

### Feature
- **Order**
  - method: GET | `/orders` => mendapatkan kumpulan data order
  - method: GET | `/orders/:orderId` => mendapatkan data order berdasarkan nomor INV
- **Pending**
  - method: GET | `/pendings` => mendapatkan kumpulan data pending

## [1.1.1] - 2025-05-07
### Added
- Penambahan fungsi stringHelper dan databaseHelper di `utils/index.js`.
- **stringHelper**
 - `parseCamelJsonColumn()` => Fungsi parsing data dari kolom table bertipe JSON.
- **databaseHelper**
 - `extractByPrefix()` => Fungsi untuk ekstraksi data setiap kolom dari sebuah database menjadi response JSON.
 - `generateSelectAlias()` => Fungsi untuk generate alias otomatis dari selected column ke query builder.
 - `transformJoinedRow()` => Mengubah baris hasil join menjadi objek nested berdasarkan prefix.
 - `isPrefixed()` => Cek apakah field mengandung prefix dari relasi tertentu.

### Changed
- Flagging tipe data array untuk fungsi `toCamelCaseKeys` di `stringHelper`.
- Pergantian format tahun menjadi **YYYY** untuk tahun di `dateHelper`.
- Penyesuaian pemakaian helper di `OrderController`
- Perubahan response error untuk fitur User

## [1.2.0] - 2025-05-07
## Added
- **stringHelper**
  - `pickAndRename()` => Generate manual alias untuk response data kolom yang diambil dari sebuah table
  - `formatRelatedUser()` => Untuk format firstName dan lastName dari data table

## Changed
- Perubahan logika pengecekan `parseCamelJsonColumn` untuk data berbentuk array
- Penambahan endpoint pending, product dan warehouse di `api.js`

## Feature
- **Pending**
  - method: GET | `/pendings/:bookingId` => mendapatkan data pending berdasarkan nomor booking
- **Product**
  - method: GET | `/products` => mendapatkan kumpulan data produk
  - method: GET | `/products/:id` => mendapatkan data produk berdasarkan id produk
- **Warehouse**
  - method: GET | `/warehouses` => mendapatkan kumpulan data gudang
  - method: GET | `/warehouses/:id` => mendapatkan data gudang berdasarkan id gudang