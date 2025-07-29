const { Hono } = require('hono');
const { 
  saveFileToVector, 
  searchInVector, 
  getFilesList, 
  deleteFileFromVector, 
  getVectorStats 
} = require('../services/upstash-vector');

const app = new Hono();

// API آپلود متن مستقیم
app.post('/upload-text', async (c) => {
  try {
    const body = await c.req.json();
    const { title, content } = body;

    if (!content || !content.trim()) {
      return c.json({
        success: false,
        message: 'متن وارد نشده است'
      }, 400);
    }

    const finalFileName = title || `text-${Date.now()}.txt`;

    // ذخیره در Upstash Vector
    const result = await saveFileToVector(finalFileName, content, {
      uploadedAt: new Date().toISOString(),
      source: 'direct_text'
    });

    return c.json(result);
  } catch (error) {
    console.error('خطا در آپلود متن:', error);
    return c.json({
      success: false,
      message: `خطا در آپلود متن: ${error.message}`
    }, 500);
  }
});

// API جستجو
app.post('/search', async (c) => {
  try {
    const body = await c.req.json();
    const { query } = body;

    if (!query || !query.trim()) {
      return c.json({
        success: false,
        message: 'سوال وارد نشده است'
      }, 400);
    }

    const result = await searchInVector(query);
    return c.json(result);
  } catch (error) {
    console.error('خطا در جستجو:', error);
    return c.json({
      success: false,
      message: `خطا در جستجو: ${error.message}`
    }, 500);
  }
});

// API لیست فایل‌ها
app.get('/files', async (c) => {
  try {
    const result = await getFilesList();
    return c.json(result);
  } catch (error) {
    console.error('خطا در دریافت لیست فایل‌ها:', error);
    return c.json({
      success: false,
      message: `خطا در دریافت لیست فایل‌ها: ${error.message}`
    }, 500);
  }
});

// API حذف فایل
app.delete('/files/:fileName', async (c) => {
  try {
    const fileName = c.req.param('fileName');
    
    if (!fileName) {
      return c.json({
        success: false,
        message: 'نام فایل مشخص نشده است'
      }, 400);
    }

    const result = await deleteFileFromVector(fileName);
    return c.json(result);
  } catch (error) {
    console.error('خطا در حذف فایل:', error);
    return c.json({
      success: false,
      message: `خطا در حذف فایل: ${error.message}`
    }, 500);
  }
});

// API آمار Vector
app.get('/stats', async (c) => {
  try {
    const result = await getVectorStats();
    return c.json(result);
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    return c.json({
      success: false,
      message: `خطا در دریافت آمار: ${error.message}`
    }, 500);
  }
});

// Health Check
app.get('/health', async (c) => {
  return c.json({
    success: true,
    message: 'Upstash Vector API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;