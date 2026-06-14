# Local development guide

This guide provides instructions for setting up and using local development
features for A-Coder CLI.

## Tracing

A-Coder CLI uses OpenTelemetry (OTel) to record traces that help you debug agent
behavior. Traces instrument key events like model calls, tool scheduler
operations, and tool calls.

Traces provide deep visibility into agent behavior and help you debug complex
issues. They are captured automatically when you enable telemetry.

### View traces

You can view traces using Jaeger or any OTel-compatible backend.

#### Use Jaeger

You can view traces in the Jaeger UI for local development.

1.  **Start the telemetry collector:**

    Run the following command in your terminal to download and start Jaeger and
    an OTel collector:

    ```bash
    npm run telemetry -- --target=local
    ```

    This command configures your workspace for local telemetry and provides a
    link to the Jaeger UI (usually `http://localhost:16686`).
    - **Collector logs:** `~/.a-coder/tmp/<projectHash>/otel/collector.log`

2.  **Run A-Coder CLI:**

    In a separate terminal, run your A-Coder CLI command:

    ```bash
    a-coder-cli
    ```

3.  **View the traces:**

    After running your command, open the Jaeger UI link in your browser to view
    the traces.

For more detailed information on telemetry, see the
[telemetry documentation](./cli/telemetry.md).

### Instrument code with traces

You can add traces to your own code for more detailed instrumentation.

Adding traces helps you debug and understand the flow of execution. Use the
`runInDevTraceSpan` function to wrap any section of code in a trace span.

Here is a basic example:

```typescript
import { runInDevTraceSpan } from '@the-a-tech-corporation/core';
import { ACoderCliOperation } from '@the-a-tech-corporation/core';

await runInDevTraceSpan(
  {
    operation: ACoderCliOperation.ToolCall,
    attributes: {
      [GEN_AI_AGENT_NAME]: 'a-coder-cli',
    },
  },
  async ({ metadata }) => {
    // metadata allows you to record the input and output of the
    // operation as well as other attributes.
    metadata.input = { key: 'value' };
    // Set custom attributes.
    metadata.attributes['custom.attribute'] = 'custom.value';

    // Your code to be traced goes here.
    try {
      const output = await somethingRisky();
      metadata.output = output;
      return output;
    } catch (e) {
      metadata.error = e;
      throw e;
    }
  },
);
```

In this example:

- `operation`: The operation type of the span, represented by the
  `ACoderCliOperation` enum.
- `metadata.input`: (Optional) An object containing the input data for the
  traced operation.
- `metadata.output`: (Optional) An object containing the output data from the
  traced operation.
- `metadata.attributes`: (Optional) A record of custom attributes to add to
  the span.
- `metadata.error`: (Optional) An error object to record if the operation fails.
