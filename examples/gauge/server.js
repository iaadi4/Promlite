const express = require('express');
const { Gauge, register } = require('../../dist/index.js');

const app = express();
const PORT = process.env.PORT || 3002;

// Create Gauge metrics
const activeConnections = new Gauge(
  'active_connections',
  'Number of active connections',
);

const memoryUsage = new Gauge(
  'memory_usage_bytes',
  'Memory usage in bytes',
  ['type'],
);

const cpuUsage = new Gauge(
  'cpu_usage_percent',
  'CPU usage percentage',
);

// Register the gauges
register.register('active_connections', activeConnections);
register.register('memory_usage_bytes', memoryUsage);
register.register('cpu_usage_percent', cpuUsage);

// Track active connections
let connectionCount = 0;

app.use((req, res, next) => {
  connectionCount++;
  activeConnections.set(connectionCount);

  res.on('finish', () => {
    connectionCount--;
    activeConnections.set(connectionCount);
  });

  next();
});

// Update system metrics every 5 seconds
setInterval(() => {
  const memInfo = process.memoryUsage();

  // Update memory usage metrics
  memoryUsage.set(['rss'], memInfo.rss);
  memoryUsage.set(['heapTotal'], memInfo.heapTotal);
  memoryUsage.set(['heapUsed'], memInfo.heapUsed);
  memoryUsage.set(['external'], memInfo.external);

  // Simulate CPU usage (in real app, you'd use actual CPU metrics)
  const cpuPercent = Math.random() * 100;
  cpuUsage.set(cpuPercent);
}, 5000);

// Sample routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Gauge example!',
    activeConnections: connectionCount,
    memoryUsage: process.memoryUsage(),
  });
});

app.get('/load', (req, res) => {
  // Simulate some work that uses memory
  const largeArray = new Array(100000).fill('data');
  setTimeout(() => {
    res.json({
      message: 'Load test completed',
      arrayLength: largeArray.length,
      currentMemory: process.memoryUsage(),
    });
  }, 1000);
});

app.get('/stress', (req, res) => {
  // Simulate CPU intensive work
  const start = Date.now();
  let counter = 0;
  while (Date.now() - start < 2000) {
    counter++;
  }

  res.json({
    message: 'Stress test completed',
    iterations: counter,
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(register.metrics());
});

// Status endpoint with current gauge values
app.get('/status', (req, res) => {
  res.json({
    activeConnections: connectionCount,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

app.listen(PORT, () => {
  console.log(`Gauge example server running on http://localhost:${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
  console.log('\nTry these endpoints:');
  console.log(`- GET http://localhost:${PORT}/`);
  console.log(`- GET http://localhost:${PORT}/load (simulates memory load)`);
  console.log(`- GET http://localhost:${PORT}/stress (simulates CPU load)`);
  console.log(`- GET http://localhost:${PORT}/status`);
  console.log('\nWatch metrics change by making multiple concurrent requests!');
});
