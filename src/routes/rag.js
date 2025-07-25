const { isValidFileType, saveUploadedFile, processWordFile, ragQuery } = require('../services/rag');
const { askGemini,askGeminiWithFetch,testGemini } = require('../services/ai');
const fs = require('fs');

// ذخیره Vector Store فعلی در حافظه
let currentVectorStore = null;
let currentFileInfo = null;

module.exports = (app) => {
  // آپلود و پردازش فایل Word
  app.post('/api/rag/upload', async (c) => {
    console.log('upload')
    try {
      const formData = await c.req.formData();
      const file = formData.get('file');
      
      if (!file) {
        return c.json({ 
          error: 'فایل انتخاب نشده است' 
        }, 400);
      }

      // بررسی نوع فایل
      if (!isValidFileType(file.name)) {
        return c.json({ 
          error: 'فقط فایل‌های Word (.docx, .doc) مجاز هستند' 
        }, 400);
      }

      // بررسی اندازه فایل (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return c.json({ 
          error: 'حجم فایل نباید بیشتر از 10MB باشد' 
        }, 400);
      }

      // ذخیره فایل
      const filePath = await saveUploadedFile(file, file.name);
      
      // پردازش فایل
      const result = await processWordFile(filePath);
      
      // ذخیره Vector Store فعلی
      currentVectorStore = result.vectorStore;
      currentFileInfo = {
        fileName: file.name,
        chunks: result.chunks,
        uploadedAt: new Date()
      };

      // حذف فایل موقت
      fs.unlinkSync(filePath);

      return c.json({
        success: true,
        fileName: file.name,
        chunksCount: result.chunks.length,
        message: 'فایل با موفقیت آپلود و پردازش شد'
      });

    } catch (error) {
      console.error('Error in /api/rag/upload:', error);
      return c.json({ 
        error: error.message || 'خطا در پردازش فایل' 
      }, 500);
    }
  });

  // پرسش از فایل آپلود شده
  app.post('/api/rag/ask', async (c) => {
    try {
      const { question } = await c.req.json();
      
      if (!question) {
        return c.json({ 
          error: 'question الزامی است' 
        }, 400);
      }

      // بررسی وجود Vector Store
      if (!currentVectorStore || !currentFileInfo) {
        return c.json({ 
          error: 'ابتدا باید فایلی آپلود کنید' 
        }, 404);
      }

      // RAG Query
      const ragResult = await ragQuery(currentVectorStore, question);
      
      // ارسال به Gemini
      const answer2 = await testGemini();
      console.log(answer2)
      const answer = await askGeminiWithFetch(question, ragResult.context);

      return c.json({
        success: true,
        question: question,
        answer: answer,
        context: ragResult.context,
        fileName: currentFileInfo.fileName,
        chunksUsed: ragResult.context.length
      });

    } catch (error) {
      console.error('Error in /api/rag/ask:', error);
      return c.json({ 
        error: error.message || 'خطا در پردازش سوال' 
      }, 500);
    }
  });

  // اطلاعات فایل فعلی
  app.get('/api/rag/current-file', async (c) => {
    try {
      if (!currentFileInfo) {
        return c.json({
          success: true,
          hasFile: false,
          message: 'هیچ فایلی آپلود نشده است'
        });
      }

      return c.json({
        success: true,
        hasFile: true,
        fileName: currentFileInfo.fileName,
        chunksCount: currentFileInfo.chunks.length,
        uploadedAt: currentFileInfo.uploadedAt
      });

    } catch (error) {
      console.error('Error in /api/rag/current-file:', error);
      return c.json({ 
        error: error.message || 'خطا در دریافت اطلاعات فایل' 
      }, 500);
    }
  });

  // حذف فایل فعلی
  app.delete('/api/rag/current-file', async (c) => {
    try {
      if (!currentFileInfo) {
        return c.json({ 
          error: 'هیچ فایلی برای حذف وجود ندارد' 
        }, 404);
      }

      currentVectorStore = null;
      currentFileInfo = null;

      return c.json({
        success: true,
        message: 'فایل با موفقیت حذف شد'
      });

    } catch (error) {
      console.error('Error in /api/rag/current-file:', error);
      return c.json({ 
        error: error.message || 'خطا در حذف فایل' 
      }, 500);
    }
  });


}; 