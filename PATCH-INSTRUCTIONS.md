# SainsMasemba HOTFIX v2.1.9b — Vercel Build

Memperbaiki error TypeScript:

`Property 'superAdmin' does not exist on type '{ children: ReactNode; }'`

Penyebab: `AdminShell` menentukan mode super-admin dari `session.user.role`, sehingga prop `superAdmin` tidak pernah didefinisikan dan tidak perlu dikirim.

## File yang diganti

`src/app/super-admin/monitoring/page.tsx`

Perubahan:

```tsx
<AdminShell superAdmin>
```

menjadi:

```tsx
<AdminShell>
```

Tidak ada perubahan Apps Script, Google Sheets, atau environment variables.
