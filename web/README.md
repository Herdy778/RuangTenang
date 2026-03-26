<p align="center">
  <h1 align="center">🌿 RuangTenang — Frontend Web</h1>
  <p align="center">
    Antarmuka pengguna (UI) untuk aplikasi <strong>RuangTenang</strong>, sebuah platform kesehatan mental digital berbasis web yang membantu mahasiswa mencurahkan perasaan melalui jurnal harian, mendapatkan analisis mood dari AI, serta membaca artikel bibliotherapy yang relevan.
  </p>
</p>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi & Menjalankan Dev Server](#-instalasi--menjalankan-dev-server)
- [Konfigurasi Variabel Lingkungan (.env)](#-konfigurasi-variabel-lingkungan-env)
- [Struktur Folder](#-struktur-folder)
- [Halaman (Pages)](#-halaman-pages)
- [Alur Autentikasi](#-alur-autentikasi)

---

## 💡 Tentang Proyek

**RuangTenang Web** adalah aplikasi React yang berjalan di sisi klien dan berkomunikasi dengan [RuangTenang Backend API](../ruangtenang). Tampilan dirancang dengan estetika modern — glassmorphism card, animated blobs, dan micro-animation — untuk menciptakan pengalaman yang nyaman saat pengguna mencurahkan perasaannya.

Fitur utama yang ditampilkan:

- 🔑 **Autentikasi** — Halaman login & registrasi dalam satu tampilan dengan tab switching yang mulus.
- 📊 **Dashboard** — Ringkasan statistik jurnal, mood dominan, dan 5 jurnal terbaru.
- 📝 **Jurnal Harian** — Form curhat yang dikirim ke AI untuk analisis mood, disertai tampilan hasil analisis dan rekomendasi artikel secara langsung.
- 📚 **Artikel Bibliotherapy** — Grid artikel dengan fitur pencarian dan filter berdasarkan kategori mood.
- 👤 **Profil** — Informasi akun, distribusi mood (dengan progress bar), dan statistik aktivitas jurnal.

---

## 🛠 Tech Stack

| Teknologi | Versi | Peran |
|---|---|---|
| **React** | `^19.2.4` | Library UI utama |
| **Vite** | `^8.0.1` | Build tool & dev server |
| **React Router DOM** | `^7.13.1` | Client-side routing |
| **Axios** | `^1.13.6` | HTTP client untuk komunikasi API |
| **Vanilla CSS (Inline Styles)** | — | Styling per-komponen tanpa library eksternal |
| **ESLint** | `^9.39.4` | Linting kode JavaScript |

> **Catatan Styling:** Seluruh styling menggunakan JavaScript inline style objects yang didefinisikan langsung di setiap file halaman (tidak ada Tailwind CSS, Bootstrap, atau library CSS eksternal lainnya).

---

## 📌 Prasyarat

Pastikan perangkat Anda sudah terinstal:

- **Node.js** >= 18.x
- **npm** >= 9.x (atau `pnpm` / `yarn`)
- **Backend API** RuangTenang harus berjalan (default: `http://127.0.0.1:8000`)

---

## 🚀 Instalasi & Menjalankan Dev Server

### 1. Clone Repository

```bash
git clone https://github.com/Herdy778/RuangTenang-Web.git
cd RuangTenang-Web
```

### 2. Install Dependensi

```bash
npm install
```

### 3. (Opsional) Konfigurasi API URL

Secara default, aplikasi menembak ke `http://127.0.0.1:8000/api`. Jika backend berjalan di URL berbeda, buat file `.env` di root project dan sesuaikan nilainya (lihat [bagian berikutnya](#-konfigurasi-variabel-lingkungan-env)).

### 4. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173` secara default (Vite).

### Script yang Tersedia

| Script | Perintah | Keterangan |
|---|---|---|
| Dev Server | `npm run dev` | Jalankan server lokal dengan hot-reload |
| Build | `npm run build` | Build untuk production |
| Preview | `npm run preview` | Preview hasil build production |
| Lint | `npm run lint` | Jalankan ESLint untuk cek kode |

---

## 🔐 Konfigurasi Variabel Lingkungan (.env)

> **⚠️ Perhatian:** Saat ini, URL API backend **di-hardcode** langsung di file `src/utils/api.js` (baris 4). Untuk kemudahan konfigurasi (terutama saat deploy), disarankan untuk mengubahnya menggunakan variabel lingkungan Vite.

**Langkah konfigurasi (jika ingin menggunakan `.env`):**

1. Buat file `.env` di root project:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

2. Ubah `src/utils/api.js` agar membaca dari variabel tersebut:

```js
// Sebelum (hardcoded):
baseURL: 'http://127.0.0.1:8000/api',

// Sesudah (menggunakan env):
baseURL: import.meta.env.VITE_API_URL,
```

> **Catatan:** Di Vite, semua variabel environment yang ingin diakses di sisi klien **harus diawali dengan `VITE_`**.

### Tabel Variabel Lingkungan yang Direkomendasikan

| Variabel | Deskripsi | Contoh Nilai |
|---|---|---|
| `VITE_API_URL` | Base URL untuk backend API | `http://127.0.0.1:8000/api` |

---

## 📁 Struktur Folder

```
ruangtenang-web/
├── public/                     # Aset statis (favicon, dll.)
│   └── favicon.svg
├── src/
│   ├── pages/                  # Halaman utama aplikasi
│   │   ├── Auth.jsx            # Login & Registrasi (tab-based)
│   │   ├── Dashboard.jsx       # Halaman utama setelah login
│   │   ├── Journal.jsx         # Form curhat + riwayat jurnal
│   │   ├── Articles.jsx        # Daftar & filter artikel
│   │   └── Profile.jsx         # Profil & distribusi mood user
│   ├── utils/
│   │   └── api.js              # Instance Axios (base URL + interceptors)
│   ├── components/             # (Kosong — komponen UI ada di dalam pages)
│   ├── assets/                 # Gambar & aset statis untuk JS
│   ├── App.jsx                 # Root routing (BrowserRouter + PrivateRoute)
│   ├── App.css                 # CSS global untuk animasi (blob, hover, dll.)
│   ├── index.css               # CSS reset & font global
│   └── main.jsx                # Entry point aplikasi
├── index.html                  # HTML template utama
├── vite.config.js              # Konfigurasi Vite
├── eslint.config.js            # Konfigurasi ESLint
└── package.json                # Dependensi & scripts npm
```

---

## 📄 Halaman (Pages)

| Halaman | Route | Akses | Deskripsi |
|---|---|---|---|
| **Auth** | `/` | Publik | Login & registrasi user dalam satu halaman dengan tab switcher |
| **Dashboard** | `/dashboard` | 🔒 Private | Statistik jurnal, mood dominan, CTA jurnal baru, preview 5 jurnal terbaru |
| **Journal** | `/journal` | 🔒 Private | Form curhat + analisis AI real-time + riwayat jurnal lengkap |
| **Articles** | `/articles` | 🔒 Private | Grid artikel dengan filter mood & fitur pencarian berdasarkan judul |
| **Profile** | `/profile` | 🔒 Private | Info akun, distribusi mood (progress bar), statistik total jurnal |

---

## 🔑 Alur Autentikasi

Aplikasi menggunakan **token-based authentication** berbasis `localStorage`:

```
1. User login/register → API mengembalikan `token` & `user`
2. token & user disimpan di localStorage
3. Setiap request API otomatis menyertakan header:
   Authorization: Bearer <token>
4. Jika API merespons 401 → localStorage dibersihkan & user di-redirect ke "/"
5. Route private dilindungi oleh komponen <PrivateRoute> di App.jsx —
   user tanpa token di localStorage akan otomatis diarahkan ke halaman login
```

**File terkait:** `src/utils/api.js` (Axios interceptors), `src/App.jsx` (PrivateRoute logic)

---

<p align="center">
  Dibuat dengan ❤️ untuk mendukung kesehatan mental mahasiswa Indonesia.
</p>
