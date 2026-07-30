import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IntegrationStatus {
  connected: boolean;
  latency?: number;
  version?: string;
}

const INITIAL_CONFIG = {
  signozEndpoint: 'http://localhost:4317',
  signozApiKey: '',
  collectorEndpoint: 'http://localhost:4318',
  serviceName: 'n8n-observability-platform',
  n8nWebhookUrl: 'http://localhost:5678/webhook',
  n8nApiKey: '',
  samplingRate: '1.0',
  batchTimeout: '5000',
  exportInterval: '60',
};

const STATUS_MOCK: Record<string, IntegrationStatus> = {
  signoz:    { connected: true,  latency: 12,  version: '0.40.0' },
  collector: { connected: true,  latency: 3,   version: '0.95.0' },
  n8n:       { connected: true,  latency: 28,  version: '1.36.0' },
  llm:       { connected: false },
};

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs font-medium',
      connected ? 'text-[hsl(142_70%_45%)]' : 'text-destructive'
    )}>
      {connected
        ? <CheckCircle size={13} />
        : <XCircle size={13} />
      }
      {connected ? 'Connected' : 'Disconnected'}
    </span>
  );
}

function Section({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="luminate-card rounded-lg overflow-hidden animate-luminate-in">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/10 transition-colors"
      >
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

export default function IntegrationConfig() {
  const [cfg, setCfg] = useState(INITIAL_CONFIG);
  const [statuses] = useState(STATUS_MOCK);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof INITIAL_CONFIG) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCfg(prev => ({ ...prev, [key]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    toast.success('Integration configuration saved');
  };

  const handleTest = (service: string) => {
    toast.info(`Testing ${service} connection…`, { duration: 1500 });
    setTimeout(() => {
      if (statuses[service]?.connected) {
        toast.success(`${service} connection OK — latency: ${statuses[service].latency}ms`);
      } else {
        toast.error(`${service} connection failed — check endpoint and credentials`);
      }
    }, 1600);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap animate-luminate-in">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground text-glow">Integration Configuration</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure SigNoz, OTel Collector, n8n, and telemetry settings</p>
          </div>
          <Button size="sm" onClick={handleSave} className={cn('h-8', saved && 'bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_40%)]')}>
            {saved ? <><CheckCircle size={13} className="mr-1.5" />Saved</> : 'Save Configuration'}
          </Button>
        </div>

        {/* Health overview */}
        <div className="luminate-card rounded-lg p-4 animate-luminate-in">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Integration Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'signoz',    label: 'SigNoz',         version: statuses.signoz.version },
              { key: 'collector', label: 'OTel Collector', version: statuses.collector.version },
              { key: 'n8n',       label: 'n8n',            version: statuses.n8n.version },
              { key: 'llm',       label: 'LLM API',        version: undefined },
            ].map(s => (
              <div key={s.key} className="bg-muted/20 rounded-md p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">{s.label}</span>
                  {statuses[s.key]?.connected
                    ? <CheckCircle size={13} className="text-[hsl(142_70%_45%)] shrink-0" />
                    : <XCircle    size={13} className="text-destructive shrink-0" />
                  }
                </div>
                <StatusDot connected={statuses[s.key]?.connected ?? false} />
                {s.version && <p className="text-xs text-muted-foreground mt-1">v{s.version}</p>}
                {statuses[s.key]?.latency && (
                  <p className="text-xs text-muted-foreground">{statuses[s.key].latency}ms latency</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SigNoz */}
        <Section title="SigNoz Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="SigNoz Endpoint" hint="OTLP gRPC endpoint (default port 4317)">
              <Input value={cfg.signozEndpoint} onChange={set('signozEndpoint')}
                className="h-8 text-sm bg-muted/30 border-border/60 font-mono" />
            </Field>
            <Field label="API Key (optional)" hint="Required for SigNoz Cloud">
              <Input value={cfg.signozApiKey} onChange={set('signozApiKey')} type="password"
                placeholder="sig-key-xxxxxxxxxxxx"
                className="h-8 text-sm bg-muted/30 border-border/60 font-mono" />
            </Field>
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="ghost" size="sm" className="h-7 text-xs border border-border/40 text-muted-foreground"
              onClick={() => handleTest('signoz')}>
              Test Connection
            </Button>
          </div>
        </Section>

        {/* OTel Collector */}
        <Section title="OpenTelemetry Collector">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Collector Endpoint" hint="OTLP HTTP endpoint (default port 4318)">
              <Input value={cfg.collectorEndpoint} onChange={set('collectorEndpoint')}
                className="h-8 text-sm bg-muted/30 border-border/60 font-mono" />
            </Field>
            <Field label="Service Name" hint="Identifies this deployment in SigNoz">
              <Input value={cfg.serviceName} onChange={set('serviceName')}
                className="h-8 text-sm bg-muted/30 border-border/60 font-mono" />
            </Field>
            <Field label="Sampling Rate" hint="1.0 = 100%, 0.1 = 10% of traces sampled">
              <Input value={cfg.samplingRate} onChange={set('samplingRate')} type="number" min="0" max="1" step="0.1"
                className="h-8 text-sm bg-muted/30 border-border/60" />
            </Field>
            <Field label="Batch Timeout (ms)" hint="Max time to wait before exporting a batch">
              <Input value={cfg.batchTimeout} onChange={set('batchTimeout')} type="number"
                className="h-8 text-sm bg-muted/30 border-border/60" />
            </Field>
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="ghost" size="sm" className="h-7 text-xs border border-border/40 text-muted-foreground"
              onClick={() => handleTest('collector')}>
              Test Connection
            </Button>
          </div>
        </Section>

        {/* n8n */}
        <Section title="n8n Workflow Integration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="n8n Webhook URL" hint="Base URL for n8n webhook triggers">
              <Input value={cfg.n8nWebhookUrl} onChange={set('n8nWebhookUrl')}
                className="h-8 text-sm bg-muted/30 border-border/60 font-mono" />
            </Field>
            <Field label="n8n API Key" hint="Used to query workflow execution status">
              <Input value={cfg.n8nApiKey} onChange={set('n8nApiKey')} type="password"
                placeholder="n8n_api_xxxxxxxxxxxx"
                className="h-8 text-sm bg-muted/30 border-border/60 font-mono" />
            </Field>
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="ghost" size="sm" className="h-7 text-xs border border-border/40 text-muted-foreground"
              onClick={() => handleTest('n8n')}>
              Test Connection
            </Button>
          </div>
        </Section>

        {/* Metrics export */}
        <Section title="Metrics & Export Settings" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Metrics Export Interval (s)" hint="How often metrics are pushed to SigNoz">
              <Input value={cfg.exportInterval} onChange={set('exportInterval')} type="number"
                className="h-8 text-sm bg-muted/30 border-border/60" />
            </Field>
          </div>
          <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                All telemetry (traces, metrics, logs) is exported via OpenTelemetry Protocol (OTLP) to the collector,
                which forwards data to SigNoz. No data is stored locally. Sampling rate applies to traces only;
                metrics and logs are always fully exported.
              </p>
            </div>
          </div>
        </Section>

        {/* OTel instrumentation guide */}
        <Section title="Instrumentation Template" defaultOpen={false}>
          <p className="text-xs text-muted-foreground mb-3">
            Apply this template to any n8n workflow to enable full OTel observability without modifying core logic.
          </p>
          <div className="rounded-md bg-muted/20 border border-border/40 p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre">{`// n8n Execute Code node — paste at workflow start
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const exporter = new OTLPTraceExporter({
  url: '${cfg.collectorEndpoint}/v1/traces',
});
const sdk = new NodeSDK({ traceExporter: exporter });
sdk.start();

// Wrap each node with a span:
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('${cfg.serviceName}');

const span = tracer.startSpan('node.execute', {
  attributes: {
    'workflow.name': $workflow.name,
    'node.name':     $node.name,
    'execution.id':  $execution.id,
  },
});
try {
  // ... your node logic ...
  span.setStatus({ code: 1 }); // OK
} catch (err) {
  span.recordException(err);
  span.setStatus({ code: 2, message: err.message }); // ERROR
} finally {
  span.end();
}`}</pre>
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}
