'use client';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { AdminShell } from '@/components/admin-shell';
import { PageHeader, Skeleton } from '@/components/ui';
import { useSession } from '@/contexts/session-context';
import { getExamApi, type MonitoringRow } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
export default function MonitoringPage(){const{session}=useSession();const[rows,setRows]=useState<MonitoringRow[]>([]);const[loading,setLoading]=useState(true);const load=()=>{if(!session)return;setLoading(true);getExamApi().getMonitoring(session.token).then(setRows).finally(()=>setLoading(false))};useEffect(()=>{load();const id=setInterval(load,30000);return()=>clearInterval(id)},[session]);return <AuthGuard role="teacher"><AdminShell><PageHeader eyebrow="MONITORING" title="Aktivitas ujian" description="Diperbarui setiap 30 detik agar tidak membebani Apps Script." action={<button className="button secondary" onClick={load}><RefreshCw size={17}/>Refresh</button>}/>{loading?<Skeleton height={260}/>:<section className="panel"><div className="table-wrap"><table><thead><tr><th>Peserta</th><th>Ujian</th><th>Status</th><th>Mulai</th><th>Sinkronisasi</th><th>Rev.</th></tr></thead><tbody>{rows.map(r=><tr key={r.attemptId}><td><strong>{r.studentName}</strong><small>{r.className}</small></td><td>{r.examTitle}</td><td><span className={`status-dot ${r.status.toLowerCase()}`}>{r.status}</span></td><td>{formatDateTime(r.startedAt)}</td><td>{formatDateTime(r.lastSyncAt)}</td><td>{r.revision}</td></tr>)}</tbody></table></div></section>}</AdminShell></AuthGuard>}
