export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60); const m = minutes % 60;
  return m ? `${h} jam ${m} menit` : `${h} jam`;
}

export function formatBytes(value?: number) {
  if (!Number.isFinite(value)) return '-';
  const units = ['B', 'KB', 'MB', 'GB']; let current = value || 0; let unit = 0;
  while (current >= 1024 && unit < units.length - 1) { current /= 1024; unit += 1; }
  return `${current.toFixed(current >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
