const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
// انتخاب نوع دیتابیس بر اساس متغیر محیطی
const { initDatabase } = process.env.TURSO_DATABASE_URL 
  ? require('./services/turso-db') 
  : require('./services/db');
const askRoutes = require('./routes/ask');
const ragRoutes = require('./routes/rag');
const vectorApiRoutes = require('./routes/vector-api');

// ایجاد اپلیکیشن Hono
const app = new Hono();

// تنظیم پورت
const port = process.env.PORT || 3001;

// میدلورها
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://your-frontend-domain.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// روت اصلی
app.get('/', (c) => {
  return c.json({
    message: 'FindLanQBot API',
    version: '2.0.0',
    port: port,
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

// اضافه کردن روت‌های API
askRoutes(app);
ragRoutes(app);

// اضافه کردن API های Upstash Vector
app.route('/api/vector', vectorApiRoutes);

// مدیریت خطاها
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({ 
    error: 'خطای داخلی سرور',
    message: process.env.NODE_ENV === 'development' ? err.message : 'خطای غیرمنتظره'
  }, 500);
});

// راه‌اندازی دیتابیس در شروع (فقط برای local development)
async function init() {
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
    console.log(`🚀 Backend server ready on port ${port}`);
    console.log('🔗 Upstash Vector APIs available at /api/vector/*');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

// فقط اگر مستقیماً اجرا شده باشد، نه به عنوان module
if (require.main === module) {
  init();
}

// Export for different environments
module.exports = app; 