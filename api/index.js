const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
const askRoutes = require('../src/routes/ask');
const ragRoutes = require('../src/routes/rag');

// ایجاد اپلیکیشن Hono
const app = new Hono();

// تنظیم پورت
const port = process.env.PORT || 3001;

// میدلورها
app.use('*', logger());
app.use('*', cors({
  origin: '*', // برای production باید محدود کنی
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Database initialization - فقط در runtime
const { initDatabase } = process.env.TURSO_DATABASE_URL 
  ? require('../src/services/turso-db') 
  : require('../src/services/db');

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized for Vercel');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
    }
  }
}

// Middleware to ensure DB is initialized - فقط در runtime
app.use('*', async (c, next) => {
  await ensureDbInitialized();
  await next();
});

// روت اصلی
app.get('/', (c) => {
  return c.json({
    message: 'FindLanQBot API',
    version: '1.0.0',
    environment: 'Vercel',
    endpoints: {
      health: '/api/health',
      ask: '/api/ask (POST)',
      documents: '/api/documents (POST)',
      rag: {
        upload: '/api/rag/upload (POST)',
        ask: '/api/rag/ask (POST)',
        test: '/api/rag/test (POST)',
        files: '/api/rag/files (GET)',
        deleteFile: '/api/rag/files/:fileName (DELETE)'
      }
    }
  });
});

// اضافه کردن route برای /api/
app.get('/api', (c) => {
  return c.json({
    message: 'FindLanQBot API',
    version: '1.0.0',
    environment: 'Vercel',
    status: 'active'
  });
});

// اضافه کردن روت‌های API
askRoutes(app);
ragRoutes(app);

// مدیریت خطاها
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({ 
    error: 'خطای داخلی سرور',
    message: process.env.NODE_ENV === 'development' ? err.message : 'خطای غیرمنتظره'
  }, 500);
});

// Custom Vercel handler for Hono with proper body handling
module.exports = async (req, res) => {
  await ensureDbInitialized();
  
  try {
    // Handle different content types
    let body = null;
    
          if (req.method === 'POST' || req.method === 'PUT') {
        // For Vercel, we need to handle the raw body differently
        body = req;
      }
    
    // Create URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const url = `${protocol}://${host}${req.url}`;
    
    // Create request object
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: body
    });
    
    const response = await app.fetch(request);
    
    // Set status
    res.status(response.status);
    
    // Set headers
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    
    // Send response
    const text = await response.text();
    res.send(text);
    
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 