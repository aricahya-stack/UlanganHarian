# SainsMasemba v2.1.8 — Exam UX, Reset Pengerjaan, Focus Guard

Patch ini diasumsikan dipasang setelah v2.1.7.

## Fitur

1. Reset pengerjaan dari menu Monitoring (guru/super admin).
   - Menghapus ATTEMPTS untuk attempt terpilih.
   - Menghapus SUBMISSIONS terkait.
   - Siswa dapat memulai ulang dari awal.
   - Data ujian, bank soal, peserta, dan pemetaan soal tidak dihapus.

2. Mode proteksi selama ujian.
   - Selection/copy/cut/paste/context menu/drag diblokir selama ujian.
   - Print dibuat kosong.
   - Shortcut screenshot yang sampai ke browser dicegah best-effort.
   - Pergantian tab/aplikasi dideteksi lewat Page Visibility, lalu menampilkan peringatan saat siswa kembali.
   - Fullscreen diminta ketika siswa menekan Mulai/Lanjutkan ujian.
   - Browser memberi peringatan jika halaman hendak ditutup/reload.

   CATATAN: PWA/browser tidak dapat menjamin pemblokiran screenshot atau perpindahan aplikasi pada level OS. Untuk larangan absolut diperlukan aplikasi Android native/kiosk/managed device dengan FLAG_SECURE / kebijakan perangkat.

3. Spasi paragraf soal diperketat.
   - Plain text dengan Enter tetap dirender sebagai line break.
   - Margin antar paragraf tidak lagi terlalu lebar.

4. Gambar soal bisa diklik dan diperbesar.
   - Zoom -, reset, zoom +, dan tombol tutup.
   - Berlaku untuk gambar dalam HTML soal maupun imageUrl utama.

5. Ukuran huruf A A A.
   - Tiga tombol A dengan ukuran visual kecil/sedang/besar tanpa tulisan label ukuran.
   - Preferensi disimpan di localStorage perangkat.

6. SINGLE_CHOICE dan MULTIPLE_CHOICE dibedakan jelas.
   - SINGLE_CHOICE: “Pilih satu jawaban” + indikator radio bulat.
   - MULTIPLE_CHOICE: “Pilih lebih dari satu jawaban” + indikator checkbox persegi.

## Instalasi frontend
Replace file sesuai struktur patch lalu:

```bash
git add .
git commit -m "feat: exam focus UX and reset attempt"
git push origin main
```

Vercel akan redeploy.

## Instalasi Apps Script
Replace:
- apps-script/Admin.gs
- apps-script/Code.gs

Lalu Save -> Deploy -> Manage deployments -> Edit -> New version -> Deploy.

Tidak perlu menjalankan setupSainsMasemba() atau repairSainsMasemba() karena patch ini tidak menambah kolom/sheet.

## Reset pengerjaan
Guru/Super Admin -> Monitoring -> Reset pengerjaan.

Reset akan menghapus attempt dan submission siswa yang dipilih. Setelah itu siswa refresh/login ulang lalu Mulai Ujian lagi.
