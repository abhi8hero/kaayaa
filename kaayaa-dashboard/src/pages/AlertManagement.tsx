import { useState } from 'react';
import { Bell, Plus, Pencil, Trash2, BellOff } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { alerts as initialAlerts } from '@/lib/mockData';
import type { Alert } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'border-l-4 border-l-destructive',
  warning:  'border-l-4 border-l-accent',
  info:     'border-l-4 border-l-primary',
};

function AlertCard({ alert, onDelete, onMute }: {
  alert: Alert;
  onDelete: (id: string) => void;
  onMute: (id: string) => void;
}) {
  return (
    <div className={cn(
      'luminate-card rounded-lg p-4 flex flex-col md:flex-row gap-3 md:items-center animate-luminate-in',
      SEVERITY_COLORS[alert.severity]
    )}>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">{alert.name}</h3>
          <StatusBadge status={alert.severity} label={alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} />
          <StatusBadge status={alert.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground/70">{alert.workflow}</span>
          {' · '}{alert.metric}: <span className="font-mono text-foreground/80">{alert.value}</span>
          {' (threshold '}<span className="font-mono text-foreground/60">{alert.threshold}</span>)
        </p>
        <p className="text-xs text-muted-foreground">Since {alert.since}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onMute(alert.id)}
        >
          <BellOff size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(alert.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

function CreateAlertDialog({ onAdd }: { onAdd: (a: Alert) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName]       = useState('');
  const [metric, setMetric]   = useState('');
  const [threshold, setThresh] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [workflow, setWorkflow] = useState('AI Support Agent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !metric || !threshold) {
      toast.error('Please fill in all required fields');
      return;
    }
    onAdd({
      id: `a-${Date.now()}`,
      name, metric,
      threshold: `> ${threshold}`,
      severity: severity as Alert['severity'],
      status: 'pending',
      value: '—',
      since: 'just now',
      workflow,
    });
    toast.success(`Alert "${name}" created`);
    setOpen(false);
    setName(''); setMetric(''); setThresh('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5">
          <Plus size={14} /> New Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Alert Rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Alert Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. High LLM Latency"
              className="h-8 text-sm bg-muted/30 border-border/60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Metric *</Label>
              <Input value={metric} onChange={e => setMetric(e.target.value)} placeholder="llm_latency_p99"
                className="h-8 text-sm bg-muted/30 border-border/60 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Threshold *</Label>
              <Input value={threshold} onChange={e => setThresh(e.target.value)} placeholder="3000ms"
                className="h-8 text-sm bg-muted/30 border-border/60" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-8 text-sm bg-muted/30 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Workflow</Label>
              <Input value={workflow} onChange={e => setWorkflow(e.target.value)}
                className="h-8 text-sm bg-muted/30 border-border/60" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Create Alert</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AlertManagement() {
  const [alertList, setAlertList] = useState<Alert[]>(initialAlerts);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = alertList.filter(a => statusFilter === 'all' || a.status === statusFilter);

  const handleDelete = (id: string) => {
    setAlertList(prev => prev.filter(a => a.id !== id));
    toast.success('Alert rule deleted');
  };
  const handleMute = (id: string) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a));
    toast.info('Alert muted');
  };
  const handleAdd = (a: Alert) => setAlertList(prev => [a, ...prev]);

  const counts = {
    firing:   alertList.filter(a => a.status === 'firing').length,
    pending:  alertList.filter(a => a.status === 'pending').length,
    resolved: alertList.filter(a => a.status === 'resolved').length,
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap animate-luminate-in">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground text-glow">Alert Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Threshold-based alert rules powered by SigNoz</p>
          </div>
          <CreateAlertDialog onAdd={handleAdd} />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 animate-luminate-in">
          {[
            { label: 'Firing',   count: counts.firing,   color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
            { label: 'Pending',  count: counts.pending,  color: 'text-accent',      bg: 'bg-accent/10 border-accent/20' },
            { label: 'Resolved', count: counts.resolved, color: 'text-muted-foreground', bg: 'bg-muted/20 border-border/40' },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setStatusFilter(statusFilter === s.label.toLowerCase() ? 'all' : s.label.toLowerCase())}
              className={cn(
                'luminate-card rounded-lg p-4 text-center border transition-all',
                statusFilter === s.label.toLowerCase() ? s.bg : ''
              )}
            >
              <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 flex-wrap animate-luminate-in">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-sm bg-muted/30 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="firing">Firing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} rules</span>
        </div>

        {/* Alert list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="luminate-card rounded-lg p-8 text-center animate-luminate-in">
              <Bell size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No alerts found</p>
            </div>
          ) : (
            filtered.map(a => (
              <AlertCard key={a.id} alert={a} onDelete={handleDelete} onMute={handleMute} />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
