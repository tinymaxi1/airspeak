import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  draft: { label: 'Taslak', color: 'bg-secondary text-secondary-foreground' },
  review: { label: 'İncelemede', color: 'bg-amber-100 text-amber-800' },
  published: { label: 'Yayında', color: 'bg-airspeak-green/15 text-emerald-800' },
  archived: { label: 'Arşivli', color: 'bg-secondary text-muted-foreground' },
} as const;

export function StatusBadge({
  status,
  className,
}: {
  status: keyof typeof STATUS_CONFIG | string;
  className?: string;
}) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
