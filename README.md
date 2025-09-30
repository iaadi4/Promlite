# Prometheus Client

A TypeScript/Node.js Prometheus client library that lets applications define and collect metrics (counters, gauges, histograms) and expose them in the Prometheus text format.

## Features

- ✅ **Counter** - A cumulative metric that only increases
- ✅ **Gauge** - A metric that can go up and down
- ✅ **Histogram** - Samples observations and counts them in configurable buckets
- ✅ **Labels** - Support for multi-dimensional metrics with labels
- ✅ **Registry** - Central management of multiple metrics
- ✅ **Prometheus Format** - Native output in Prometheus text format
- ✅ **TypeScript** - Full TypeScript support with type definitions
- ✅ **ES Modules** - Modern ES module support

## Installation

```bash
npm install prometheus-client
```

## Quick Start

```typescript
import { Counter, Gauge, Histogram, register } from 'prometheus-client';

// Create metrics
const httpRequestsTotal = new Counter(
  'http_requests_total',
  'Total number of HTTP requests',
  ['method', 'status_code']
);

const httpRequestDuration = new Histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds',
  [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  ['method', 'route']
);

const activeConnections = new Gauge(
  'active_connections',
  'Number of active connections'
);

// Register metrics
register.register('http_requests_total', httpRequestsTotal);
register.register('http_request_duration_seconds', httpRequestDuration);
register.register('active_connections', activeConnections);

// Use metrics
httpRequestsTotal.inc(['GET', '200']);
httpRequestDuration.observe(['GET', '/api/users'], 0.243);
activeConnections.set(15);

// Export metrics in Prometheus format
console.log(register.metrics());
```

## API Documentation

### Counter

A counter is a cumulative metric that represents a single monotonically increasing counter whose value can only increase or be reset to zero.

#### Constructor

```typescript
new Counter(name: string, help: string, labels?: string[])
```

#### Methods

```typescript
// Increment by 1 (default)
counter.inc();

// Increment by custom amount
counter.inc(5);

// Increment with labels
counter.inc(['GET', '200']);
counter.inc(['GET', '200'], 3);

// Get current value
counter.getValue(); // for metrics without labels
counter.getValue(['GET', '200']); // for metrics with labels

// Reset to zero
counter.reset();

// Export to Prometheus format
counter.toPrometheus();
```

#### Example

```typescript
import { Counter } from 'prometheus-client';

const httpRequestsTotal = new Counter(
  'http_requests_total',
  'Total number of HTTP requests',
  ['method', 'status_code']
);

// Increment counters
httpRequestsTotal.inc(['GET', '200']);
httpRequestsTotal.inc(['POST', '201'], 3);
httpRequestsTotal.inc(['GET', '404']);

console.log(httpRequestsTotal.getValue(['GET', '200'])); // 1
console.log(httpRequestsTotal.getValue(['POST', '201'])); // 3
console.log(httpRequestsTotal.toPrometheus());
```

### Gauge

A gauge is a metric that represents a single numerical value that can arbitrarily go up and down.

#### Constructor

```typescript
new Gauge(name: string, help: string, labels?: string[])
```

#### Methods

```typescript
// Set to specific value
gauge.set(42);
gauge.set(['cpu', 'core1'], 85.3);

// Increment
gauge.inc(); // increment by 1
gauge.inc(5); // increment by 5
gauge.inc(['memory'], 1024);

// Decrement
gauge.dec(); // decrement by 1
gauge.dec(5); // decrement by 5
gauge.dec(['disk'], 512);

// Get current value
gauge.get();
gauge.get(['cpu', 'core1']);

// Reset to zero
gauge.reset();

// Export to Prometheus format
gauge.toPrometheus();
```

#### Example

```typescript
import { Gauge } from 'prometheus-client';

const memoryUsage = new Gauge(
  'memory_usage_bytes',
  'Memory usage in bytes',
  ['type']
);

// Set values
memoryUsage.set(['heap'], 1073741824);
memoryUsage.set(['rss'], 2147483648);

// Increment/decrement
memoryUsage.inc(['heap'], 1024);
memoryUsage.dec(['rss'], 512);

console.log(memoryUsage.get(['heap'])); // 1073742848
console.log(memoryUsage.toPrometheus());
```

### Histogram

A histogram samples observations and counts them in configurable buckets. It also provides a sum of all observed values.

#### Constructor

```typescript
new Histogram(name: string, help: string, buckets: number[], labels?: string[])
```

#### Methods

