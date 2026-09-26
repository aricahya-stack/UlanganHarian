# Build Validation

Validasi yang dilakukan sebelum ZIP dibuat:

- Seluruh local import `src/` dapat di-resolve ke file yang tersedia.
- `package.json`, `tsconfig.json`, dan `manifest.webmanifest` JSON valid.
- JavaScript syntax untuk `public/sw.js`, `next.config.mjs`, dan `scripts/verify.mjs` lulus `node --check`.
- Seluruh Apps Script `.gs` lulus pemeriksaan syntax JavaScript.
- `npm run verify` lulus untuk file inti proyek.
- Final submit backend memakai idempotency check berdasarkan `attemptId` di dalam critical section `LockService` singkat.
- Runtime baru tidak mengimpor Prisma, Neon, atau `@vercel/blob`.

## Catatan lingkungan validasi

Sandbox pembuatan ZIP tidak memiliki dependency Next.js/React di `node_modules` dan instalasi dari registry tidak selesai dalam batas waktu eksekusi. Karena itu `next build` penuh tidak dapat dikonfirmasi di sandbox ini.

Repository menyertakan GitHub Actions (`.github/workflows/quality.yml`) yang menjalankan:

```bash
npm install
npm run typecheck
npm run verify
npm run build
```

ketika source dipush ke GitHub pada environment yang memiliki akses registry npm.

Sebelum deployment production, jalankan perintah yang sama secara lokal atau pastikan workflow GitHub berstatus hijau.
