const { isValidFileType, saveUploadedFile, processWordFile, ragQuery, getFilesList, deleteFile } = require('../services/rag');
const { askGemini } = require('../services/ai');
const fs = require('fs');

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
      
      // پردازش فایل و ذخیره در دیتابیس
      const result = await processWordFile(filePath, file.name);

      // حذف فایل موقت
      fs.unlinkSync(filePath);

      return c.json({
        success: true,
        fileName: file.name,
        chunksCount: result.chunks.length,
        fileHash: result.fileHash,
        message: 'فایل با موفقیت آپلود و در دیتابیس ذخیره شد'
      });

    } catch (error) {
      console.error('Error in /api/rag/upload:', error);
      return c.json({ 
        error: error.message || 'خطا در پردازش فایل' 
      }, 500);
    }
  });

  // پرسش از همه فایل‌های ذخیره شده
  app.post('/api/rag/ask', async (c) => {
    try {
      const { question } = await c.req.json();
      
      if (!question) {
        return c.json({ 
          error: 'question الزامی است' 
        }, 400);
      }

      // RAG Query از دیتابیس
      const ragResult = await ragQuery(question);
      
      // ارسال به Gemini
      const answer = await askGemini(question, ragResult.context);

      return c.json({
        success: true,
        question: question,
        answer: answer,
        context: ragResult.context,
        chunksUsed: ragResult.context.length
      });

    } catch (error) {
      console.error('Error in /api/rag/ask:', error);
      return c.json({ 
        error: error.message || 'خطا در پردازش سوال' 
      }, 500);
    }
  });

  // لیست همه فایل‌های ذخیره شده
  app.get('/api/rag/files', async (c) => {
    try {
      const files = await getFilesList();
      
      return c.json({
        success: true,
        files: files,
        totalFiles: files.length
      });

    } catch (error) {
      console.error('Error in /api/rag/files:', error);
      return c.json({ 
        error: error.message || 'خطا در دریافت لیست فایل‌ها' 
      }, 500);
    }
  });

  // حذف فایل خاص
  app.delete('/api/rag/files/:fileName', async (c) => {
    try {
      const fileName = c.req.param('fileName');
      
      await deleteFile(fileName);

      return c.json({
        success: true,
        message: 'فایل با موفقیت حذف شد'
      });

    } catch (error) {
      console.error('Error in /api/rag/files/:fileName:', error);
      return c.json({ 
        error: error.message || 'خطا در حذف فایل' 
      }, 500);
    }
  });


}; 