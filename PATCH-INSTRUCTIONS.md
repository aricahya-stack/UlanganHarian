# SainsMasemba Patch v2.1.5 — Kategori & Paket Soal

## Tujuan revisi
- `nama_tryout` pada Excel sekarang diperlakukan sebagai **Nama Paket Soal**.
- Menambahkan kolom opsional `kategori_soal` pada Excel, misalnya: `Ulangan Harian`, `PTS`, `PAS`, `Tryout`, `Remedial`.
- Guru dapat membuat jadwal/ujian dengan memilih **Kategori Soal → Paket Soal**.
- Saat jadwal disimpan, seluruh soal berstatus `PUBLISHED`/`ACTIVE` dari paket langsung dipetakan ke ujian.
- Mode lama **Pilih Manual dari Bank Soal** tetap tersedia.
- Import Excel sekarang **upsert berdasarkan `kode_soal`**: re-import kode yang sama akan memperbarui soal, bukan membuat duplikat.

## Backward compatibility
Template lama yang belum memiliki `kategori_soal` tetap dapat diimpor.
Kategori akan dicoba diinfer dari `nama_tryout`:
- mengandung `Ulangan Harian` / `UH` → `Ulangan Harian`
- `PTS` / `Tengah Semester` → `PTS`
- `PAS` / `Akhir Semester` → `PAS`
- `Tryout` / `Try Out` → `Tryout`
- `Remedial` → `Remedial`
- selain itu → `Tanpa Kategori`

Contoh file lama:
- `nama_tryout = Soal Ulangan Harian 2`
- tanpa `kategori_soal`

akan masuk sebagai:
- Kategori: `Ulangan Harian`
- Paket: `Soal Ulangan Harian 2`

## File yang harus direplace
Salin folder patch ke root repository dan pilih overwrite:

### Frontend
- `src/components/question-manager.tsx`
- `src/components/exam-manager.tsx`
- `src/lib/api/types.ts`
- `src/lib/api/exam-api.ts`
- `src/lib/api/apps-script-api.ts`
- `src/lib/api/demo-api.ts`
- `src/lib/demo-data.ts`
- `public/templates/question-import-template.xlsx`

### Apps Script
- `apps-script/Admin.gs`
- `apps-script/Code.gs`
- `apps-script/Config.gs`

## Setelah mengganti Apps Script
1. Save semua file Apps Script.
2. Jalankan **`repairSainsMasemba()`** satu kali.
3. Fungsi repair akan menambah header baru pada sheet `QUESTIONS` tanpa menghapus data:
   - `category`
   - `packageName`
4. `Deploy → Manage deployments → Edit → New version → Deploy`.
5. URL `/exec` tidak berubah.

## Jika soal sudah pernah diimport sebelum patch
Re-import file Excel yang sama.
Importer baru melakukan upsert berdasarkan `kode_soal`, sehingga soal dengan kode yang sama akan diperbarui dan memperoleh metadata Kategori/Paket tanpa membuat duplikat.

Contoh `Soal Ulangan Harian 2.xlsx` lama tetap bisa dipakai karena `nama_tryout` sudah berisi `Soal Ulangan Harian 2`. Sistem akan menginfer kategorinya menjadi `Ulangan Harian`.

## Saat membuat jadwal
Pada form `Buat Ujian` sekarang ada:

### Sumber soal
- `Pilih Paket Soal`
- `Pilih Manual dari Bank Soal`

Jika memilih Paket Soal:
1. Pilih `Kategori Soal`.
2. Pilih `Paket Soal`.
3. Sistem menampilkan jumlah soal siap (`PUBLISHED/ACTIVE`).
4. Simpan jadwal.
5. `EXAM_QUESTIONS` otomatis diisi dari paket tersebut.

Jika memilih manual, jadwal tetap bisa dibuat lalu gunakan tombol `Pemetaan Soal` seperti sebelumnya.

## Penting tentang status soal
Hanya soal berstatus `PUBLISHED` atau `ACTIVE` yang otomatis dimasukkan ketika Paket Soal dipilih untuk jadwal.
Jika paket menunjukkan `0/20 siap`, ubah status soal menjadi `PUBLISHED` terlebih dahulu.
