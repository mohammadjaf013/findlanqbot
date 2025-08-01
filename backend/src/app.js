const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
const askRoutes = require('./routes/ask');
const ragRoutes = require('./routes/rag');
const vectorApiRoutes = require('./routes/vector-api');
const consultationRoutes = require('./routes/consultation');

// ایجاد اپلیکیشن Hono
const app = new Hono();

// تنظیم پورت
const port = process.env.PORT || 3001;

// میدلورها
app.use('*', logger());
app.use('*', cors({
  origin: '*', // Allow all origins for now to fix CORS issues
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false // Must be false when origin is '*'
}));

// روت تست
app.get('/test', (c) => {
  return c.json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// روت اصلی
app.get('/', (c) => {
  return c.json({
    message: 'FindLanQBot API',
    version: '2.0.0',
    port: port,
    endpoints: {
      test: '/test (GET)',
      health: '/api/health',
      ask: '/api/ask (POST)',
      session: {
        new: '/api/session/new (POST)',
        history: '/api/session/:sessionId/history (GET)',
        stats: '/api/session/stats (GET)',
        test: '/api/session/test (GET)',
        status: '/api/session/status (GET)'
      },
      documents: '/api/documents (POST)',
      rag: {
        upload: '/api/rag/upload (POST)',
        ask: '/api/rag/ask (POST)',
        test: '/api/rag/test (POST)',
        files: '/api/rag/files (GET)',
        deleteFile: '/api/rag/files/:fileName (DELETE)'
      },
      vector: {
        upload: '/api/vector/upload (POST)',
        uploadText: '/api/vector/upload-text (POST)',
        search: '/api/vector/search (POST)',
        files: '/api/vector/files (GET)',
        deleteFile: '/api/vector/files/:fileName (DELETE)',
        stats: '/api/vector/stats (GET)',
        health: '/api/vector/health (GET)'
      }
    }
  });
});

// اضافه کردن routes
askRoutes(app);
ragRoutes(app);
vectorApiRoutes(app);
consultationRoutes(app);

console.log('🚀 App initialized with all routes');

// مدیریت خطاها
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({ 
    error: 'خطای داخلی سرور',
    message: process.env.NODE_ENV === 'development' ? err.message : 'خطای غیرمنتظره'
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    message: 'Endpoint not found',
    availableEndpoints: {
      root: '/',
      test: '/test',
      health: '/api/health',
      ask: '/api/ask',
      session: '/api/session/*',
      rag: '/api/rag/*',
      vector: '/api/vector/*'
    }
  }, 404);
});

// راه‌اندازی سرور
async function init() {
  console.log(`🚀 Backend server ready on port ${port}`);
  console.log('🔗 Available endpoints:');
  console.log('  - GET  /');
  console.log('  - GET  /test');
  console.log('  - GET  /api/health');
  console.log('  - POST /api/ask');
  console.log('  - POST /api/session/new');
  console.log('  - GET  /api/session/:id/history');
  console.log('  - GET  /api/session/stats');
  console.log('  - POST /api/documents');
  console.log('  - POST /api/rag/upload');
  console.log('  - POST /api/rag/ask');
  console.log('  - POST /api/vector/upload');
  console.log('  - POST /api/vector/upload-text');
  console.log('  - POST /api/vector/search');
}

// فقط اگر مستقیماً اجرا شده باشد، نه به عنوان module
if (require.main === module) {
  init();
}

// Export function برای Vercel
module.exports = (req, res) => {
  console.log("Processing request:", req.method, req.url);
  
  // Handle body properly - convert object to JSON string
  let bodyToSend = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    // If body is object, convert to JSON string
    bodyToSend = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    console.log("Body converted to:", bodyToSend?.substring(0, 100) + '...');
  }
  
  return app.fetch(new Request(
    `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}${req.url}`,
    {
      method: req.method,
      headers: req.headers,
      body: bodyToSend,
    }
  )).then(response => {
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    return response.text().then(body => {
      res.end(body);
    });
  }).catch(error => {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  });
}; 