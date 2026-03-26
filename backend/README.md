<p align="center">
  <h1 align="center">🧘 RuangTenang — Backend API</h1>
  <p align="center">
    REST API backend untuk aplikasi <strong>RuangTenang</strong>, sebuah platform kesehatan mental digital yang membantu mahasiswa mencurahkan perasaannya melalui jurnal dan mendapatkan analisis mood berbasis AI serta rekomendasi artikel yang relevan.
  </p>
</p>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi & Menjalankan Server](#-instalasi--menjalankan-server)
- [Variabel Lingkungan (.env)](#-variabel-lingkungan-env)
- [Dokumentasi API](#-dokumentasi-api)
  - [Autentikasi](#1-autentikasi)
  - [Jurnal](#2-jurnal)
  - [Artikel](#3-artikel)
- [Struktur Proyek](#-struktur-proyek)

---

## 💡 Tentang Proyek

**RuangTenang** adalah backend API yang dirancang untuk mendukung aplikasi kesehatan mental bagi mahasiswa. Fitur utamanya meliputi:

- **Sistem Autentikasi** — Registrasi, login, dan logout dengan token-based authentication (custom bearer token).
- **Jurnal Curhat** — Mahasiswa dapat menulis curahan hati yang kemudian dianalisis secara otomatis oleh **Google Gemini AI** untuk mendeteksi mood/emosi.
- **Rekomendasi Artikel** — Setelah mood terdeteksi, sistem merekomendasikan artikel yang relevan berdasarkan kategori emosi (Burnout, Cemas, Sedih, Netral, Krisis).
- **Manajemen Artikel** — Endpoint publik untuk mengakses dan memfilter artikel berdasarkan kategori mood.

---

## 🛠 Tech Stack

| Teknologi | Versi / Keterangan |
|---|---|
| **PHP** | `^8.1` |
| **Laravel** | `^10.10` |
| **MongoDB** | Database utama (NoSQL) |
| **Laravel MongoDB** | `mongodb/laravel-mongodb: 4.0` |
| **Laravel Sanctum** | `^3.3` (tersedia, namun auth menggunakan custom token) |
| **Google Gemini AI** | API untuk analisis mood pada jurnal curhat |
| **Guzzle HTTP** | `^7.2` — HTTP client untuk komunikasi dengan Gemini API |

---

## 📌 Prasyarat

Pastikan perangkat Anda sudah terinstal:

- **PHP** >= 8.1
- **Composer** (PHP dependency manager)
- **MongoDB** (server harus berjalan)
- **PHP MongoDB Extension** (`ext-mongodb`) — diperlukan oleh `mongodb/laravel-mongodb`
- **Git**

---

## 🚀 Instalasi & Menjalankan Server

### 1. Clone Repository

```bash
git clone https://github.com/Herdy778/RuangTenang.git
cd RuangTenang
```

### 2. Install Dependensi PHP

```bash
composer install
```

### 3. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`, lalu sesuaikan nilainya:

```bash
cp .env.example .env
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Pastikan MongoDB Berjalan

Pastikan service MongoDB sudah aktif di mesin Anda (default port `27017`).

### 6. Jalankan Server Lokal

```bash
php artisan serve
```

Server akan berjalan di `http://127.0.0.1:8000` secara default.

---

## 🔐 Variabel Lingkungan (.env)

Berikut adalah variabel-variabel penting yang perlu dikonfigurasi di file `.env`:

| Variabel | Deskripsi | Contoh Nilai |
|---|---|---|
| `APP_NAME` | Nama aplikasi | `RuangTenang` |
| `APP_ENV` | Environment (local/production) | `local` |
| `APP_KEY` | Key enkripsi aplikasi (di-generate otomatis) | `base64:...` |
| `APP_DEBUG` | Mode debug | `true` |
| `APP_URL` | URL dasar aplikasi | `http://localhost` |
| `DB_CONNECTION` | Driver database | `mongodb` |
| `DB_HOST` | Host database MongoDB | `127.0.0.1` |
| `DB_PORT` | Port database MongoDB | `27017` |
| `DB_DATABASE` | Nama database | `ruangtenang` |
| `DB_USERNAME` | Username database (kosongkan jika lokal) | ` ` |
| `DB_PASSWORD` | Password database (kosongkan jika lokal) | ` ` |
| `GEMINI_API_KEY` | API Key dari Google Gemini AI | `AIzaSy...` |

> **⚠️ Penting:** Variabel `GEMINI_API_KEY` **wajib** diisi agar fitur analisis mood pada jurnal berfungsi dengan benar. Anda bisa mendapatkan API key dari [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 📡 Dokumentasi API

**Base URL:** `http://127.0.0.1:8000/api`

Semua request dan response menggunakan format **JSON**.  
Endpoint yang membutuhkan autentikasi harus menyertakan header:

```
Authorization: Bearer <token>
```

---

### 1. Autentikasi

#### 📝 Register — `POST /api/register`

Mendaftarkan user baru sebagai mahasiswa.

**Request Body:**

```json
{
  "nama_lengkap": "Herdy Handoko",
  "email": "herdy@example.com",
  "password": "rahasia123"
}
```

| Field | Tipe | Validasi |
|---|---|---|
| `nama_lengkap` | `string` | Wajib |
| `email` | `string` | Wajib, format email, unik |
| `password` | `string` | Wajib, minimal 6 karakter |

**Response Sukses (`200`):**

```json
{
  "status": "success",
  "pesan": "Registrasi berhasil!",
  "data": {
    "_id": "665a1b...",
    "nama_lengkap": "Herdy Handoko",
    "email": "herdy@example.com",
    "role": "mahasiswa",
    "updated_at": "2026-03-24T13:50:00.000Z",
    "created_at": "2026-03-24T13:50:00.000Z"
  },
  "token": "a1b2c3d4e5f6...random64chars"
}
```

---

#### 🔑 Login — `POST /api/login`

Login dan mendapatkan token autentikasi.

**Request Body:**

```json
{
  "email": "herdy@example.com",
  "password": "rahasia123"
}
```

| Field | Tipe | Validasi |
|---|---|---|
| `email` | `string` | Wajib, format email |
| `password` | `string` | Wajib |

**Response Sukses (`200`):**

```json
{
  "status": "success",
  "pesan": "Login berhasil!",
  "data": {
    "_id": "665a1b...",
    "nama_lengkap": "Herdy Handoko",
    "email": "herdy@example.com",
    "role": "mahasiswa"
  },
  "token": "a1b2c3d4e5f6...random64chars"
}
```

**Response Gagal (`401`):**

```json
{
  "status": "error",
  "pesan": "Email atau Password salah!"
}
```

---

#### 🚪 Logout — `POST /api/logout`

Logout dan menghapus token sesi saat ini.

> 🔒 **Membutuhkan Autentikasi**

**Headers:**

```
Authorization: Bearer <token>
```

**Response Sukses (`200`):**

```json
{
  "status": "success",
  "pesan": "Berhasil logout"
}
```

---

### 2. Jurnal

#### ✏️ Buat Jurnal — `POST /api/journals`

Mengirim curahan hati/jurnal. Teks akan dianalisis oleh **Google Gemini AI** untuk mendeteksi mood, lalu sistem memberikan rekomendasi artikel yang sesuai.

> 🔒 **Membutuhkan Autentikasi**

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "teks_curhat": "Aku merasa sangat lelah dan tidak punya motivasi untuk mengerjakan tugas-tugasku belakangan ini."
}
```

| Field | Tipe | Validasi |
|---|---|---|
| `teks_curhat` | `string` | Wajib |

**Response Sukses (`200`):**

```json
{
  "status": "success",
  "pesan": "Jurnal berhasil dianalisis!",
  "mood_terdeteksi": "Burnout",
  "data_jurnal": {
    "_id": "665a2c...",
    "user_id": "665a1b...",
    "teks_curhat": "Aku merasa sangat lelah dan tidak punya motivasi...",
    "hasil_mood": "Burnout",
    "tanggal": "2026-03-24T13:55:00.000Z",
    "updated_at": "2026-03-24T13:55:00.000Z",
    "created_at": "2026-03-24T13:55:00.000Z"
  },
  "rekomendasi_artikel": [
    {
      "_id": "665b3d...",
      "judul_artikel": "Tips Mengatasi Burnout untuk Mahasiswa",
      "isi_konten": "Burnout adalah kondisi kelelahan emosional...",
      "kategori_tag": "Burnout",
      "thumbnail_url": "https://example.com/image.jpg"
    }
  ]
}
```

> **Kategori mood yang didukung:** `Burnout`, `Cemas`, `Sedih`, `Netral`, `Krisis`

---

#### 📖 Lihat Semua Jurnal — `GET /api/journals`

Menampilkan seluruh riwayat jurnal milik user yang sedang login, diurutkan dari yang terbaru.

> 🔒 **Membutuhkan Autentikasi**

**Headers:**

```
Authorization: Bearer <token>
```

**Response Sukses (`200`):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "665a2c...",
      "user_id": "665a1b...",
      "teks_curhat": "Aku merasa sangat lelah...",
      "hasil_mood": "Burnout",
      "tanggal": "2026-03-24T13:55:00.000Z",
      "updated_at": "2026-03-24T13:55:00.000Z",
      "created_at": "2026-03-24T13:55:00.000Z"
    }
  ]
}
```

---

### 3. Artikel

#### 📚 Lihat Semua Artikel — `GET /api/articles`

Menampilkan seluruh daftar artikel yang tersedia.

> 🌐 **Tidak membutuhkan autentikasi (Publik)**

**Response Sukses (`200`):**

```json
{
  "status": "success",
  "total_data": 10,
  "data": [
    {
      "_id": "665b3d...",
      "judul_artikel": "Tips Mengatasi Burnout untuk Mahasiswa",
      "isi_konten": "Burnout adalah kondisi kelelahan emosional...",
      "kategori_tag": "Burnout",
      "thumbnail_url": "https://example.com/image.jpg"
    }
  ]
}
```

---

#### 🏷️ Filter Artikel by Mood — `GET /api/articles/mood/{mood}`

Menampilkan artikel yang difilter berdasarkan kategori mood.

> 🌐 **Tidak membutuhkan autentikasi (Publik)**

**Parameter URL:**

| Parameter | Tipe | Keterangan |
|---|---|---|
| `mood` | `string` | Kategori mood: `Burnout`, `Cemas`, `Sedih`, `Netral`, `Krisis` |

**Contoh:** `GET /api/articles/mood/Cemas`

**Response Sukses (`200`):**

```json
{
  "status": "success",
  "mood": "Cemas",
  "total_data": 3,
  "data": [
    {
      "_id": "665b4e...",
      "judul_artikel": "Cara Mengelola Kecemasan Saat Ujian",
      "isi_konten": "Kecemasan menjelang ujian adalah hal wajar...",
      "kategori_tag": "Cemas",
      "thumbnail_url": "https://example.com/cemas.jpg"
    }
  ]
}
```

---

## 📁 Struktur Proyek

```
ruangtenang/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php      # Registrasi, login, logout
│   │   │       ├── JournalController.php   # CRUD jurnal + analisis AI
│   │   │       └── ArticleController.php   # Daftar & filter artikel
│   │   ├── Middleware/
│   │   │   └── TokenAuth.php               # Custom token authentication
│   │   └── Kernel.php
│   ├── Models/
│   │   ├── User.php                        # Model user (MongoDB)
│   │   ├── Journal.php                     # Model jurnal
│   │   ├── Article.php                     # Model artikel
│   │   └── Token.php                       # Model token autentikasi
│   └── Providers/
├── config/
│   └── database.php                        # Konfigurasi MongoDB
├── routes/
│   └── api.php                             # Definisi semua route API
├── .env.example                            # Template variabel lingkungan
├── composer.json                           # Dependensi PHP
└── artisan                                 # CLI Laravel
```

---

## 📑 Ringkasan Endpoint API

| Metode | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/register` | Registrasi user baru | ❌ |
| `POST` | `/api/login` | Login user | ❌ |
| `POST` | `/api/logout` | Logout user | ✅ |
| `POST` | `/api/journals` | Buat jurnal + analisis mood AI | ✅ |
| `GET` | `/api/journals` | Lihat riwayat jurnal user | ✅ |
| `GET` | `/api/articles` | Lihat semua artikel | ❌ |
| `GET` | `/api/articles/mood/{mood}` | Filter artikel berdasarkan mood | ❌ |

---

<p align="center">
  Dibuat dengan ❤️ untuk mendukung kesehatan mental mahasiswa Indonesia.
</p>
