const express = require('express');
const { Counter, Gauge, Histogram, register } = require('../../dist/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());

// =============================================================================
// METRICS DEFINITIONS
// =============================================================================

// Counter metrics
const httpRequestsTotal = new Counter(
  'http_requests_total',
  'Total number of HTTP requests',
  ['method', 'route', 'status_code']
);

const errorsTotal = new Counter('errors_total', 'Total number of errors', [
  'type',
  'route',
]);

// Gauge metrics
const activeConnections = new Gauge(
  'active_connections',
  'Number of active connections'
);

const memoryUsage = new Gauge('memory_usage_bytes', 'Memory usage in bytes', [
  'type',
]);

const queueSize = new Gauge('queue_size', 'Current queue size', ['queue_name']);

// Histogram metrics
const httpRequestDuration = new Histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds',
  [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  ['method', 'route']
);

const databaseQueryDuration = new Histogram(
  'database_query_duration_seconds',
  'Database query duration in seconds',
  [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  ['operation', 'table']
);

// Register all metrics
register.register('http_requests_total', httpRequestsTotal);
register.register('errors_total', errorsTotal);
register.register('active_connections', activeConnections);
register.register('memory_usage_bytes', memoryUsage);
register.register('queue_size', queueSize);
register.register('http_request_duration_seconds', httpRequestDuration);
register.register('database_query_duration_seconds', databaseQueryDuration);

// =============================================================================
// MIDDLEWARE & UTILITIES
// =============================================================================

// Track active connections
let connectionCount = 0;
const processingQueue = [];

app.use((req, res, next) => {
  const start = Date.now();
  connectionCount++;
  activeConnections.set(connectionCount);

  res.on('finish', () => {
    connectionCount--;
    activeConnections.set(connectionCount);

    // Record metrics
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestsTotal.inc([req.method, route, res.statusCode.toString()]);

    httpRequestDuration.observe([req.method, route], duration);
  });
  next();
});

// Simulate database operations
const simulateDbQuery = async (operation, table, minMs = 10, maxMs = 200) => {
  const start = Date.now();
  const delay = Math.random() * (maxMs - minMs) + minMs;

  return new Promise(resolve => {
    setTimeout(() => {
      const duration = (Date.now() - start) / 1000;
      databaseQueryDuration.observe([operation, table], duration);
      resolve({ duration, delay, operation, table });
    }, delay);
  });
};

// Update system metrics periodically
setInterval(() => {
  const memInfo = process.memoryUsage();
  memoryUsage.set(['rss'], memInfo.rss);
  memoryUsage.set(['heapTotal'], memInfo.heapTotal);
  memoryUsage.set(['heapUsed'], memInfo.heapUsed);
  memoryUsage.set(['external'], memInfo.external);

  queueSize.set(['processing'], processingQueue.length);
}, 5000);

// =============================================================================
// API ROUTES
// =============================================================================

app.get('/', (req, res) => {
  res.json({
    message: 'Comprehensive Prometheus Metrics Example',
    version: '1.0.0',
    metrics: {
      counter: 'HTTP requests, errors',
      gauge: 'Active connections, memory usage, queue size',
      histogram: 'Request duration, database query duration',
    },
    endpoints: [
      'GET /',
      'GET /api/users',
      'POST /api/users',
      'GET /api/products',
      'POST /api/orders',
      'GET /slow',
      'GET /error',
      'GET /metrics',
      'GET /health',
    ],
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await simulateDbQuery('SELECT', 'users', 20, 100);
    res.json({
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' },
      ],
      queryTime: users.duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database error:', error);
    errorsTotal.inc(['database_error', '/api/users']);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    // Add to processing queue
    const task = { id: Date.now(), type: 'create_user', data: req.body };
    processingQueue.push(task);

    const insertResult = await simulateDbQuery('INSERT', 'users', 50, 200);

    // Remove from queue
    const index = processingQueue.findIndex(t => t.id === task.id);
    if (index > -1) {
      processingQueue.splice(index, 1);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: { id: Date.now(), ...req.body },
      queryTime: insertResult.duration,
    });
  } catch (error) {
    console.error('Database error:', error);
    errorsTotal.inc(['database_error', '/api/users']);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    // Simulate multiple database queries
    const [products, categories, inventory] = await Promise.all([
      simulateDbQuery('SELECT', 'products', 30, 150),
      simulateDbQuery('SELECT', 'categories', 10, 50),
      simulateDbQuery('SELECT', 'inventory', 20, 80),
    ]);

    res.json({
      products: [
        { id: 1, name: 'Laptop', category: 'Electronics', price: 999 },
        { id: 2, name: 'Mouse', category: 'Accessories', price: 25 },
        { id: 3, name: 'Keyboard', category: 'Accessories', price: 75 },
      ],
      categories: ['Electronics', 'Accessories', 'Software'],
      queryTimes: {
        products: products.duration,
        categories: categories.duration,
        inventory: inventory.duration,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    errorsTotal.inc(['database_error', '/api/products']);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    // Add to processing queue
    const task = { id: Date.now(), type: 'create_order', data: req.body };
    processingQueue.push(task);

    // Simulate order processing with multiple database operations
    const [orderInsert, inventoryUpdate, userUpdate] = await Promise.all([
      simulateDbQuery('INSERT', 'orders', 100, 300),
      simulateDbQuery('UPDATE', 'inventory', 50, 150),
      simulateDbQuery('UPDATE', 'users', 20, 100),
    ]);

    // Remove from queue
    const index = processingQueue.findIndex(t => t.id === task.id);
    if (index > -1) {
      processingQueue.splice(index, 1);
    }
    res.status(201).json({
      message: 'Order created successfully',
      orderId: Date.now(),
      queryTimes: {
        order: orderInsert.duration,
        inventory: inventoryUpdate.duration,
        user: userUpdate.duration,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    errorsTotal.inc(['order_error', '/api/orders']);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/slow', async (req, res) => {
  // Simulate slow operation
  const delay = Math.random() * 3000 + 1000; // 1-4 seconds
  await new Promise(resolve => setTimeout(resolve, delay));

  res.json({
    message: 'This was a slow operation',
    delay: Math.round(delay),
    timestamp: new Date().toISOString(),
  });
});

app.get('/error', (req, res) => {
  errorsTotal.inc(['intentional_error', '/error']);
  res.status(500).json({
    error: 'This is an intentional error for testing',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeConnections: connectionCount,
    queueSize: processingQueue.length,
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(register.metrics());
});

// 404 handler
app.use((req, res) => {
  errorsTotal.inc(['not_found', req.path]);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((error, req, res, next) => {
  errorsTotal.inc(['server_error', req.path]);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
  next();
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(PORT, () => {
  console.log(
    `🚀 Comprehensive Metrics Server running on http://localhost:${PORT}`
  );
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log('\n🔢 Available Metrics:');
  console.log('   Counters: http_requests_total, errors_total');
  console.log('   Gauges: active_connections, memory_usage_bytes, queue_size');
  console.log(
    '   Histograms: http_request_duration_seconds, database_query_duration_seconds'
  );
  console.log('\n🛠️  API Endpoints:');
  console.log(
    `   - GET  ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/ (overview)`
  );
  console.log(
    `   - GET  ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/api/users`
  );
  console.log(
    `   - POST ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/api/users`
  );
  console.log(
    `   - GET  ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/api/products`
  );
  console.log(
    `   - POST ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/api/orders`
  );
  console.log(
    `   - GET  ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/slow (1-4s response)`
  );
  console.log(
    `   - GET  ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/error (500 error)`
  );
  console.log(
    `   - GET  ${PORT === 3000 ? 'http://localhost:3000' : `http://localhost:${PORT}`}/health`
  );
  console.log(
    '\n💡 Try making multiple requests to different endpoints to see metrics in action!'
  );
});
