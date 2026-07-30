import { useMemo } from 'react';
import { Activity, Zap, AlertTriangle, TrendingUp, DollarSign, Cpu, CheckCircle, Clock } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import AppLayout from '@/components/layouts/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { kpis, executionTrend, tokenUsageTrend, workflows, alerts } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(210 100% 60%)',
  'hsl(142 70% 45%)',
  'hsl(38 95% 55%)',
  'hsl(280 65% 60%)',
  'hsl(0 72% 50%)',
];

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="luminate-card rounded-lg p-4 flex flex-col gap-3 animate-luminate-in">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={cn('w-8 h-8 rounded-md flex items-center justify-center shrink-0', color)}>
          <Icon size={15} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="luminate-card rounded-md px-3 py-2 text-xs border border-border/60">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.value > 10000 ? (p.value / 1000).toFixed(0) + 'k' : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const pieData = useMemo(() => [
    { name: 'AI Support Agent', value: 5842 },
    { name: 'Data Enrichment', value: 3210 },
    { name: 'vLLM Monitor', value: 2104 },
    { name: 'SRE Sidekick', value: 1920 },
    { name: 'Others', value: 1396 },
  ], []);

  const firingAlerts = alerts.filter(a => a.status === 'firing');

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="animate-luminate-in">
          <h1 className="text-xl md:text-2xl font-bold text-foreground text-glow">Observability Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time AI agent execution metrics · SigNoz powered</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={Activity}      label="Total Executions"  value={kpis.totalExecutions.toLocaleString()} sub="Last 24 hours"         color="bg-primary/10 text-primary" />
          <KpiCard icon={CheckCircle}   label="Success Rate"      value={`${kpis.successRate}%`}               sub="↑ 0.4% vs yesterday"    color="bg-[hsl(142_70%_45%/0.15)] text-[hsl(142_70%_45%)]" />
          <KpiCard icon={Clock}         label="Avg Latency"       value={`${kpis.avgLatency}ms`}               sub="p50 across all workflows" color="bg-accent/10 text-accent" />
          <KpiCard icon={AlertTriangle} label="Active Alerts"     value={String(kpis.activeAlerts)}            sub={`${kpis.errorRate}% error rate`} color="bg-destructive/10 text-destructive" />
          <KpiCard icon={Cpu}           label="LLM Tokens Today"  value={`${(kpis.llmTokensToday / 1_000_000).toFixed(1)}M`} sub="input + output combined" color="bg-[hsl(280_65%_60%/0.15)] text-[hsl(280_65%_60%)]" />
          <KpiCard icon={DollarSign}    label="Est. Cost Today"   value={`$${kpis.estimatedCost}`}             sub="Based on token pricing"  color="bg-accent/10 text-accent" />
          <KpiCard icon={TrendingUp}    label="Workflows Tracked" value={String(kpis.trackedWorkflows)}        sub="Instrumented with OTel"  color="bg-primary/10 text-primary" />
          <KpiCard icon={Zap}           label="Spans Exported"    value="284k"                                 sub="To SigNoz via OTel Collector" color="bg-[hsl(142_70%_45%/0.15)] text-[hsl(142_70%_45%)]" />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Execution trend */}
          <div className="luminate-card rounded-lg p-4 animate-luminate-in">
            <h2 className="text-sm font-semibold text-foreground mb-4">Executions & Errors (24h)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={executionTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="exGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210 100% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210 100% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 72% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0 72% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="executions" stroke="hsl(210 100% 60%)" fill="url(#exGrad)" strokeWidth={1.5} dot={false} name="Executions" />
                <Area type="monotone" dataKey="errors" stroke="hsl(0 72% 50%)" fill="url(#errGrad)" strokeWidth={1.5} dot={false} name="Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Token usage */}
          <div className="luminate-card rounded-lg p-4 animate-luminate-in">
            <h2 className="text-sm font-semibold text-foreground mb-4">Token Usage (7 days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tokenUsageTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="input"  fill="hsl(210 100% 60%)" radius={[2, 2, 0, 0]} name="Input" />
                <Bar dataKey="output" fill="hsl(280 65% 60%)"  radius={[2, 2, 0, 0]} name="Output" />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: 'hsl(0 0% 55%)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Workflow distribution pie */}
          <div className="luminate-card rounded-lg p-4 animate-luminate-in">
            <h2 className="text-sm font-semibold text-foreground mb-4">Execution Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8, color: 'hsl(0 0% 55%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent alerts */}
          <div className="luminate-card rounded-lg p-4 animate-luminate-in md:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-3">Active Alerts</h2>
            <div className="space-y-2">
              {firingAlerts.map(a => (
                <div key={a.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                  <StatusBadge status={a.severity} label={a.severity.charAt(0).toUpperCase() + a.severity.slice(1)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.workflow} · {a.metric}: {a.value} (threshold {a.threshold})</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{a.since}</span>
                </div>
              ))}
              {firingAlerts.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No active alerts</p>
              )}
            </div>
          </div>
        </div>

        {/* Workflow health table */}
        <div className="luminate-card rounded-lg p-4 animate-luminate-in">
          <h2 className="text-sm font-semibold text-foreground mb-3">Workflow Health Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-2 pr-4 font-medium whitespace-nowrap">Workflow</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">Executions</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">Success Rate</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">Avg Duration</th>
                  <th className="text-left py-2 pr-4 font-medium whitespace-nowrap">Last Run</th>
                  <th className="text-left py-2 font-medium whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map(w => (
                  <tr key={w.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">{w.name}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground whitespace-nowrap">{w.executions.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                      <span className={w.successRate >= 97 ? 'text-[hsl(142_70%_45%)]' : w.successRate >= 93 ? 'text-accent' : 'text-destructive'}>
                        {w.successRate}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground whitespace-nowrap">{w.avgDuration.toLocaleString()}ms</td>
                    <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">{w.lastRun}</td>
                    <td className="py-2.5 whitespace-nowrap"><StatusBadge status={w.status} /></td>
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
