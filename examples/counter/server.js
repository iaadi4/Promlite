const express = require('express');
const { Counter, register } = require('../../dist/index.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Create a Counter metric to track HTTP requests
const httpRequestsTotal = new Counter(
  'http_requests_total',
  'Total number of HTTP requests',
  ['method', 'route', 'status_code'],
);

// Register the counter with the default registry
register.register('http_requests_total', httpRequestsTotal);

// Middleware to track all HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc([
      req.method,
      req.route?.path || req.path,
      res.statusCode.toString(),
    ]);
  });
  next();
});

// Sample routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Counter example!' });
});

app.get('/api/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob', 'Charlie'] });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/api/users', (req, res) => {
  res.status(201).json({ message: 'User created' });
});

// Error route to demonstrate error counting
app.get('/error', (req, res) => {
  res.status(500).json({ error: 'Something went wrong!' });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(register.metrics());
});

app.listen(PORT, () => {
  console.log(`Counter example server running on http://localhost:${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
  console.log('\nTry these endpoints:');
  console.log(`- GET  http://localhost:${PORT}/`);
  console.log(`- GET  http://localhost:${PORT}/api/users`);
  console.log(`- GET  http://localhost:${PORT}/api/health`);
  console.log(`- POST http://localhost:${PORT}/api/users`);
  console.log(`- GET  http://localhost:${PORT}/error`);
});
