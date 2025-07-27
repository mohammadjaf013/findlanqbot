// انتخاب نوع دیتابیس بر اساس متغیر محیطی
const { getAllDocuments } = process.env.TURSO_DATABASE_URL 
  ? require('../services/turso-db') 
  : require('../services/db');
const { askAI } = require('../services/ai');

module.exports = (app) => {
  // روت اصلی برای پرسش
  app.post('/api/ask', async (c) => {
    try {
      const { question, model = 'gemini' } = await c.req.json();
      
      if (!question || question.trim() === '') {
        return c.json({ 
          error: 'سوال نمی‌تواند خالی باشد' 
        }, 400);
      }

      // دریافت اسناد از دیتابیس
      const docs = await getAllDocuments();
      
      // ارسال به مدل هوش مصنوعی
      const answer = await askAI(question.trim(), docs, model);
      
      return c.json({ 
        success: true,
        question: question.trim(),
        answer,
        model,
        documentsCount: docs.length
      });
      
    } catch (error) {
      
      console.error('Error in /api/ask:', error);
      return c.json({ 
        error: error.message || 'خطای داخلی سرور' 
      }, 500);
    }
  });

  // روت برای دریافت وضعیت سرویس
  app.get('/api/health', async (c) => {
    try {
      const docs = await getAllDocuments();
      return c.json({ 
        status: 'healthy',
        documentsCount: docs.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return c.json({ 
        status: 'unhealthy',
        error: error.message 
      }, 500);
    }
  });

  // روت برای اضافه کردن سند جدید (اختیاری)
  app.post('/api/documents', async (c) => {
    try {
      const { content } = await c.req.json();
      
      if (!content || content.trim() === '') {
        return c.json({ 
          error: 'محتوای سند نمی‌تواند خالی باشد' 
        }, 400);
      }

      const { addDocument } = process.env.TURSO_DATABASE_URL 
        ? require('../services/turso-db') 
        : require('../services/db');
      const id = await addDocument(content.trim());
      
      return c.json({ 
        success: true,
        id,
        message: 'سند با موفقیت اضافه شد'
      });
      
    } catch (error) {
      console.error('Error in /api/documents:', error);
      return c.json({ 
        error: error.message || 'خطای داخلی سرور' 
      }, 500);
    }
  });
}; 