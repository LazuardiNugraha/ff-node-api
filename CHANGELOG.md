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
  - method: GET | `pendings` => mendapatkan kumpulan data pending