# SainsMasemba v2.1.7 — Fix Google Drive Image

Masalah: gambar yang berhasil diupload ke Google Drive tampil sebagai broken image di editor/ujian.

Penyebab: URL lama `https://drive.google.com/uc?export=view&id=...` tidak lagi reliabel untuk image embedding.

Perbaikan:
- `drivePublicUrl_()` sekarang memakai `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600`.
- HTML lama yang masih menyimpan URL `/uc?export=view&id=...` dinormalisasi otomatis oleh `MathHtml` saat dirender.
- URL share Drive model `/file/d/FILE_ID/view` juga dinormalisasi.
- Upload baru tidak lagi diam-diam dianggap berhasil jika Google Workspace memblokir public sharing.

## File yang diganti
- `apps-script/Utils.gs`
- `apps-script/Drive.gs`
- `src/components/math-html.tsx`

## Setelah replace
1. Apps Script: Save.
2. Deploy > Manage deployments > Edit > New version > Deploy.
3. Frontend: commit + push ke GitHub/Vercel.
4. Hard refresh browser / tutup-buka PWA agar bundle frontend baru terpakai.

Tidak perlu menjalankan `setupSainsMasemba()` atau `repairSainsMasemba()` karena tidak ada perubahan schema.
