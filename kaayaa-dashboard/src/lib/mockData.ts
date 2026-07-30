// Shared mock data for the observability platform

export type Status = 'success' | 'error' | 'warning' | 'running';

export interface WorkflowStat {
  id: string;
  name: string;
  executions: number;
  successRate: number;
  avgDuration: number;
  lastRun: string;
  status: Status;
}

export interface TraceSpan {
  id: string;
  name: string;
  service: string;
  duration: number;
  status: Status;
  start: number; // relative offset ms
  children?: TraceSpan[];
  attributes?: Record<string, string>;
}

export interface Trace {
  traceId: string;
  workflow: string;
  startTime: string;
  duration: number;
  status: Status;
  spans: number;
  service: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  traceId?: string;
}

export interface Alert {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'firing' | 'resolved' | 'pending';
  metric: string;
  threshold: string;
  value: string;
  since: string;
  workflow: string;
}

// Dashboard KPIs
export const kpis = {
  totalExecutions: 18472,
  successRate: 97.3,
  avgLatency: 342,
  errorRate: 2.7,
  llmTokensToday: 2_840_000,
  estimatedCost: 142.6,
  activeAlerts: 3,
  trackedWorkflows: 8,
};

// Trend data (last 24h, hourly)
export const executionTrend = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  executions: Math.floor(600 + Math.random() * 400),
  errors: Math.floor(5 + Math.random() * 25),
  latency: Math.floor(280 + Math.random() * 160),
}));

export const tokenUsageTrend = Array.from({ length: 7 }, (_, i) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    day: days[i],
    input: Math.floor(800_000 + Math.random() * 400_000),
    output: Math.floor(200_000 + Math.random() * 100_000),
  };
});

// Workflows
export const workflows: WorkflowStat[] = [
  { id: 'wf-1', name: 'AI Support Agent', executions: 5842, successRate: 98.2, avgDuration: 1240, lastRun: '2 min ago', status: 'success' },
  { id: 'wf-2', name: 'Data Enrichment Pipeline', executions: 3210, successRate: 96.7, avgDuration: 3420, lastRun: '5 min ago', status: 'success' },
  { id: 'wf-3', name: 'SRE Sidekick', executions: 1920, successRate: 94.1, avgDuration: 890, lastRun: '1 min ago', status: 'warning' },
  { id: 'wf-4', name: 'vLLM Inference Monitor', executions: 2104, successRate: 99.1, avgDuration: 210, lastRun: '30 sec ago', status: 'running' },
  { id: 'wf-5', name: 'Self-Healing Infra', executions: 843, successRate: 89.4, avgDuration: 5600, lastRun: '12 min ago', status: 'error' },
  { id: 'wf-6', name: 'Cost Optimizer', executions: 412, successRate: 97.8, avgDuration: 1100, lastRun: '8 min ago', status: 'success' },
];

// Traces
export const traces: Trace[] = Array.from({ length: 40 }, (_, i) => ({
  traceId: `trace-${Math.random().toString(36).slice(2, 10)}`,
  workflow: workflows[i % workflows.length].name,
  startTime: new Date(Date.now() - i * 90_000).toISOString(),
  duration: Math.floor(200 + Math.random() * 4000),
  status: (i % 12 === 0 ? 'error' : i % 7 === 0 ? 'warning' : 'success') as Status,
  spans: Math.floor(6 + Math.random() * 18),
  service: 'n8n-workflow',
}));

// Sample span tree for trace detail
export const sampleSpanTree: TraceSpan = {
  id: 'span-root',
  name: 'workflow.execute',
  service: 'n8n-workflow',
  duration: 1842,
  status: 'success',
  start: 0,
  attributes: { 'workflow.name': 'AI Support Agent', 'workflow.execution_id': 'exec-9f3a2b' },
  children: [
    {
      id: 'span-trigger',
      name: 'webhook.receive',
      service: 'n8n-webhook',
      duration: 12,
      status: 'success',
      start: 0,
      attributes: { 'http.method': 'POST', 'http.status_code': '200' },
    },
    {
      id: 'span-llm',
      name: 'llm.chat_completion',
      service: 'gemini-api',
      duration: 1120,
      status: 'success',
      start: 18,
      attributes: { 'llm.model': 'gemini-1.5-pro', 'llm.tokens_in': '842', 'llm.tokens_out': '312' },
      children: [
        {
          id: 'span-prompt',
          name: 'llm.prompt_build',
          service: 'gemini-api',
          duration: 8,
          status: 'success',
          start: 18,
          attributes: { 'llm.prompt_version': 'v2.3' },
        },
      ],
    },
    {
      id: 'span-db',
      name: 'db.query',
      service: 'postgres',
      duration: 84,
      status: 'success',
      start: 1150,
      attributes: { 'db.operation': 'SELECT', 'db.table': 'sessions' },
    },
    {
      id: 'span-http',
      name: 'http.get /api/context',
      service: 'context-api',
      duration: 210,
      status: 'warning',
      start: 1240,
      attributes: { 'http.status_code': '429', 'http.retry_count': '1' },
    },
    {
      id: 'span-respond',
      name: 'webhook.respond',
      service: 'n8n-webhook',
      duration: 6,
      status: 'success',
      start: 1836,
    },
  ],
};

