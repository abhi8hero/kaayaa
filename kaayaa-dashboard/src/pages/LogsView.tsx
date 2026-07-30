import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logs } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const LEVEL_STYLES: Record<string, string> = {
  info:  'text-primary bg-primary/10 border-primary/20',
  warn:  'text-accent bg-accent/10 border-accent/20',
  error: 'text-destructive bg-destructive/10 border-destructive/20',
  debug: 'text-muted-foreground bg-muted/30 border-border/40',
};

// Expand the mock log list to 40+ entries
const expandedLogs = [
  ...logs,
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `l-gen-${i}`,
    timestamp: new Date(Date.now() - (i + 10) * 28_000).toISOString(),
    level: (['info', 'warn', 'error', 'debug'] as const)[i % 4],
    service: (['n8n-workflow', 'gemini-api', 'postgres', 'otel-collector', 'context-api', 'vllm'] as const)[i % 6],
    message: [
      'Span exported to SigNoz: workflow.execute (trace-id=abc123)',
      'LLM response received — model: gemini-1.5-flash, latency: 620ms',
      'Database connection pool at 82% capacity',
      'Node execution completed: HTTP Request (220ms)',
      'Conditional branch evaluated — path: success',
      'Loop iteration 3/10 completed (duration: 145ms)',
      'Error handler triggered: timeout_exceeded',
      'Retry attempt 2/3 for node: LLM Call',
      'Workflow execution queued: Data Enrichment Pipeline',
      'Span attributes recorded: llm.tokens_in=640 llm.tokens_out=280',
    ][i % 10],
    traceId: i % 3 === 0 ? `trace-${Math.random().toString(36).slice(2, 10)}` : undefined,
  })),
];

export default function LogsView() {
  const [query, setQuery]   = useState('');
  const [level, setLevel]   = useState('all');
  const [service, setService] = useState('all');

  const services = useMemo(() => {
    const s = new Set(expandedLogs.map(l => l.service));
    return Array.from(s);
  }, []);

  const filtered = useMemo(() => expandedLogs.filter(l => {
    const matchQ = !query || l.message.toLowerCase().includes(query.toLowerCase()) || (l.traceId ?? '').includes(query);
    const matchL = level === 'all' || l.level === level;
    const matchS = service === 'all' || l.service === service;
    return matchQ && matchL && matchS;
  }), [query, level, service]);

  const counts = useMemo(() => ({
    info:  expandedLogs.filter(l => l.level === 'info').length,
    warn:  expandedLogs.filter(l => l.level === 'warn').length,
    error: expandedLogs.filter(l => l.level === 'error').length,
    debug: expandedLogs.filter(l => l.level === 'debug').length,
  }), []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="animate-luminate-in">
          <h1 className="text-xl md:text-2xl font-bold text-foreground text-glow">Logs View</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Correlated logs from all instrumented services</p>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-2 animate-luminate-in">
          {(Object.entries(counts) as [string, number][]).map(([l, n]) => (
            <button
              key={l}
              onClick={() => setLevel(level === l ? 'all' : l)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all',
                level === l ? LEVEL_STYLES[l] : 'text-muted-foreground border-border bg-muted/20 hover:bg-muted/40'
              )}
            >
              {l.toUpperCase()} <span className="font-mono">{n}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="luminate-card rounded-lg p-3 flex flex-col md:flex-row gap-3 animate-luminate-in">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search message or trace ID..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/30 border-border/60"
            />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full md:w-32 h-8 text-sm bg-muted/30 border-border/60">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">INFO</SelectItem>
              <SelectItem value="warn">WARN</SelectItem>
              <SelectItem value="error">ERROR</SelectItem>
              <SelectItem value="debug">DEBUG</SelectItem>
            </SelectContent>
          </Select>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="w-full md:w-44 h-8 text-sm bg-muted/30 border-border/60">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground self-center shrink-0">{filtered.length} entries</span>
        </div>

        {/* Log stream */}
        <div className="luminate-card rounded-lg overflow-hidden animate-luminate-in">
          <div className="px-4 py-2 border-b border-border bg-muted/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(142_70%_45%)] animate-pulse" />
            <span className="text-xs text-muted-foreground">Live log stream</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono min-w-[700px]">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 px-4 font-medium whitespace-nowrap w-36">Timestamp</th>
                  <th className="text-left py-2 pr-3 font-medium whitespace-nowrap w-16">Level</th>
                  <th className="text-left py-2 pr-3 font-medium whitespace-nowrap w-32">Service</th>
                  <th className="text-left py-2 pr-3 font-medium">Message</th>
                  <th className="text-left py-2 pr-4 font-medium whitespace-nowrap w-28">Trace ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className={cn(
                    'border-b border-border/20 hover:bg-muted/10 transition-colors',
                    l.level === 'error' && 'bg-destructive/5 hover:bg-destructive/8'
                  )}>
                    <td className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase',
                        LEVEL_STYLES[l.level]
                      )}>
                        {l.level}
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span className="text-primary/70">{l.service}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={l.level === 'error' ? 'text-destructive' : l.level === 'warn' ? 'text-accent' : 'text-foreground/80'}>
                        {l.message}
                      </span>
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {l.traceId ? (
                        <span className="text-primary/60 truncate block max-w-[100px]" title={l.traceId}>
                          {l.traceId.slice(0, 12)}…
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
