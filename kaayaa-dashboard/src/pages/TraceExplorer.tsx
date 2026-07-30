import { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, X } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { traces, sampleSpanTree, workflows } from '@/lib/mockData';
import type { TraceSpan, Trace } from '@/lib/mockData';
import { cn } from '@/lib/utils';

// ── Span tree ──────────────────────────────────────────────────────────────
const TOTAL_WIDTH_MS = 2000;

function SpanRow({ span, depth = 0, totalMs }: { span: TraceSpan; depth?: number; totalMs: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = (span.children?.length ?? 0) > 0;

  const leftPct  = (span.start / totalMs) * 100;
  const widthPct = Math.max((span.duration / totalMs) * 100, 0.5);

  const barColor =
    span.status === 'error'   ? 'bg-destructive'                 :
    span.status === 'warning' ? 'bg-accent'                      :
    span.service === 'gemini-api' ? 'bg-[hsl(280_65%_60%)]'     :
    span.service === 'postgres'   ? 'bg-[hsl(142_70%_45%)]'     :
    'bg-primary';

  return (
    <>
      <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
        {/* Name */}
        <td className="py-2 pr-3 min-w-0" style={{ paddingLeft: `${depth * 20 + 8}px` }}>
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <button onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground shrink-0">
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-[14px] shrink-0" />
            )}
            <span className="text-xs font-mono text-foreground truncate max-w-[200px]" title={span.name}>{span.name}</span>
          </div>
        </td>
        {/* Service */}
        <td className="py-2 pr-3 whitespace-nowrap">
          <span className="text-xs text-muted-foreground font-mono">{span.service}</span>
        </td>
        {/* Status */}
        <td className="py-2 pr-3 whitespace-nowrap">
          <StatusBadge status={span.status} />
        </td>
        {/* Duration bar */}
        <td className="py-2 w-full min-w-[140px]">
          <div className="relative h-4 rounded overflow-hidden bg-muted/30">
            <div
              className={cn('absolute top-0 h-full rounded opacity-80', barColor)}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{span.duration}ms</span>
        </td>
      </tr>
      {open && span.children?.map(child => (
        <SpanRow key={child.id} span={child} depth={depth + 1} totalMs={totalMs} />
      ))}
    </>
  );
}

// ── Trace detail panel ─────────────────────────────────────────────────────
function TraceDetail({ trace, onClose }: { trace: Trace; onClose: () => void }) {
  return (
    <div className="luminate-card rounded-lg p-4 animate-luminate-in">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-foreground">{trace.workflow}</h2>
            <StatusBadge status={trace.status} />
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{trace.traceId}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 h-7 w-7">
          <X size={14} />
        </Button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Duration', value: `${trace.duration}ms` },
          { label: 'Spans', value: String(trace.spans) },
          { label: 'Service', value: trace.service },
          { label: 'Start', value: new Date(trace.startTime).toLocaleTimeString() },
        ].map(m => (
          <div key={m.label} className="bg-muted/30 rounded-md p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">{m.label}</p>
            <p className="text-sm font-medium text-foreground font-mono">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Span tree */}
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Span Waterfall</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-1.5 pr-3 font-medium whitespace-nowrap">Span / Operation</th>
              <th className="text-left py-1.5 pr-3 font-medium whitespace-nowrap">Service</th>
              <th className="text-left py-1.5 pr-3 font-medium whitespace-nowrap">Status</th>
              <th className="text-left py-1.5 font-medium whitespace-nowrap">Timeline ({TOTAL_WIDTH_MS}ms)</th>
            </tr>
          </thead>
          <tbody>
            <SpanRow span={sampleSpanTree} totalMs={TOTAL_WIDTH_MS} />
          </tbody>
        </table>
      </div>

      {/* Attributes */}
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2">Root Span Attributes</h3>
      <div className="bg-muted/20 rounded-md p-3 space-y-1.5">
        {Object.entries(sampleSpanTree.attributes ?? {}).map(([k, v]) => (
          <div key={k} className="flex gap-2 text-xs font-mono">
            <span className="text-primary shrink-0">{k}:</span>
            <span className="text-foreground/80">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TraceExplorer() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [selected, setSelected] = useState<Trace | null>(null);

  const filtered = useMemo(() => traces.filter(t => {
    const matchesQuery = !query || t.traceId.includes(query) || t.workflow.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesWorkflow = workflowFilter === 'all' || t.workflow === workflowFilter;
    return matchesQuery && matchesStatus && matchesWorkflow;
  }), [query, statusFilter, workflowFilter]);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="animate-luminate-in">
          <h1 className="text-xl md:text-2xl font-bold text-foreground text-glow">Trace Explorer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Distributed traces across all instrumented n8n workflows</p>
        </div>

        {/* Filters */}
        <div className="luminate-card rounded-lg p-3 flex flex-col md:flex-row gap-3 animate-luminate-in">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search trace ID or workflow..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/30 border-border/60"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-36 h-8 text-sm bg-muted/30 border-border/60">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
            <SelectTrigger className="w-full md:w-52 h-8 text-sm bg-muted/30 border-border/60">
              <SelectValue placeholder="Workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              {workflows.map(w => (
                <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground self-center shrink-0">{filtered.length} traces</span>
        </div>

        {/* Detail panel */}
        {selected && (
          <TraceDetail trace={selected} onClose={() => setSelected(null)} />
        )}

        {/* Trace list */}
        <div className="luminate-card rounded-lg overflow-hidden animate-luminate-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-2.5 px-4 font-medium whitespace-nowrap">Trace ID</th>
                  <th className="text-left py-2.5 pr-4 font-medium whitespace-nowrap">Workflow</th>
                  <th className="text-left py-2.5 pr-4 font-medium whitespace-nowrap">Status</th>
                  <th className="text-right py-2.5 pr-4 font-medium whitespace-nowrap">Duration</th>
                  <th className="text-right py-2.5 pr-4 font-medium whitespace-nowrap">Spans</th>
                  <th className="text-left py-2.5 pr-4 font-medium whitespace-nowrap">Start Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr
                    key={t.traceId}
                    onClick={() => setSelected(t)}
                    className={cn(
                      'border-b border-border/40 hover:bg-muted/20 cursor-pointer transition-colors',
                      selected?.traceId === t.traceId && 'bg-primary/5 border-l-2 border-l-primary'
                    )}
                  >
                    <td className="py-2.5 px-4 font-mono text-xs text-primary whitespace-nowrap">{t.traceId}</td>
                    <td className="py-2.5 pr-4 text-foreground whitespace-nowrap">{t.workflow}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap"><StatusBadge status={t.status} /></td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground font-mono whitespace-nowrap">{t.duration}ms</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground whitespace-nowrap">{t.spans}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(t.startTime).toLocaleTimeString()}
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
