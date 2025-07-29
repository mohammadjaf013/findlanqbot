// انتخاب نوع دیتابیس بر اساس متغیر محیطی (فقط در production)
let getAllDocuments = null;
let addDocument = null;

if (process.env.NODE_ENV === 'production') {
  if (process.env.TURSO_DATABASE_URL) {
    const tursoDb = require('../services/turso-db');
    getAllDocuments = tursoDb.getAllDocuments;
    addDocument = tursoDb.addDocument;
  } else {
    const localDb = require('../services/db');
    getAllDocuments = localDb.getAllDocuments;
    addDocument = localDb.addDocument;
  }
}

const { askAI } = require('../services/ai');
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  // روت ساده برای پرسش با استفاده از فایل finlandq.txt
  app.post('/api/ask', async (c) => {
    try {
      const { question, model = 'gemini' } = await c.req.json();
      
      if (!question || question.trim() === '') {
        return c.json({ 
          error: 'سوال نمی‌تواند خالی باشد' 
        }, 400);
      }

      console.log(`📋 Simple Ask: "${question}"`);

      // خواندن فایل finlandq.txt
      let contextFromFile = '';
      try {
        const filePath = path.join(__dirname, '../../finlandq.txt');
        contextFromFile = fs.readFileSync(filePath, 'utf8');
        console.log(`📖 File loaded: ${contextFromFile.length} characters`);
      } catch (fileError) {
        console.error('خطا در خواندن فایل:', fileError);
        // در صورت عدم دسترسی به فایل، ادامه می‌دهیم با context خالی
      }

      // ارسال به مدل هوش مصنوعی با context فایل
      const answer = await askAI(question.trim(), [contextFromFile], model);
      
      return c.json({ 
        success: true,
        question: question.trim(),
        answer,
        model,
        contextSource: 'finlandq.txt',
        contextLength: contextFromFile.length
      });
      
    } catch (error) {
      console.error('Error in /api/ask:', error);
      return c.json({ 
        error: error.message || 'خطا در پردازش سوال' 
      }, 500);
    }
  });

  // روت برای دریافت وضعیت سرویس
  app.get('/api/health', async (c) => {
    try {
      let docs = [];
      if (getAllDocuments) {
        docs = await getAllDocuments();
      }
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

      if (!addDocument) {
        return c.json({ 
          error: 'سرویس دیتابیس در دسترس نیست' 
        }, 503);
      }

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