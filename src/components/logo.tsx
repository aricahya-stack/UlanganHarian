import Image from 'next/image';

export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) return <Image src="/sains-masemba-icon.svg" alt="SainsMasemba" width={40} height={40} priority />;
  return <Image src="/sains-masemba-logo.svg" alt="SainsMasemba" width={180} height={48} priority />;
}
