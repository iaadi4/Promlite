const express = require('express');
const { Histogram, register } = require('../../dist/index.js');

const app = express();
const PORT = process.env.PORT || 3003;

// Create Histogram metrics
const httpRequestDuration = new Histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds',
  [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  ['method', 'route', 'status_code']
);

const databaseQueryDuration = new Histogram(
  'database_query_duration_seconds',
  'Database query duration in seconds',
  [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  ['operation', 'table']
);

// Register the histograms
register.register('http_request_duration_seconds', httpRequestDuration);
register.register('database_query_duration_seconds', databaseQueryDuration);

// Middleware to measure HTTP request duration
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    httpRequestDuration.observe(
      [req.method, req.route?.path || req.path, res.statusCode.toString()],
      duration
    );
  });

  next();
});

// Simulate database operations
const simulateDbQuery = async (operation, table, minMs = 10, maxMs = 500) => {
  const start = Date.now();
  const delay = Math.random() * (maxMs - minMs) + minMs;

  return new Promise(resolve => {
    setTimeout(() => {
      const duration = (Date.now() - start) / 1000;
      databaseQueryDuration.observe([operation, table], duration);
      resolve({ duration, delay });
    }, delay);
  });
};

// Sample routes with varying response times
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Histogram example!' });
});

app.get('/fast', (req, res) => {
  // Fast response
  res.json({ message: 'Fast response', timestamp: Date.now() });
});

app.get('/slow', async (req, res) => {
  // Slow response (1-3 seconds)
  const delay = Math.random() * 2000 + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  res.json({ message: 'Slow response', delay });
});

app.get('/users', async (req, res) => {
  // Simulate database query
  const queryResult = await simulateDbQuery('SELECT', 'users', 50, 200);
  res.json({
    users: ['Alice', 'Bob', 'Charlie'],
    queryTime: queryResult.duration,
  });
});

app.post('/users', async (req, res) => {
  // Simulate database insert
  const queryResult = await simulateDbQuery('INSERT', 'users', 100, 400);
  res.status(201).json({
    message: 'User created',
    queryTime: queryResult.duration,
  });
});

app.get('/products', async (req, res) => {
  // Simulate multiple database queries
  const [productsQuery, categoriesQuery] = await Promise.all([
    simulateDbQuery('SELECT', 'products', 80, 300),
    simulateDbQuery('SELECT', 'categories', 20, 100),
  ]);

  res.json({
    products: ['Laptop', 'Mouse', 'Keyboard'],
    categories: ['Electronics', 'Accessories'],
    queryTimes: {
      products: productsQuery.duration,
      categories: categoriesQuery.duration,
    },
  });
});

app.get('/variable/:delay', (req, res) => {
  // Variable delay based on parameter
  const delay = Math.min(parseInt(req.params.delay) || 100, 5000);
  setTimeout(() => {
    res.json({
      message: `Response after ${delay}ms`,
      requestedDelay: delay,
    });
  }, delay);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(register.metrics());
});

// Stats endpoint showing histogram statistics
app.get('/stats', (req, res) => {
  res.json({
    message: 'Check /metrics endpoint for detailed histogram data',
    info: {
      httpRequestDuration: 'Measures HTTP request duration in seconds',
      databaseQueryDuration: 'Measures database query duration in seconds',
      buckets: {
        http: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        database: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`Histogram example server running on http://localhost:${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
  console.log('\nTry these endpoints to see different response times:');
  console.log(`- GET http://localhost:${PORT}/fast (quick response)`);
  console.log(`- GET http://localhost:${PORT}/slow (1-3s response)`);
  console.log(`- GET http://localhost:${PORT}/users (with DB simulation)`);
  console.log(`- POST http://localhost:${PORT}/users (with DB simulation)`);
  console.log(`- GET http://localhost:${PORT}/products (multiple DB queries)`);
  console.log(`- GET http://localhost:${PORT}/variable/1000 (custom delay)`);
  console.log(`- GET http://localhost:${PORT}/stats`);
  console.log('\nMake multiple requests to see histogram buckets fill up!');
});
