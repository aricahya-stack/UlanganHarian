'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { AdminShell } from '@/components/admin-shell';
import { PageHeader, Skeleton } from '@/components/ui';
import { useSession } from '@/contexts/session-context';
import { getExamApi, type MonitoringRow } from '@/lib/api';
import { formatDateTime } from '@/lib/format';

export default function MonitoringPage() {
  const { session } = useSession();
  const [rows, setRows] = useState<MonitoringRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState('');

  const load = () => {
    if (!session) return Promise.resolve();
    setLoading(true);
    return getExamApi().getMonitoring(session.token).then(setRows).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, [session]);

  const resetAttempt = async (row: MonitoringRow) => {
    if (!session || resettingId) return;
    const confirmed = window.confirm(`Reset pengerjaan ${row.studentName} untuk ujian “${row.examTitle}”?\n\nJawaban, attempt, dan hasil submission siswa ini akan dihapus sehingga siswa dapat mengerjakan ulang dari awal.`);
    if (!confirmed) return;
    setResettingId(row.attemptId);
    try {
      await getExamApi().resetAttempt(session.token, row.attemptId);
      await load();
      window.alert('Pengerjaan berhasil direset. Siswa dapat memulai ujian lagi dari awal.');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Gagal mereset pengerjaan.');
    } finally {
      setResettingId('');
    }
  };

  return <AuthGuard role="super_admin"><AdminShell>
    <PageHeader eyebrow="MONITORING" title="Aktivitas ujian" description="Diperbarui setiap 30 detik. Reset hanya menghapus pengerjaan siswa yang dipilih." action={<button className="button secondary" onClick={() => load()}><RefreshCw size={17}/>Refresh</button>}/>
    {loading ? <Skeleton height={260}/> : <section className="panel"><div className="table-wrap"><table><thead><tr><th>Peserta</th><th>Ujian</th><th>Status</th><th>Mulai</th><th>Sinkronisasi</th><th>Rev.</th><th>Aksi</th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.attemptId}><td><strong>{row.studentName}</strong><small>{row.className}</small></td><td>{row.examTitle}</td><td><span className={`status-dot ${row.status.toLowerCase()}`}>{row.status}</span></td><td>{formatDateTime(row.startedAt)}</td><td>{formatDateTime(row.lastSyncAt)}</td><td>{row.revision}</td><td><button type="button" className="button danger compact" disabled={resettingId === row.attemptId} onClick={() => resetAttempt(row)}><RotateCcw size={15}/>{resettingId === row.attemptId ? 'Mereset...' : 'Reset pengerjaan'}</button></td></tr>)}
      {!rows.length && <tr><td colSpan={7}><div className="empty-table">Belum ada aktivitas pengerjaan.</div></td></tr>}
    </tbody></table></div></section>}
  </AdminShell></AuthGuard>;
}
