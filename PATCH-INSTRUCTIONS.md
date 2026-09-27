# SainsMasemba HOTFIX v2.1.9a — Vercel Build

Masalah:
`src/app/student/page.tsx` memakai `exam.availableNow`, tetapi interface `ExamSummary` belum memiliki properti tersebut.

Perbaikan:
Menambahkan:

```ts
availableNow?: boolean;
```

ke interface `ExamSummary` pada `src/lib/api/types.ts`.

## Cara pasang
1. Replace file `src/lib/api/types.ts` dengan file dari patch ini.
2. Commit dan push ke GitHub.
3. Vercel akan build ulang otomatis.

Tidak perlu mengubah Apps Script, menjalankan setup, repair, atau deploy Apps Script.
