const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
const askRoutes = require('../src/routes/ask');
const ragRoutes = require('../src/routes/rag');
// کامنت کردن routes های قدیمی
// const askRoutes = require('./routes/ask');
// const ragRoutes = require('./routes/rag');
const vectorApiRoutes = require('./routes/vector-api');

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

// روت اصلی
app.get('/', (c) => {
  return c.json({
    message: 'FindLanQBot API',
    version: '2.0.0',
    port: port,
    endpoints: {
      health: '/api/health',
      // ask: '/api/ask (POST)',
      // documents: '/api/documents (POST)',
      // rag: {
      //   upload: '/api/rag/upload (POST)',
      //   ask: '/api/rag/ask (POST)',
      //   test: '/api/rag/test (POST)',
      //   files: '/api/rag/files (GET)',
      //   deleteFile: '/api/rag/files/:fileName (DELETE)'
      // },
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

// کامنت کردن روت‌های قدیمی
askRoutes(app);
ragRoutes(app);
vectorApiRoutes(app);
// اضافه کردن API های Upstash Vector
// app.route('/api/vector', vectorApiRoutes);
console.log('app kar mikone')
// مدیریت خطاها
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({ 
    error: 'خطای داخلی سرور',
    message: process.env.NODE_ENV === 'development' ? err.message : 'خطای غیرمنتظره'
  }, 500);
});

// راه‌اندازی سرور
async function init() {
  console.log(`🚀 Backend server ready on port ${port}`);
  console.log('🔗 Upstash Vector APIs available at /api/vector/*');
}

// فقط اگر مستقیماً اجرا شده باشد، نه به عنوان module
if (require.main === module) {
  init();
}

// Export function برای Vercel
module.exports = (req, res) => {
  console.log("Processing request");
  
  // Handle body properly - convert object to JSON string
  let bodyToSend = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    // If body is object, convert to JSON string
    bodyToSend = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    console.log("Body converted to:", bodyToSend);
  }
  
  console.log({
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    bodyType: typeof req.body,
    bodyToSend: bodyToSend?.substring(0, 100) + '...'
  });
  
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
  });
}; 