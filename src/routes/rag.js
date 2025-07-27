const { isValidFileType, saveUploadedFile, processWordFile, ragQuery, getFilesList, deleteFile } = require('../services/rag');
const { askGemini } = require('../services/ai');
const fs = require('fs');

module.exports = (app) => {
  // آپلود متن مستقیم به جای فایل
  app.post('/api/rag/upload-text', async (c) => {
    try {
      const { content, title } = await c.req.json();
      
      if (!content || content.trim() === '') {
        return c.json({ 
          error: 'محتوای متن الزامی است' 
        }, 400);
      }

      const fileName = title || `text_${Date.now()}.txt`;
      
      // تقسیم متن به chunks
      const chunks = content.split('\n\n').filter(chunk => chunk.trim().length > 0);
      
      if (chunks.length === 0) {
        return c.json({ 
          error: 'محتوای معتبر یافت نشد' 
        }, 400);
      }

      // ایجاد hash برای فایل
      const crypto = require('crypto');
      const fileHash = crypto.createHash('md5').update(content).digest('hex');

      // ایجاد embeddings و ذخیره
      const { createEmbeddings } = require('../services/ai');
      const chunksWithEmbeddings = await createEmbeddings(chunks);
      
      await saveFileAndChunks(fileName, fileHash, chunksWithEmbeddings);

      return c.json({
        success: true,
        fileName: fileName,
        chunksCount: chunks.length,
        fileHash: fileHash,
        message: 'محتوای متنی با موفقیت پردازش و ذخیره شد'
      });

    } catch (error) {
      console.error('Error in /api/rag/upload-text:', error);
      return c.json({ 
        error: error.message || 'خطا در پردازش محتوای متنی' 
      }, 500);
    }
  });

  // آپلود و پردازش فایل Word
  app.post('/api/rag/upload', async (c) => {
    console.log('upload started');
    try {
      // مستقیماً از Hono formData استفاده می‌کنیم
      const formData = await c.req.formData();
      const file = formData.get('file');
      
      if (!file) {
        return c.json({ 
          error: 'فایل انتخاب نشده است' 
        }, 400);
      }

      console.log('File info:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // بررسی نوع فایل
      if (!isValidFileType(file.name)) {
        return c.json({ 
          error: 'فقط فایل‌های Word (.docx, .doc) مجاز هستند' 
        }, 400);
      }

      // بررسی اندازه فایل (2MB برای Vercel)
      if (file.size > 2 * 1024 * 1024) {
        return c.json({ 
          error: 'حجم فایل نباید بیشتر از 2MB باشد (محدودیت Vercel)' 
        }, 400);
      }

      // تبدیل File object به buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // ذخیره موقت در /tmp
      const tempPath = `/tmp/upload_${Date.now()}_${file.name}`;
      const fs = require('fs');
      fs.writeFileSync(tempPath, buffer);
      
      console.log('File saved to:', tempPath);
      
      // پردازش فایل
      const result = await processWordFile(tempPath, file.name);

      // حذف فایل موقت
      fs.unlinkSync(tempPath);

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
        error: error.message || 'خطا در پردازش فایل',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

  // تست RAG - برای بررسی embeddings
  app.post('/api/rag/test', async (c) => {
    try {
      const { question } = await c.req.json();
      
      if (!question) {
        return c.json({ 
          error: 'question الزامی است' 
        }, 400);
      }

      // RAG Query بدون استفاده از Gemini
      const ragResult = await ragQuery(question);
      
      return c.json({
        success: true,
        question: question,
        context: ragResult.context,
        chunksUsed: ragResult.context.length,
        message: 'تست RAG موفقیت‌آمیز بود'
      });

    } catch (error) {
      console.error('Error in /api/rag/test:', error);
      return c.json({ 
        error: error.message || 'خطا در تست RAG' 
      }, 500);
    }
  });

}; 