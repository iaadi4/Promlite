# Promlite Examples

This directory contains comprehensive examples demonstrating how to use the promlite library with Express.js applications.

## 📁 Examples Overview

### 1. **Counter Example** (`counter/`)
- **Port:** 3001
- **Focus:** HTTP request counting
- **Metrics:** `http_requests_total`
- **Features:**
  - Tracks all HTTP requests by method, route, and status code
  - Demonstrates counter increment with labels
  - Shows error request counting

### 2. **Gauge Example** (`gauge/`)
- **Port:** 3002  
- **Focus:** Real-time system metrics
- **Metrics:** `active_connections`, `memory_usage_bytes`, `cpu_usage_percent`
- **Features:**
  - Tracks active connections in real-time
  - Monitors memory usage (RSS, heap, external)
  - Simulates CPU usage monitoring
  - Updates metrics every 5 seconds

### 3. **Histogram Example** (`histogram/`)
- **Port:** 3003
- **Focus:** Response time measurement
- **Metrics:** `http_request_duration_seconds`, `database_query_duration_seconds`
- **Features:**
  - Measures HTTP request duration
  - Simulates database query timing
  - Custom histogram buckets for different use cases
  - Variable response times for testing

### 4. **Comprehensive Example** (`comprehensive/`)
- **Port:** 3000
- **Focus:** All metrics combined in a real-world scenario
- **Metrics:** All of the above plus `errors_total`, `queue_size`
- **Features:**
  - Full REST API with CRUD operations
  - Database simulation with realistic delays
  - Queue management tracking
  - Error handling and counting
  - Memory monitoring
  - Request/response time tracking

## 🚀 Quick Start

### Prerequisites
1. **Build the main project first:**
   ```bash
   cd ..
   npm run build
   ```

2. **Install example dependencies:**
   ```bash
   cd examples
   npm install
   ```

### Running Examples

#### Option 1: Individual Examples
```bash
# Counter example
npm run counter

# Gauge example
npm run gauge

# Histogram example
npm run histogram

# Comprehensive example (recommended)
npm run comprehensive
```

#### Option 2: Development Mode (with auto-restart)
```bash
# Development mode with nodemon
npm run dev:counter
npm run dev:gauge
npm run dev:histogram
npm run dev:comprehensive
```

#### Option 3: Default (Comprehensive Example)
```bash
npm start
```

#### Option 4: Test All Examples
```bash
# Run automated tests for all examples
npm test
```

## 📊 Viewing Metrics

Each example exposes metrics at the `/metrics` endpoint:

- **Counter:** http://localhost:3001/metrics
- **Gauge:** http://localhost:3002/metrics
- **Histogram:** http://localhost:3003/metrics
- **Comprehensive:** http://localhost:3000/metrics

## 🔧 API Usage Examples

### Creating Metrics
```javascript
const { Counter, Gauge, Histogram } = require('promlite');

// Counter - tracks increasing values
const requestCounter = new Counter(
  'http_requests_total',
  'Total HTTP requests',
  ['method', 'status'] // optional labels
);

// Gauge - tracks values that can go up or down
const activeConnections = new Gauge(
  'active_connections',
  'Number of active connections'
);

// Gauge with labels
const memoryUsage = new Gauge(
  'memory_usage_bytes',
  'Memory usage',
  ['type'] // labels for different memory types
);

// Histogram - measures distributions
const responseTime = new Histogram(
  'response_time_seconds',
  'Response time in seconds',
  [0.01, 0.1, 0.5, 1.0, 2.0], // buckets
  ['method', 'route'] // optional labels
);
```

### Using Metrics
```javascript
// Counter - increment by 1 (default)
requestCounter.inc();

// Counter - increment by specific amount
requestCounter.inc(5);

// Counter with labels (as array)
requestCounter.inc(['GET', '200']);
requestCounter.inc(['GET', '200'], 2); // increment by 2

// Gauge - set absolute value
activeConnections.set(42);

// Gauge with labels
memoryUsage.set(['heap'], 1024000);

// Gauge - increment/decrement
activeConnections.inc(); // +1
activeConnections.dec(); // -1
activeConnections.inc(5); // +5

// Histogram - observe a value
responseTime.observe(0.234);

// Histogram with labels
responseTime.observe(['GET', '/api/users'], 0.156);
```

### Registry Usage
```javascript
const { register } = require('../../dist/index.js'); // or your built package

// Register metrics
register.register('http_requests_total', requestCounter);
register.register('active_connections', activeConnections);

// Get all metrics in Prometheus format
const metricsOutput = register.metrics();

// Serve metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(register.metrics());
});
```

