# SainsMasemba Patch v2.1.9 — Monitoring, WIB, Kelas & Focus Control

Patch ini melanjutkan v2.1.8 dan mempertahankan perbaikan timer, paket soal, matching, gambar Drive, serta UX ujian sebelumnya.

## Perubahan utama

1. Waktu ujian konsisten WIB (Asia/Jakarta).
   - Form `datetime-local` tidak lagi bergeser karena konversi UTC.
   - Label waktu menampilkan `WIB`.
   - Jadwal baru default `SCHEDULED`.
   - `SCHEDULED` otomatis dapat dimulai saat `startTime` tercapai dan berhenti saat `endTime` terlewati.

2. Kelas ujian berasal dari data peserta aktif.
   - Form ujian menampilkan dropdown kelas dari `USERS` role student status ACTIVE.
   - Backend memvalidasi kelas tersebut memang ada.
   - Siswa hanya menerima dan dapat memulai ujian jika kelas pada akun siswa sama dengan kelas ujian (normalisasi spasi/huruf besar-kecil).

3. Monitoring diubah menjadi alur `Kelas -> Ujian`.
   - Setelah memilih ujian, tabel menampilkan seluruh peserta aktif pada kelas ujian.
   - Status: Akan ujian, Sedang ujian, Dijeda, Selesai, Waktu habis.
   - Kolom `Tidak fokus` menampilkan jumlah perpindahan aplikasi/tab/fullscreen yang terdeteksi.

4. Aksi monitoring.
   - Sedang ujian: `Pause` + `Peringatan`.
   - Dijeda: `Lanjut` + `Peringatan`.
   - Selesai / waktu habis: `Reset pengerjaan`.
   - Reset tidak ditampilkan untuk siswa yang belum mulai atau masih aktif.
   - Saat pause, timer siswa berhenti; ketika dilanjutkan, `expiresAt` diperpanjang sebesar durasi jeda.

5. Focus control siswa.
   - Visibility/window blur/fullscreen exit dicatat sebagai `Tidak fokus`.
   - Guru dapat melihat hitungannya dari Monitoring.
   - Peringatan guru dikirim melalui backend dan muncul pada layar siswa.
   - Watermark identitas siswa tampil selama ujian sebagai deterrent screenshot.
   - Copy/cut/paste, context menu, drag, print, dan shortcut screenshot yang dapat ditangkap browser diblokir.

## Batasan teknis screenshot / keluar aplikasi

PWA/browser **tidak memiliki izin OS** untuk memblokir screenshot Android/iOS/macOS secara absolut dan tidak dapat memaksa perangkat pribadi tetap berada pada satu aplikasi. Patch ini menggunakan mitigasi maksimum yang tersedia di web: fullscreen, focus detection, warning, audit count, dan watermark.

Untuk kontrol absolut pada perangkat sekolah diperlukan aplikasi Android native + `FLAG_SECURE` untuk screenshot dan Android Lock Task/Kiosk Mode (umumnya dengan perangkat managed/Device Owner/MDM) untuk mengunci aplikasi.

## Instalasi frontend

Replace file di project sesuai struktur folder patch, lalu push:

```bash
git add .
git commit -m "feat: monitoring WIB class focus controls"
git push origin main
```

Vercel akan redeploy otomatis.

## Instalasi Apps Script

Replace file:

- `Admin.gs`
- `Code.gs`
- `Config.gs`
- `Exam.gs`
- `Utils.gs`

Kemudian SAVE dan jalankan **sekali**:

```text
repairSainsMasemba()
```

Repair diperlukan karena sheet `ATTEMPTS` mendapat kolom tambahan:

- `focusViolationCount`
- `pauseStartedAt`
- `lastWarning`
- `lastWarningAt`

Jangan menjalankan setup ulang.

Lalu:

```text
Deploy -> Manage deployments -> Edit -> New version -> Deploy
```

URL `/exec` tidak berubah.

## Jadwal lama

Jika jadwal pernah disimpan ketika bug UTC/WIB masih ada, nilai waktu yang sudah tersimpan mungkin sudah terlanjur bergeser. Setelah patch terpasang, buka `Edit Ujian`, periksa `Mulai` dan `Selesai`, pilih kembali waktu WIB yang benar, lalu Simpan sekali.
