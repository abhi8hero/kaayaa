import { trace, SpanStatusCode } from "@opentelemetry/api";

export async function createWorkflowTrace(data) {

  const tracer = trace.getTracer("yaatra-agent-tracer");

  const span = tracer.startSpan(
    `${data.workflow || "workflow"} - ${data.event || "event"}`
  );

  try {

    span.setAttribute(
      "workflow.name",
      data.workflow || "Unknown Workflow"
    );

    span.setAttribute(
      "workflow.event",
      data.event || ""
    );

    span.setAttribute(
      "workflow.execution_id",
      data.executionId || ""
    );

    span.setAttribute(
      "workflow.trace_id",
      data.traceId || ""
    );

    span.setAttribute(
      "trip.id",
      data.tripId || ""
    );

    span.setAttribute(
      "trip.destination",
      data.destination || ""
    );


    // AI information
    span.setAttribute(
      "ai.model",
      data.llm || ""
    );

    span.setAttribute(
      "ai.tokens",
      Number(data.tokens || 0)
    );

    span.setAttribute(
      "ai.duration_ms",
      Number(data.duration || 0)
    );

    // Status
    if(data.status === "success") {
      span.setAttribute(
        "workflow.status",
        "completed"
      );
    }


    span.setStatus({
      code: SpanStatusCode.OK,
    });


    return {
      success:true
    };


  } catch(error){

      span.recordException(error);

      span.setAttribute(
        "error.type",
        error.name || "UnknownError"
      );

      span.setAttribute(
        "error.message",
        error.message || ""
      );

      span.setAttribute(
        "workflow.status",
        "failed"
      );

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message:error.message
      });

      throw error;

  } finally {

    span.end();

  }
}