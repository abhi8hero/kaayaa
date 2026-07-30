import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Legend
} from 'recharts';
import AppLayout from '@/components/layouts/AppLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { executionTrend, nodeMetrics, workflows } from '@/lib/mockData';

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

// Simulated LLM latency data
const llmLatency = executionTrend.map(d => ({
  hour: d.hour,
  p50: Math.floor(800 + Math.random() * 300),
  p95: Math.floor(2000 + Math.random() * 800),
  p99: Math.floor(3200 + Math.random() * 1200),
}));

// Simulated token data
const tokenData = executionTrend.map(d => ({
  hour: d.hour,
  input:  Math.floor(40000 + Math.random() * 30000),
  output: Math.floor(8000  + Math.random() * 6000),
  cost:   parseFloat((Math.random() * 0.8 + 0.1).toFixed(3)),
}));

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function MetricsView() {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap animate-luminate-in">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground text-glow">Metrics View</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Workflow, LLM, and infrastructure performance metrics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 h-8 text-sm bg-muted/30 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1h</SelectItem>
              <SelectItem value="6h">Last 6h</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Workflow metrics */}
        <div className="luminate-card rounded-lg p-4 animate-luminate-in">
          <SectionTitle title="Workflow Execution Metrics" sub="Executions and error count over time" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={executionTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(0 0% 55%)' }} />
              <Line type="monotone" dataKey="executions" stroke="hsl(210 100% 60%)" strokeWidth={1.5} dot={false} name="Executions" />
              <Line type="monotone" dataKey="errors"     stroke="hsl(0 72% 50%)"   strokeWidth={1.5} dot={false} name="Errors" />
              <Line type="monotone" dataKey="latency"    stroke="hsl(38 95% 55%)"  strokeWidth={1.5} dot={false} name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* LLM latency */}
        <div className="luminate-card rounded-lg p-4 animate-luminate-in">
          <SectionTitle title="LLM Latency Percentiles" sub="p50 / p95 / p99 response time from Gemini API" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={llmLatency} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} unit="ms" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(0 0% 55%)' }} />
              <ReferenceLine y={3000} stroke="hsl(0 72% 50%)" strokeDasharray="4 2" label={{ value: 'Alert threshold', fill: 'hsl(0 72% 50%)', fontSize: 10 }} />
              <Line type="monotone" dataKey="p50" stroke="hsl(142 70% 45%)" strokeWidth={1.5} dot={false} name="p50 (ms)" />
              <Line type="monotone" dataKey="p95" stroke="hsl(38 95% 55%)"  strokeWidth={1.5} dot={false} name="p95 (ms)" />
              <Line type="monotone" dataKey="p99" stroke="hsl(0 72% 50%)"   strokeWidth={1.5} dot={false} name="p99 (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Token & cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="luminate-card rounded-lg p-4 animate-luminate-in">
            <SectionTitle title="Token Usage per Hour" sub="Input vs output tokens" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tokenData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(0 0% 55%)' }} />
                <Bar dataKey="input"  fill="hsl(210 100% 60%)" radius={[2, 2, 0, 0]} name="Input tokens" />
                <Bar dataKey="output" fill="hsl(280 65% 60%)"  radius={[2, 2, 0, 0]} name="Output tokens" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="luminate-card rounded-lg p-4 animate-luminate-in">
            <SectionTitle title="Estimated Cost per Hour" sub="Based on Gemini token pricing" />
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tokenData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} unit="$" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="cost" stroke="hsl(38 95% 55%)" strokeWidth={2} dot={false} name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Node-level metrics table */}
        <div className="luminate-card rounded-lg p-4 animate-luminate-in">
          <SectionTitle title="Node-Level Performance Metrics" sub="Per-node execution time and success rates for AI Support Agent" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-2 pr-4 font-medium whitespace-nowrap">Node</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">Avg (ms)</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">p99 (ms)</th>
                  <th className="text-right py-2 pr-4 font-medium whitespace-nowrap">Success Rate</th>
                  <th className="text-right py-2 font-medium whitespace-nowrap">Total Calls</th>
                </tr>
              </thead>
              <tbody>
                {nodeMetrics.map(n => (
                  <tr key={n.node} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">{n.node}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-muted-foreground whitespace-nowrap">{n.avgMs}</td>
                    <td className="py-2.5 pr-4 text-right font-mono whitespace-nowrap">
                      <span className={n.p99Ms > 500 ? 'text-accent' : 'text-muted-foreground'}>{n.p99Ms}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden hidden md:block">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${n.successRate}%`,
                              background: n.successRate >= 99 ? 'hsl(142 70% 45%)' : n.successRate >= 96 ? 'hsl(38 95% 55%)' : 'hsl(0 72% 50%)',
                            }}
                          />
                        </div>
                        <span className={
                          n.successRate >= 99 ? 'text-[hsl(142_70%_45%)]' :
                          n.successRate >= 96 ? 'text-accent' : 'text-destructive'
                        }>{n.successRate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground font-mono whitespace-nowrap">{n.calls.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow comparison */}
        <div className="luminate-card rounded-lg p-4 animate-luminate-in">
          <SectionTitle title="Workflow Success Rate Comparison" sub="Success rate per workflow — last 24h" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={workflows.map(w => ({ name: w.name.split(' ').slice(0, 2).join(' '), rate: w.successRate }))}
              layout="vertical"
              margin={{ top: 4, right: 40, bottom: 0, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" horizontal={false} />
              <XAxis type="number" domain={[80, 100]} tick={{ fontSize: 10, fill: 'hsl(0 0% 45%)' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(0 0% 55%)' }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="rate"
                name="Success Rate (%)"
                radius={[0, 3, 3, 0]}
                fill="hsl(210 100% 60%)"
                label={{ position: 'right', fontSize: 10, fill: 'hsl(0 0% 60%)', formatter: (v: number) => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
}