// Logs
export const logs: LogEntry[] = [
  { id: 'l-1', timestamp: new Date(Date.now() - 5000).toISOString(), level: 'info', service: 'n8n-workflow', message: 'Workflow execution started: AI Support Agent', traceId: 'trace-ab12cd34' },
  { id: 'l-2', timestamp: new Date(Date.now() - 12000).toISOString(), level: 'info', service: 'gemini-api', message: 'LLM request sent — model: gemini-1.5-pro, tokens_in: 842', traceId: 'trace-ab12cd34' },
  { id: 'l-3', timestamp: new Date(Date.now() - 18000).toISOString(), level: 'warn', service: 'context-api', message: 'Rate limit hit — retrying in 1.2s (attempt 1/3)', traceId: 'trace-ab12cd34' },
  { id: 'l-4', timestamp: new Date(Date.now() - 25000).toISOString(), level: 'info', service: 'n8n-workflow', message: 'Workflow execution completed in 1842ms: AI Support Agent', traceId: 'trace-ab12cd34' },
  { id: 'l-5', timestamp: new Date(Date.now() - 60000).toISOString(), level: 'error', service: 'n8n-workflow', message: 'Workflow failed: Self-Healing Infra — max retries exceeded (3/3)', traceId: 'trace-ef56gh78' },
  { id: 'l-6', timestamp: new Date(Date.now() - 90000).toISOString(), level: 'debug', service: 'otel-collector', message: 'Flushed 128 spans to SigNoz — export latency: 34ms' },
  { id: 'l-7', timestamp: new Date(Date.now() - 120000).toISOString(), level: 'info', service: 'vllm', message: 'Inference completed — model: Llama-3-8b, throughput: 48 tokens/s' },
  { id: 'l-8', timestamp: new Date(Date.now() - 180000).toISOString(), level: 'warn', service: 'postgres', message: 'Slow query detected (312ms) — table: sessions, operation: SELECT' },
  { id: 'l-9', timestamp: new Date(Date.now() - 240000).toISOString(), level: 'info', service: 'n8n-workflow', message: 'Retry attempt 1/3 for node: HTTP Request', traceId: 'trace-ij90kl12' },
  { id: 'l-10', timestamp: new Date(Date.now() - 300000).toISOString(), level: 'error', service: 'context-api', message: 'Connection timeout after 5000ms', traceId: 'trace-mn34op56' },
];

// Alerts
export const alerts: Alert[] = [
  { id: 'a-1', name: 'High LLM Latency', severity: 'critical', status: 'firing', metric: 'llm_latency_p99', threshold: '> 3000ms', value: '4120ms', since: '5 min ago', workflow: 'AI Support Agent' },
  { id: 'a-2', name: 'Elevated Error Rate', severity: 'warning', status: 'firing', metric: 'workflow_error_rate', threshold: '> 10%', value: '10.6%', since: '12 min ago', workflow: 'Self-Healing Infra' },
  { id: 'a-3', name: 'Token Budget 80%', severity: 'info', status: 'pending', metric: 'daily_token_usage', threshold: '> 80%', value: '84%', since: '2 min ago', workflow: 'Data Enrichment Pipeline' },
  { id: 'a-4', name: 'DB Query Slow', severity: 'warning', status: 'resolved', metric: 'db_query_duration_p95', threshold: '> 300ms', value: '289ms', since: '45 min ago', workflow: 'SRE Sidekick' },
  { id: 'a-5', name: 'Retry Storm', severity: 'critical', status: 'resolved', metric: 'retry_count_rate', threshold: '> 50/min', value: '38/min', since: '1h ago', workflow: 'vLLM Inference Monitor' },
];

// Node metrics for workflow detail
export const nodeMetrics = [
  { node: 'Webhook Trigger', avgMs: 12, p99Ms: 28, successRate: 100, calls: 5842 },
  { node: 'LLM Call', avgMs: 1120, p99Ms: 3800, successRate: 98.4, calls: 5720 },
  { node: 'DB Query', avgMs: 84, p99Ms: 312, successRate: 99.6, calls: 5690 },
  { node: 'HTTP Request', avgMs: 210, p99Ms: 890, successRate: 96.8, calls: 5210 },
  { node: 'Conditional Branch', avgMs: 2, p99Ms: 5, successRate: 100, calls: 5842 },
  { node: 'Response', avgMs: 6, p99Ms: 14, successRate: 100, calls: 5710 },
];
