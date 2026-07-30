import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces",
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.SERVICE_NAME || "yaatra-telemetry-gateway",
  }),

  traceExporter,
});

export async function startTelemetry() {
  await sdk.start();

  console.log("✅ OpenTelemetry initialized");
}

export async function shutdownTelemetry() {
  await sdk.shutdown();

  console.log("🛑 OpenTelemetry stopped");
}

export { sdk };