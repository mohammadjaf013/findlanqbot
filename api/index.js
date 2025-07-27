const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
// انتخاب نوع دیتابیس بر اساس متغیر محیطی
const { initDatabase } = process.env.TURSO_DATABASE_URL 
  ? require('../src/services/turso-db') 
  : require('../src/services/db');
const askRoutes = require('../src/routes/ask');
const ragRoutes = require('../src/routes/rag');

// ایجاد اپلیکیشن Hono
const app = new Hono();

// میدلورها
app.use('*', logger());
app.use('*', cors({
  origin: '*', // برای production باید محدود کنی
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

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

// راه‌اندازی دیتابیس
let dbInitialized = false;

async function initDB() {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
    }
  }
}

// Vercel serverless function export
module.exports = async (req, res) => {
  await initDB();
  return app.fetch(req, res);
}; 