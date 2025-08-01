const { Hono } = require('hono');
const app = require('./src/app');

// تست endpoints
async function testEndpoints() {
  console.log('🧪 Testing endpoints...\n');

  const testCases = [
    { method: 'GET', path: '/', description: 'Root endpoint' },
    { method: 'GET', path: '/test', description: 'Test endpoint' },
    { method: 'GET', path: '/api/health', description: 'Health endpoint' },
    { method: 'POST', path: '/api/session/new', description: 'Create session' },
    { method: 'POST', path: '/api/ask', description: 'Ask endpoint' },
    { method: 'GET', path: '/api/session/stats', description: 'Session stats' },
    { method: 'GET', path: '/nonexistent', description: '404 test' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing ${testCase.method} ${testCase.path} (${testCase.description})...`);
      
      const request = new Request(`http://localhost:3001${testCase.path}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: testCase.method === 'POST' ? JSON.stringify({ test: true }) : undefined
      });

      const response = await app.fetch(request);
      const body = await response.text();
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Response: ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`);
      console.log('');
      
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      console.log('');
    }
  }
}

// اجرای تست
testEndpoints().then(() => {
  console.log('✅ Endpoint testing completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Endpoint testing failed:', error);
  process.exit(1);
}); 