## 🔍 Understanding the Output

### Prometheus Metrics Format
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/",status_code="200"} 1

# HELP active_connections Number of active connections
# TYPE active_connections gauge
active_connections 0

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/",le="0.005"} 1
http_request_duration_seconds_bucket{method="GET",route="/",le="0.01"} 1
http_request_duration_seconds_sum{method="GET",route="/"} 0.002
http_request_duration_seconds_count{method="GET",route="/"} 1
```

### Metric Types Explained

#### **Counter**
- Always increases
- Constructor: `new Counter(name, help, labelNames?)`
- Used for: request counts, error counts, events
- Key methods: `inc()`, `inc(labelValues, amount?)`, `inc(amount?)`

#### **Gauge** 
- Can go up and down
- Constructor: `new Gauge(name, help, labelNames?)`
- Used for: active connections, memory usage, queue size
- Key methods: `set(value)`, `set(labelValues, value)`, `inc()`, `dec()`

#### **Histogram**
- Measures distributions (response times, sizes)
- Constructor: `new Histogram(name, help, buckets, labelNames?)`
- Automatically creates `_bucket`, `_count`, and `_sum` metrics
- Key methods: `observe(value)`, `observe(labelValues, value)`

## 🛠️ API Endpoints by Example

### Counter Example (Port 3001)
```
GET  /                    - Welcome message
GET  /api/users          - Get users list  
POST /api/users          - Create user
GET  /api/health         - Health check
GET  /error              - Trigger 500 error
GET  /metrics            - Prometheus metrics
```

### Gauge Example (Port 3002)
```
GET  /                    - System status
GET  /load               - Memory load test
GET  /stress             - CPU stress test
GET  /status             - Current metrics
GET  /metrics            - Prometheus metrics
```

### Histogram Example (Port 3003)
```
GET  /fast               - Quick response
GET  /slow               - Slow response (1-3s)
GET  /users              - DB query simulation
POST /users              - DB insert simulation
GET  /products           - Multiple DB queries
GET  /variable/:delay    - Custom delay
GET  /stats              - Histogram info
GET  /metrics            - Prometheus metrics
```

### Comprehensive Example (Port 3000)
```
GET  /                    - API overview
GET  /api/users          - Get users with DB simulation
POST /api/users          - Create user with queue tracking
GET  /api/products       - Multiple DB operations
POST /api/orders         - Complex order processing
GET  /slow               - Slow operation (1-4s)
GET  /error              - Intentional error
GET  /health             - System health
GET  /metrics            - Prometheus metrics
```

## 🧪 Testing the Examples

### Load Testing with curl
```bash
# Generate traffic for counter metrics
for i in {1..10}; do curl http://localhost:3001/api/users; done

# Test error counting
curl http://localhost:3001/error

# Test gauge metrics with concurrent requests
for i in {1..5}; do curl http://localhost:3002/load & done

# Test histogram with different delays
curl http://localhost:3003/fast
curl http://localhost:3003/slow
curl http://localhost:3003/variable/2000
```

### Using tools like Apache Bench
```bash
# Test comprehensive example with 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:3000/api/users
```

## 🏗️ Code Structure

Each example follows this pattern:

1. **Metric Creation:** Define Counter, Gauge, or Histogram with appropriate labels
2. **Registration:** Register metrics with the default registry
3. **Middleware:** Capture metrics in Express middleware
4. **Routes:** Business logic that updates metrics
5. **Metrics Endpoint:** Expose `/metrics` for Prometheus scraping

## 📈 Integration with Prometheus

To scrape these metrics with Prometheus, add this to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'promlite-examples'
    static_configs:
      - targets: ['localhost:3000', 'localhost:3001', 'localhost:3002', 'localhost:3003']
    scrape_interval: 15s
    metrics_path: /metrics
```

## 💡 Best Practices Demonstrated

1. **Metric Naming:** Follow Prometheus naming conventions
2. **Label Usage:** Use meaningful labels without high cardinality
3. **Error Handling:** Track errors separately from success metrics  
4. **Performance:** Minimal overhead metric collection
5. **Registry Management:** Proper metric registration and cleanup
6. **Middleware Integration:** Non-blocking metric collection

## 🤝 Contributing

To add more examples:

1. Create a new subdirectory
2. Add a `server.js` file following the existing pattern
3. Update this README
4. Add npm scripts to `package.json`

---

**Happy Monitoring! 📊🚀**