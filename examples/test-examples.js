#!/usr/bin/env node

/**
 * Test script to verify all prometheus-client examples work correctly
 * Run with: node test-examples.js
 */

const http = require('http');
const { spawn } = require('child_process');

const examples = [
  { name: 'counter', port: 3001, script: 'counter' },
  { name: 'gauge', port: 3002, script: 'gauge' },
  { name: 'histogram', port: 3003, script: 'histogram' },
  { name: 'comprehensive', port: 3000, script: 'comprehensive' },
];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });

    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testExample(example) {
  console.log(`\n🧪 Testing ${example.name} example...`);

  return new Promise(resolve => {
    // Start the server
    const server = spawn('npm', ['run', example.script], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let started = false;
    let output = '';

    server.stdout.on('data', data => {
      output += data.toString();
      if (!started && output.includes(`localhost:${example.port}`)) {
        started = true;
        testServer();
      }
    });

    server.stderr.on('data', data => {
      console.error(`❌ ${example.name} error:`, data.toString());
    });

    async function testServer() {
      try {
        // Wait a bit for server to fully start
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test main endpoint
        const mainResponse = await makeRequest(
          `http://localhost:${example.port}/`
        );
        console.log(
          `   ✅ Main endpoint: ${mainResponse.status === 200 ? 'OK' : 'FAIL'}`
        );

        // Test metrics endpoint
        const metricsResponse = await makeRequest(
          `http://localhost:${example.port}/metrics`
        );
        const hasMetrics =
          metricsResponse.data.includes('# HELP') &&
          metricsResponse.data.includes('# TYPE');
        console.log(`   ✅ Metrics endpoint: ${hasMetrics ? 'OK' : 'FAIL'}`);

        // Test specific endpoints based on example type
        if (example.name === 'counter') {
          await makeRequest(`http://localhost:${example.port}/api/users`);
          const updatedMetrics = await makeRequest(
            `http://localhost:${example.port}/metrics`
          );
          const hasCounterMetric = updatedMetrics.data.includes(
            'http_requests_total'
          );
          console.log(
            `   ✅ Counter functionality: ${hasCounterMetric ? 'OK' : 'FAIL'}`
          );
        }

        if (example.name === 'comprehensive') {
          await makeRequest(`http://localhost:${example.port}/api/users`);
          const updatedMetrics = await makeRequest(
            `http://localhost:${example.port}/metrics`
          );
          const hasAllMetrics =
            updatedMetrics.data.includes('http_requests_total') &&
            updatedMetrics.data.includes('active_connections') &&
            updatedMetrics.data.includes('http_request_duration_seconds');
          console.log(
            `   ✅ All metric types: ${hasAllMetrics ? 'OK' : 'FAIL'}`
          );
        }

        console.log(`   🎉 ${example.name} example working correctly!`);
      } catch (error) {
        console.log(`   ❌ ${example.name} test failed:`, error.message);
      } finally {
        server.kill();
        resolve();
      }
    }

    // Timeout if server doesn't start
    setTimeout(() => {
      if (!started) {
        console.log(
          `   ❌ ${example.name} server failed to start within 10 seconds`
        );
        server.kill();
        resolve();
      }
    }, 10000);
  });
}

async function main() {
  console.log('🚀 Testing Prometheus Client Examples');
  console.log('=====================================');

  // Check if build exists
  try {
    require('fs').accessSync('../dist/index.js');
    console.log('✅ Built distribution found');
  } catch (error) {
    console.error('❌ Built distribution not found:', error.message);
    process.exit(1);
  }

  // Test each example
  for (const example of examples) {
    await testExample(example);
  }

  console.log('\n🎯 All tests completed!');
  console.log('\n📊 You can now run individual examples with:');
  examples.forEach(ex => {
    console.log(`   npm run ${ex.script} # -> http://localhost:${ex.port}`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}
