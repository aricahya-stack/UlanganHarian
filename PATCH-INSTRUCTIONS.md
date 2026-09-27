# SainsMasemba PATCH v2.1.6 — Fix Timer / Auto Submit

## Masalah
Saat siswa menekan **Mulai Ujian**, halaman dapat langsung menjalankan final submit.

Penyebabnya adalah race condition di frontend:
- nilai awal `remainingMs` sebelumnya `0`;
- setelah `phase` berubah menjadi `exam`, effect auto-submit melihat `remainingMs <= 0`;
- effect timer baru menjadwalkan pembaruan waktu sesudah render tersebut;
- akibatnya `finalize(true)` dapat terpanggil sebelum countdown terinisialisasi.

## Perbaikan
- `remainingMs` memakai `null` selama timer belum terinisialisasi.
- Auto-submit hanya boleh berjalan setelah timer mempunyai nilai valid.
- Timer diinisialisasi dari `expiresAt` dan `serverTime` milik attempt.
- Countdown memakai offset waktu server agar tidak langsung bergantung pada jam perangkat.
- `autoSubmitStarted` di-reset ketika memulai/meresume ujian.

## File yang diganti
`src/app/student/exam/[examId]/page.tsx`

## Instalasi
1. Replace file sesuai path di atas.
2. Commit dan push ke GitHub.
3. Tunggu Vercel selesai redeploy.

Patch ini **frontend only**:
- tidak perlu `setupSainsMasemba()`;
- tidak perlu `repairSainsMasemba()`;
- tidak perlu deploy ulang Apps Script.

## Penting untuk attempt yang sudah terlanjur SUBMITTED
Patch tidak membuka kembali attempt yang sudah tersimpan sebagai `SUBMITTED`.
Untuk pengujian ulang, gunakan akun/ujian baru, atau hapus data uji terkait secara hati-hati dari `SUBMISSIONS` dan `ATTEMPTS` untuk pasangan siswa + ujian tersebut.
