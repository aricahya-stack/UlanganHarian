'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { BookText, House, LogOut, Settings2, Trophy } from 'lucide-react';
import { useSession } from '@/contexts/session-context';

interface StudentShellProps { children: ReactNode; hideNav?: boolean; }

export function StudentShell({ children, hideNav = false }: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useSession();
  const navItems = [
    { href: '/student', label: 'Beranda', icon: House },
    { href: '/student/history', label: 'Riwayat', icon: BookText },
    { href: '/student/results', label: 'Hasil', icon: Trophy },
    { href: '/student/developers', label: 'Pengembang', icon: Settings2 },
  ];

  return (
    <div className="student-layout">
      <header className="student-topbar"><div><strong>{session?.user.name}</strong><span>{session?.user.className}</span></div><button className="icon-button" onClick={() => { logout(); router.replace('/login'); }} aria-label="Keluar"><LogOut size={18} /></button></header>
      <main className="student-content">{children}</main>
      {!hideNav && <nav className="student-nav">{navItems.map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={active ? 'active' : ''}><Icon size={18} /><span>{item.label}</span></Link>; })}</nav>}
    </div>
  );
}
