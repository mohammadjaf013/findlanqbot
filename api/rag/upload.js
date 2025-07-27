const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// باید processWordFile و isValidFileType رو import کنیم
const { processWordFile, isValidFileType } = require('../src/services/rag');
const { saveFileAndChunks } = process.env.TURSO_DATABASE_URL 
  ? require('../src/services/turso-db') 
  : require('../src/services/db');

// تنظیمات برای Vercel - غیرفعال کردن bodyParser
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

// Handler اصلی
module.exports = function handler(req, res) {
  // فقط POST method قبول می‌کنیم
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  console.log('File upload started in Vercel function');
  console.log('Headers:', req.headers);

  const form = new formidable.IncomingForm({
    uploadDir: '/tmp',
    keepExtensions: true,
    maxFileSize: 1 * 1024 * 1024, // 1MB - کاهش سایز
    maxTotalFileSize: 1 * 1024 * 1024, // 1MB total
    allowEmptyFiles: false,
    maxFields: 10,
    maxFieldsSize: 2 * 1024, // 2KB for fields
  });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error('Formidable parse error:', err);
        res.status(400).json({ 
          error: 'خطا در پردازش فایل', 
          details: err.message 
        });
        return;
      }

      console.log('Parsed files:', files);
      console.log('Parsed fields:', fields);

      // دریافت فایل
      const file = files.file;
      if (!file) {
        res.status(400).json({ 
          error: 'فایل انتخاب نشده است. از field name "file" استفاده کنید.' 
        });
        return;
      }

      // Handle array (formidable v3)
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
        // حذف فایل موقت
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(400).json({ 
          error: 'فقط فایل‌های Word (.docx, .doc) مجاز هستند' 
        });
        return;
      }

      // پردازش فایل
      const result = await processWordFile(filePath, fileName);

      // حذف فایل موقت
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(200).json({
        success: true,
        fileName: fileName,
        chunksCount: result.chunks.length,
        fileHash: result.fileHash,
        message: 'فایل با موفقیت آپلود و در دیتابیس ذخیره شد'
      });

    } catch (error) {
      console.error('Error in file upload handler:', error);
      res.status(500).json({ 
        error: 'خطای داخلی سرور',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
} 