import { cn } from '@/lib/utils';
import type { Status } from '@/lib/mockData';

const config: Record<string, { label: string; classes: string; dot: string }> = {
  success: { label: 'Success', classes: 'text-[hsl(142_70%_45%)] bg-[hsl(142_70%_45%/0.1)] border-[hsl(142_70%_45%/0.3)]', dot: 'bg-[hsl(142_70%_45%)]' },
  error:   { label: 'Error',   classes: 'text-[hsl(0_72%_55%)] bg-[hsl(0_72%_55%/0.1)] border-[hsl(0_72%_55%/0.3)]', dot: 'bg-[hsl(0_72%_55%)]' },
  warning: { label: 'Warning', classes: 'text-[hsl(38_95%_55%)] bg-[hsl(38_95%_55%/0.1)] border-[hsl(38_95%_55%/0.3)]', dot: 'bg-[hsl(38_95%_55%)]' },
  running: { label: 'Running', classes: 'text-primary bg-primary/10 border-primary/30', dot: 'bg-primary animate-pulse' },
  firing:  { label: 'Firing',  classes: 'text-[hsl(0_72%_55%)] bg-[hsl(0_72%_55%/0.1)] border-[hsl(0_72%_55%/0.3)]', dot: 'bg-[hsl(0_72%_55%)] animate-pulse' },
  resolved:{ label: 'Resolved',classes: 'text-muted-foreground bg-muted/50 border-border', dot: 'bg-muted-foreground' },
  pending: { label: 'Pending', classes: 'text-[hsl(38_95%_55%)] bg-[hsl(38_95%_55%/0.1)] border-[hsl(38_95%_55%/0.3)]', dot: 'bg-[hsl(38_95%_55%)]' },
  critical:{ label: 'Critical',classes: 'text-[hsl(0_72%_55%)] bg-[hsl(0_72%_55%/0.1)] border-[hsl(0_72%_55%/0.3)]', dot: 'bg-[hsl(0_72%_55%)]' },
  info:    { label: 'Info',    classes: 'text-primary bg-primary/10 border-primary/30', dot: 'bg-primary' },
};

interface Props {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, label, size = 'sm' }: Props) {
  const c = config[status] ?? config['info'];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
      c.classes
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {label ?? c.label}
    </span>
  );
}
