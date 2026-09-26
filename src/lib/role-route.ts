import type { Role } from './api';

export function homeForRole(role: Role) {
  if (role === 'super_admin') return '/super-admin';
  if (role === 'teacher') return '/teacher';
  return '/student';
}

export function roleLabel(role: Role) {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'teacher') return 'Guru';
  return 'Siswa';
}
