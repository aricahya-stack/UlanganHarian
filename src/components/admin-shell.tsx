'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { BookOpenCheck, GraduationCap, LayoutDashboard, LogOut, School2, ScrollText, Settings2, Users2 } from 'lucide-react';
import { useSession } from '@/contexts/session-context';

interface AdminShellProps { children: ReactNode; }

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useSession();
  const role = session?.user.role ?? 'teacher';
  const base = role === 'super_admin' ? '/super-admin' : '/teacher';
  const navItems = [
    { href: base, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${base}/exams`, label: 'Kelola Ujian', icon: ScrollText },
    { href: `${base}/questions`, label: 'Bank Soal', icon: BookOpenCheck },
    ...(role === 'super_admin' ? [{ href: `${base}/students`, label: 'Siswa', icon: GraduationCap }, { href: `${base}/teachers`, label: 'Guru', icon: School2 }, { href: `${base}/users`, label: 'Pengguna', icon: Users2 }] : []),
    { href: `${base}/developers`, label: 'Pengembang', icon: Settings2 },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand"><div className="logo-mark">SM</div><div><strong>SainsMasemba</strong><span>{role === 'super_admin' ? 'Super Admin Console' : 'Teacher Console'}</span></div></div>
          <nav className="nav-section">{navItems.map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={active ? 'active' : ''}><Icon size={18} /><span>{item.label}</span></Link>; })}</nav>
        </div>
        <div className="sidebar-footer"><div className="user-badge"><strong>{session?.user.name}</strong><span>{session?.user.username}</span></div><button className="button secondary full" onClick={() => { logout(); router.replace('/login'); }}><LogOut size={17} />Keluar</button></div>
      </aside>
      <main className="content-area">{children}</main>
    </div>
  );
}
