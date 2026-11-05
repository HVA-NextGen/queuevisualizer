import { SpanStatusCode, trace } from '@opentelemetry/api'

const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
let shutdownMonitor

if (connectionString) {
  const { useAzureMonitor: initializeAzureMonitor, shutdownAzureMonitor } = await import('@azure/monitor-opentelemetry')
  initializeAzureMonitor({
    azureMonitorExporterOptions: { connectionString },
    samplingRatio: 1,
    tracesPerSecond: 0,
    enableLiveMetrics: false,
    enableStandardMetrics: false,
    enablePerformanceCounters: false,
    browserSdkLoaderOptions: { enabled: false },
  })
  shutdownMonitor = shutdownAzureMonitor
  console.info('Application Insights server telemetry enabled')
} else {
  console.info('Application Insights disabled: no connection string configured')
}

export function recordServerError(error) {
  if (!connectionString) return
  const activeSpan = trace.getActiveSpan()
  const span = activeSpan ?? trace.getTracer('queuevisualizer').startSpan('server.error')
  const exception = error instanceof Error ? error : new Error(String(error))
  span.recordException(exception)
  span.setStatus({ code: SpanStatusCode.ERROR, message: exception.message })
  if (!activeSpan) span.end()
}

export async function shutdownTelemetry() {
  if (shutdownMonitor) await shutdownMonitor()
}
