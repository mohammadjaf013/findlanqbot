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

// روت اصلی - HTML response
app.get('/', (c) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Try to read from public/index.html if exists
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8');
      return c.html(html);
    }
  } catch (error) {
    console.log('Could not read public/index.html:', error.message);
  }
  
  // Fallback to JSON
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

// Static pages routing
app.get('/finlandq', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فنلاند کیو - انتقال به فرانت‌اند</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #4385f6 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            max-width: 600px;
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
        .btn {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin: 10px;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 فنلاند کیو</h1>
        <p>این صفحه مال backend API هست. برای استفاده از رابط کاربری، به فرانت‌اند مراجعه کنید.</p>
        <div>
            <a href="/" class="btn">🏠 صفحه اصلی API</a>
        </div>
        <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.7;">
            <p><strong>Backend API:</strong> https://bot-api.finlandq.com</p>
        </div>
    </div>
    <script>
        setTimeout(() => {
            if (confirm('به صفحه اصلی API منتقل شوید؟')) {
                window.location.href = '/';
            }
        }, 5000);
    </script>
</body>
</html>`);
});

app.get('/upload', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>آپلود فایل - انتقال به فرانت‌اند</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            max-width: 600px;
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
        .btn {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin: 10px;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 آپلود فایل</h1>
        <p>صفحه آپلود فایل در فرانت‌اند Next.js موجود است.<br>این backend API است.</p>
        <div>
            <a href="/" class="btn">🏠 صفحه اصلی API</a>
        </div>
        <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.7;">
            <p><strong>API Endpoint:</strong> POST /api/rag/upload</p>
        </div>
    </div>
    <script>
        setTimeout(() => { window.location.href = '/'; }, 8000);
    </script>
</body>
</html>`);
});

app.get('/upload-text', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>آپلود متن - انتقال به فرانت‌اند</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            max-width: 600px;
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
        .btn {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin: 10px;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✏️ آپلود متن</h1>
        <p>صفحه آپلود متن در فرانت‌اند Next.js موجود است.<br>این backend API است.</p>
        <div>
            <a href="/" class="btn">🏠 صفحه اصلی API</a>
        </div>
        <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.7;">
            <p><strong>API Endpoint:</strong> POST /api/rag/upload-text</p>
        </div>
    </div>
    <script>
        setTimeout(() => { window.location.href = '/'; }, 8000);
    </script>
</body>
</html>`);
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