# RuangTenang - Project Handover & Progress Notes

Dokumen ini berisi ringkasan perkembangan proyek *RuangTenang* hingga saat ini (Branch: `alip`), ditujukan untuk memberikan konteks kepada AI lain agar dapat melanjutkan pekerjaan dengan pemahaman penuh mengenai status kode dan server.

## 1. Arsitektur & Teknologi Utama
- **Backend**: Laravel (PHP)
- **Database**: MongoDB (dengan integrasi Auth/Sanctum melalui `MongoDB\Laravel\Auth\PersonalAccessToken` yang sudah diperbaiki).
- **Mobile Agent**: Flutter (`mobile/` folder).
- **Infrastruktur Deploy**: Railway (Ekstensi MongoDB di Railway sudah berhasil di-konfigurasi).

---

## 2. Pembaruan Backend (Laravel) Terkini
1. **Migrasi AI Provider**: Modul AI untuk fitur Chat telah dikonversi/diubah dari Google Gemini menjadi **Groq AI** guna mendapatkan performa inferensi yang lebih cepat dan spesifik.
2. **Sinkronisasi Database**: Telah dibuat custom Artisan command (`php artisan db:export-asli` & `db:import-asli`) untuk melakukan auto-dump data dari satu environment MongoDB ke JSON (`database/raw_data/`), lalu di-import kembali, yang mempermudah sinkronisasi antar tim.
3. **Penyelesaian Merge Conflicts**: Telah dilakukan *merging* branch `agung` ke `alip`. Konflik di `JournalController.php` telah diselesaikan sepenuhnya. Modul CRUD untuk Jurnal dan Mood kini beroperasi dengan baik.
4. **Fitur Admin**: Terdapat penambahan fungsionalitas admin pada *Journal* dan validasi status yang sedang dalam progres penyempurnaan.

---

## 3. Pembaruan Mobile (Flutter) Terkini
1. **Modernisasi UI (Revamp)**: Antarmuka mobile telah dirombak menggunakan tema **Glassmorphism** dengan palet warna ungu/hijau menenangkan (calming colors) serta dilengkapi animasi pergerakan organik (blobs) di *background*.
2. **Staggered Animations**: Pada halaman Dashboard (`dashboard_page.dart`) telah dipasang `AnimationController` dengan integrasi *Fade-In-Up Staggered* agar elemen list, card, dan chart muncul berurutan dengan sangat mulus.
3. **Audio Duration Sync (Relaksasi)**: Pada fitur Relaksasi (`relaxation_page.dart`), logika pemutaran audio sudah diselaraskan (dynamic audio duration tracker) sehingga waktu riil mendengarkan audio tersinkronisasi sebagai "sesi terselesaikan" ke backend melalui `ApiService()`.
4. **Modul yang Sudah Ada**: `login_page.dart`, `register_page.dart`, `dashboard_page.dart`, `chat_page.dart`, `relaxation_page.dart`.

---

## 4. Backlog / Fitur yang Belum Diimplementasikan di Mobile
> **Catatan untuk AI Penerus**: Meskipun backend Laravel sudah menyiapkan Endpoint-nya, aplikasi Flutter saat ini **belum** memiliki halaman-halaman berikut:
- **Journal Page**: Detail list riwayat jurnal (CRUD) belum ada di Flutter (Dashboard saat ini masih menampilkan UI dummy untuk "Jurnal Terbaru").
- **Article Page**: Belum ada UI untuk menyajikan daftar bacaan atau edukasi perihal *Mental Health*.
- **Profile / Setting Page**: Halaman spesifik untuk ganti password, atur profil, dan tombol *Logout* sesungguhnya belum ada.

---

## 5. Status Branch Git
Saat ini kita berada di branch `alip` yang memimpin 5 commit di depan `origin/alip`. Branch ini memuat fitur Groq AI dan resolusi konflik JournalController. Terakhir diubah: 16 April 2026.
