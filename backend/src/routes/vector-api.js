const { saveFileToVector, searchInVector, getFilesList, deleteFileFromVector, getVectorStats } = require('../services/upstash-vector');
const { askGemini } = require('../services/ai');

module.exports = (app) => {

// Test endpoint ساده
app.post('/api/vector/test', async (c) => {
  return c.json({
    success: true,
    message: 'تست ساده موفق!'
  });
});

// Test JSON parsing
app.post('/api/vector/test-json', async (c) => {
  try {
  
    const body = await c.req.json();

    return c.json({
      success: true,
      message: 'JSON parsing موفق!',
      receivedKeys: Object.keys(body),
      data: body
    });
  } catch (error) {
    console.log(error)
    return c.json({
      success: false,
      error: error.message
    }, 400);
  }
});

// API آپلود متن مستقیم
app.post('/api/vector/upload-text', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Received body:', body);
    
    const { content, title } = body;
    
    console.log('Content length:', content?.length || 0);
    console.log('Title:', title);

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
app.post('/api/vector/search', async (c) => {
  try {
    const body = await c.req.json();
    const { query, limit = 5, fileName } = body;

    if (!query || !query.trim()) {
      return c.json({
        success: false,
        message: 'سوال وارد نشده است'
      }, 400);
    }

    const result = await searchInVector(query, limit, fileName);
    return c.json(result);
  } catch (error) {
    console.error('خطا در جستجو:', error);
    return c.json({
      success: false,
      message: `خطا در جستجو: ${error.message}`
    }, 500);
  }
});

// API دریافت لیست فایل‌ها
app.get('/api/vector/files', async (c) => {
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
app.delete('/api/vector/files/:fileName', async (c) => {
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

// API دریافت آمار
app.get('/api/vector/stats', async (c) => {
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

// API تست اتصال
app.get('/api/vector/health', async (c) => {
  try {
    const stats = await getVectorStats();
    return c.json({
      success: true,
      message: 'Upstash Vector متصل است',
      stats: stats.stats
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'خطا در اتصال به Upstash Vector',
      error: error.message
    }, 500);
  }
});

// پرسش از Upstash Vector + AI
app.post('/api/vector/ask', async (c) => {
  try {
    const { question, limit = 5 } = await c.req.json();
    
    if (!question || question.trim() === '') {
      return c.json({ 
        error: 'سوال نمی‌تواند خالی باشد' 
      }, 400);
    }

    console.log(`🔍 Vector Ask: "${question}"`);

    // جستجو در Upstash Vector
    const searchResult = await searchInVector(question, limit);
    
    if (!searchResult.success) {
      return c.json({
        error: searchResult.message || 'خطا در جستجو'
      }, 500);
    }

    // استخراج متن‌های مرتبط برای context
    const context = searchResult.results.map(result => result.text);
    
    console.log(`📄 Found ${context.length} relevant chunks`);

    // ارسال به Gemini AI
    const answer = await askGemini(question.trim(), context);

    return c.json({
      success: true,
      question: question.trim(),
      answer: answer,
      context: context,
      chunksUsed: context.length,
      searchResults: searchResult.results.map(r => ({
        text: r.text.substring(0, 200) + '...',
        score: r.score,
        fileName: r.fileName
      }))
    });

  } catch (error) {
    console.error('Error in /api/vector/ask:', error);
    return c.json({ 
      error: error.message || 'خطا در پردازش سوال' 
    }, 500);
  }
});

};