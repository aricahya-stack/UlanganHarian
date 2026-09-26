import fs from 'node:fs';
import path from 'node:path';

const required = [
  'src/app/page.tsx',
  'src/app/student/page.tsx',
  'src/app/super-admin/page.tsx',
  'src/app/super-admin/teachers/page.tsx',
  'src/app/teacher/page.tsx',
  'src/components/admin-shell.tsx',
  'src/lib/api/apps-script-api.ts',
  'src/lib/api/demo-api.ts',
  'public/manifest.webmanifest',
  'public/sw.js',
  'apps-script/Code.gs',
  'apps-script/Admin.gs',
  'apps-script/Setup.gs'
];
const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) { console.error('File wajib belum tersedia:', missing.join(', ')); process.exit(1); }
const types = fs.readFileSync(path.resolve('src/lib/api/types.ts'),'utf8');
for (const role of ['super_admin','teacher','student']) if (!types.includes(`'${role}'`)) { console.error('Role belum terdefinisi:',role); process.exit(1); }
const admin = fs.readFileSync(path.resolve('apps-script/Admin.gs'),'utf8');
const utils = fs.readFileSync(path.resolve('apps-script/Utils.gs'),'utf8');
if (!admin.includes('ownerId') || !utils.includes('canManageExam_')) { console.error('Ownership guru belum terpasang pada backend.'); process.exit(1); }
console.log(`OK: ${required.length} file inti tersedia, 3 role dan ownership backend terdeteksi.`);