```typescript
// Observe a value
histogram.observe(0.5);
histogram.observe(['GET', '/api'], 0.243);

// Get metrics
histogram.get(); // { totalCount: number, totalSum: number }
histogram.get(['GET', '/api']);

// Reset all observations
histogram.reset();

// Export to Prometheus format
histogram.toPrometheus();
```

#### Example

```typescript
import { Histogram } from 'prometheus-client';

const httpRequestDuration = new Histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds',
  [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // buckets
  ['method', 'route']
);

// Record observations
httpRequestDuration.observe(['GET', '/api/users'], 0.243);
httpRequestDuration.observe(['POST', '/api/users'], 0.891);
httpRequestDuration.observe(['GET', '/api/health'], 0.034);

const stats = httpRequestDuration.get(['GET', '/api/users']);
console.log(stats); // { totalCount: 1, totalSum: 0.243 }

console.log(httpRequestDuration.toPrometheus());
```

### Registry

The Registry class manages multiple metrics and provides a central endpoint for collecting all metrics.

#### Methods

```typescript
import { Registry, Counter, Gauge } from 'prometheus-client';

const registry = new Registry();
const counter = new Counter('my_counter', 'A counter');
const gauge = new Gauge('my_gauge', 'A gauge');

// Register metrics
registry.register('my_counter', counter);
registry.register('my_gauge', gauge);

// Get a metric
const retrievedCounter = registry.getMetric('my_counter');

// Get all metric names
const names = registry.getMetricNames();

// Export all metrics
const allMetrics = registry.metrics();

// Reset all metrics
registry.resetAll();

// Clear registry
registry.clear();
```

#### Default Registry

The library provides a default registry instance:

```typescript
import { register, Counter } from 'prometheus-client';

const counter = new Counter('requests_total', 'Total requests');
register.register('requests_total', counter);

// Export all metrics from default registry
console.log(register.metrics());
```

## HTTP Server Integration

### Express.js Example

```typescript
import express from 'express';
import { Counter, Histogram, register } from 'prometheus-client';

const app = express();

// Create metrics
const httpRequestsTotal = new Counter(
  'http_requests_total',
  'Total HTTP requests',
  ['method', 'route', 'status_code']
);

const httpRequestDuration = new Histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds',
  [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  ['method', 'route']
);

// Register metrics
register.register('http_requests_total', httpRequestsTotal);
register.register('http_request_duration_seconds', httpRequestDuration);

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = [req.method, req.route?.path || req.path];
    
    httpRequestsTotal.inc([req.method, req.route?.path || req.path, res.statusCode.toString()]);
    httpRequestDuration.observe(labels, duration);
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.end(register.metrics());
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Metrics available at http://localhost:3000/metrics');
});
```

## Prometheus Configuration

Add this job to your `prometheus.yml` configuration:

```yaml
scrape_configs:
  - job_name: 'node-app'
    static_configs:
      - targets: ['localhost:3000']
    scrape_interval: 15s
    metrics_path: '/metrics'
```

## Error Handling

The library throws errors for various invalid operations:

```typescript
import { Counter } from 'prometheus-client';

const counter = new Counter('test', 'Test counter', ['label1']);

// Label count mismatch
counter.inc(['value1', 'value2']); // Error: Label count mismatch

// Cannot decrement counter
counter.inc(['value1'], -1); // Error: Counter cannot be decreased

// Invalid values
counter.inc(['value1'], NaN); // TypeError: Value is not a valid finite number
counter.inc(['value1'], Infinity); // TypeError: Value is not a valid finite number
```

## Best Practices

1. **Metric Naming**: Use descriptive names with units (e.g., `http_request_duration_seconds`)
2. **Labels**: Keep cardinality low - avoid high-cardinality labels like user IDs
3. **Histogram Buckets**: Choose buckets appropriate for your use case
4. **Registry**: Use the default registry for simplicity, or create custom registries for isolation
5. **Error Handling**: Always handle potential errors from metric operations

## TypeScript Support

This library is written in TypeScript and provides full type definitions:

```typescript
import { Counter, Gauge, Histogram, Registry } from 'prometheus-client';
import type { CounterType, GaugeType, HistogramType } from 'prometheus-client';

// Type-safe metric creation
const counter: CounterType = new Counter('name', 'help', ['label']);
const gauge: GaugeType = new Gauge('name', 'help');
const histogram: HistogramType = new Histogram('name', 'help', [0.1, 0.5, 1]);
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and contribution guidelines.

## License

ISC