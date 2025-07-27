const { isValidFileType, saveUploadedFile, processWordFile, ragQuery, getFilesList, deleteFile } = require('../services/rag');
const { askGemini } = require('../services/ai');
const fs = require('fs');

module.exports = (app) => {
  // راهنمای استفاده از file upload
  app.get('/api/rag/upload-help', async (c) => {
    return c.json({
      title: 'راهنمای آپلود فایل',
      description: 'برای آپلود فایل Word، باید فایل را به Base64 تبدیل کنید',
      method: 'POST',
      endpoint: '/api/rag/upload',
      contentType: 'application/json',
      bodyFormat: {
        fileName: 'نام فایل با پسوند (مثال: document.docx)',
        fileData: 'محتوای فایل به فرمت Base64',
        fileType: 'نوع فایل (اختیاری)'
      },
      example: {
        fileName: 'sample.docx',
        fileData: 'UEsDBBQAAAAIAAwAAABhPpY...(base64 data here)',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      jsExample: `
// JavaScript example
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const reader = new FileReader();
reader.onload = function(e) {
  const base64Data = e.target.result;
  
  fetch('/api/rag/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileData: base64Data,
      fileType: file.type
    })
  });
};
reader.readAsDataURL(file);`,
      limitations: [
        'حداکثر سایز فایل: 2MB',
        'فقط فایل‌های Word (.doc, .docx) پذیرفته می‌شود',
        'فایل به صورت Base64 encode شده باید ارسال شود'
      ]
    });
  });

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

  // آپلود فایل - حالا در api/rag/upload.js handle می‌شه
  // این route غیرفعال شده و به Vercel function منتقل شده
  /*
  app.post('/api/rag/upload', async (c) => {
    console.log('File upload started');
    
    return new Promise((resolve) => {
      const formidableModule = require('formidable');
      const fs = require('fs');
      
      // دسترسی به raw Node.js request
      const req = c.req.raw || c.env?.incoming || c.req;
      
      console.log('Request method:', req.method);
      console.log('Content-Type:', req.headers['content-type']);
      
      // Create formidable instance
      const form = new formidableModule.IncomingForm({
        uploadDir: '/tmp',
        keepExtensions: true,
        maxFileSize: 2 * 1024 * 1024, // 2MB
        maxFiles: 1,
        allowEmptyFiles: false,
        minFileSize: 1
      });

      form.parse(req, async (err, fields, files) => {
        try {
          if (err) {
            console.error('Formidable parsing error:', err);
            resolve(c.json({ 
              error: 'خطا در پردازش فایل: ' + err.message 
            }, 400));
            return;
          }

          console.log('Parsed files:', Object.keys(files));
          console.log('Parsed fields:', Object.keys(fields));

          const file = files.file;
          if (!file) {
            resolve(c.json({ 
              error: 'فایل انتخاب نشده است. از field name "file" استفاده کنید.' 
            }, 400));
            return;
          }

          // Handle array of files (formidable v3 returns arrays)
          const fileObj = Array.isArray(file) ? file[0] : file;
          const fileName = fileObj.originalFilename || fileObj.name;
          const filePath = fileObj.filepath || fileObj.path;

          console.log('Processing file:', {
            name: fileName,
            path: filePath,
            size: fileObj.size,
            type: fileObj.mimetype || fileObj.type
          });

          // بررسی نوع فایل
          if (!isValidFileType(fileName)) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve(c.json({ 
              error: 'فقط فایل‌های Word (.docx, .doc) مجاز هستند' 
            }, 400));
            return;
          }

          // پردازش فایل
          const result = await processWordFile(filePath, fileName);

          // حذف فایل موقت
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

          resolve(c.json({
            success: true,
            fileName: fileName,
            chunksCount: result.chunks.length,
            fileHash: result.fileHash,
            message: 'فایل با موفقیت آپلود و در دیتابیس ذخیره شد'
          }));

        } catch (error) {
          console.error('Error processing uploaded file:', error);
          resolve(c.json({ 
            error: error.message || 'خطا در پردازش فایل',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          }, 500));
        }
      });
    });
  });
  */

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