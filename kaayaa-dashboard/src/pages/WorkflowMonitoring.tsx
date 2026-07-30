import { useState } from 'react';
import { Activity, Clock, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import AppLayout from '@/components/layouts/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { workflows, nodeMetrics } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="luminate-card rounded-md px-3 py-2 text-xs border border-border/60">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}{p.unit ?? ''}
        </p>
      ))}
    </div>
  );
};

// Simulate execution history
const execHistory = Array.from({ length: 20 }, (_, i) => ({
  id: `exec-${Math.random().toString(36).slice(2, 8)}`,
  startTime: new Date(Date.now() - i * 180_000).toISOString(),
  duration: Math.floor(800 + Math.random() * 3200),
  status: (i % 10 === 0 ? 'error' : i % 6 === 0 ? 'warning' : 'success') as 'success' | 'error' | 'warning',
  spans: Math.floor(8 + Math.random() * 12),
  retries: i % 6 === 0 ? 1 : 0,
}));

const radarData = nodeMetrics.map(n => ({
  node: n.node.replace(' ', '\n'),
  perf: Math.round((1 - n.p99Ms / 5000) * 100),
  reliability: n.successRate,
  throughput: Math.round((n.calls / 6000) * 100),
}));

export default function WorkflowMonitoring() {
  const [selectedWf, setSelectedWf] = useState(workflows[0]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="animate-luminate-in">
          <h1 className="text-xl md:text-2xl font-bold text-foreground text-glow">Workflow Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Node execution analysis, topology, and execution history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Workflow list */}
          <div className="luminate-card rounded-lg p-3 space-y-1 animate-luminate-in lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">Instrumented Workflows</h2>
            {workflows.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWf(w)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-md transition-all',
                  selectedWf.id === w.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/30 border border-transparent'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{w.name}</span>
                  <StatusBadge status={w.status} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{w.executions.toLocaleString()} execs</span>
                  <span>{w.successRate}% success</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2 space-y-4 animate-luminate-in">
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Activity,     label: 'Executions',  value: selectedWf.executions.toLocaleString() },
                { icon: CheckCircle,  label: 'Success Rate',value: `${selectedWf.successRate}%` },
                { icon: Clock,        label: 'Avg Duration',value: `${selectedWf.avgDuration}ms` },
                { icon: RefreshCw,    label: 'Last Run',    value: selectedWf.lastRun },
              ].map(k => (
                <div key={k.label} className="luminate-card rounded-lg p-3 text-center">
                  <k.icon size={16} className="text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-base font-bold text-foreground">{k.value}</p>
                </div>
              ))}
            </div>

            {/* Node latency bar */}
            <div className="luminate-card rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Node Avg Latency (ms)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={nodeMetrics} layout="vertical" margin={{ top: 0, right: 50, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} unit="ms" />
                  <YAxis type="category" dataKey="node" tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)' }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgMs" fill="hsl(210 100% 60%)" radius={[0, 3, 3, 0]} name="Avg (ms)"
                    label={{ position: 'right', fontSize: 10, fill: 'hsl(0 0% 60%)', formatter: (v: number) => `${v}ms` }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="luminate-card rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Node Health Radar (Normalized Score)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(0 0% 20%)" />
                  <PolarAngleAxis dataKey="node" tick={{ fontSize: 9, fill: 'hsl(0 0% 50%)' }} />
                  <Radar name="Performance" dataKey="perf"       stroke="hsl(210 100% 60%)" fill="hsl(210 100% 60%)" fillOpacity={0.15} />
                  <Radar name="Reliability" dataKey="reliability" stroke="hsl(142 70% 45%)" fill="hsl(142 70% 45%)" fillOpacity={0.15} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Execution history */}
        <div className="luminate-card rounded-lg p-4 animate-luminate-in">
          <h2 className="text-sm font-semibold text-foreground mb-3">Execution History · {selectedWf.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-2 w-6" />
                  <th className="text-left py-2 pr-4 font-medium whitespace-nowrap">Execution ID</th>
                  <th className="text-left py-2 pr-4 font-medium whitespace-nowrap">Start Time</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">Duration</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">Spans</th>
                  <th className="text-left py-2 pr-4 font-medium whitespace-nowrap">Status</th>
                  <th className="text-right py-2 font-medium whitespace-nowrap">Retries</th>
                </tr>
              </thead>
              <tbody>
                {execHistory.map(ex => (
                  <>
                    <tr
                      key={ex.id}
                      onClick={() => toggle(ex.id)}
                      className="border-b border-border/40 hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pl-2">
                        {expanded.has(ex.id)
                          ? <ChevronDown size={14} className="text-muted-foreground" />
                          : <ChevronRight size={14} className="text-muted-foreground" />
                        }
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-primary whitespace-nowrap">{ex.id}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(ex.startTime).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-mono text-muted-foreground whitespace-nowrap">{ex.duration}ms</td>
                      <td className="py-2.5 pr-4 text-right text-muted-foreground whitespace-nowrap">{ex.spans}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap"><StatusBadge status={ex.status} /></td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {ex.retries > 0
                          ? <span className="text-accent font-mono">{ex.retries}×</span>
                          : <span className="text-muted-foreground/40">—</span>
                        }
                      </td>
                    </tr>
                    {expanded.has(ex.id) && (
                      <tr key={`${ex.id}-detail`} className="border-b border-border/20 bg-muted/5">
                        <td colSpan={7} className="px-6 py-3">
                          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                            <span>trace_id: <span className="text-primary font-mono">{ex.id}-trace</span></span>
                            <span>service: <span className="text-foreground/70">n8n-workflow</span></span>
                            <span>spans exported: <span className="text-foreground/70">{ex.spans}</span></span>
                            {ex.retries > 0 && <span className="text-accent">⚠ {ex.retries} retry attempt(s)</span>}
                            {ex.status === 'error' && <span className="text-destructive">✕ Execution failed — check logs for trace context</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
