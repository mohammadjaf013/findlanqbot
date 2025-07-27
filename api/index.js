const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
const { fileUploadMiddleware } = require('../src/middleware/fileUpload');
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

// File upload middleware - disabled, using Hono's built-in formData
// app.use('*', fileUploadMiddleware());

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

// Export Hono app directly for Vercel
module.exports = async (req, res) => {
  await ensureDbInitialized();
  
  try {
    // Create a proper Request object
    const url = `https://${req.headers.host}${req.url}`;
    
                   // Create Web API Request with proper body handling
     let requestInit = {
       method: req.method,
       headers: new Headers(req.headers)
     };
     
     // Handle body for different content types
     const contentType = req.headers['content-type'] || '';
     
     if (contentType.includes('multipart/form-data')) {
       // For multipart, we need to pass the raw stream
       requestInit.body = req;
       requestInit.duplex = 'half';
     } else if (req.body) {
       requestInit.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
       requestInit.duplex = 'half';
     }
     
     const request = new Request(url, requestInit);
     
     // Add raw request to the Web API request for middleware access
     request.raw = req;
     
     // Call Hono
     const response = await app.fetch(request);
    
    // Set response
    res.status(response.status);
    
    // Set headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Send body
    const text = await response.text();
    res.end(text);
    
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message
    });
  }
}; 