const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const { 
  saveFileToVector, 
  searchInVector, 
  getFilesList, 
  deleteFileFromVector, 
  getVectorStats 
} = require('../services/upstash-vector');

const router = express.Router();

// تنظیمات multer برای آپلود فایل
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های Word و Text مجاز هستند'));
    }
  }
});

// API آپلود فایل
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'فایل آپلود نشده است'
      });
    }

    const fileName = req.file.originalname;
    let text = '';

    // استخراج متن بر اساس نوع فایل
    const ext = path.extname(fileName).toLowerCase();
    
    if (ext === '.txt') {
      text = req.file.buffer.toString('utf-8');
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    }

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'متن قابل استخراج از فایل یافت نشد'
      });
    }

    // ذخیره در Upstash Vector
    const result = await saveFileToVector(fileName, text, {
      uploadedAt: new Date().toISOString(),
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    res.json(result);
  } catch (error) {
    console.error('خطا در آپلود فایل:', error);
    res.status(500).json({
      success: false,
      message: `خطا در آپلود فایل: ${error.message}`
    });
  }
});

// API آپلود متن مستقیم
router.post('/upload-text', async (req, res) => {
  try {
    const { text, fileName } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'متن وارد نشده است'
      });
    }

    const finalFileName = fileName || `text-${Date.now()}.txt`;

    // ذخیره در Upstash Vector
    const result = await saveFileToVector(finalFileName, text, {
      uploadedAt: new Date().toISOString(),
      source: 'direct_text'
    });

    res.json(result);
  } catch (error) {
    console.error('خطا در آپلود متن:', error);
    res.status(500).json({
      success: false,
      message: `خطا در آپلود متن: ${error.message}`
    });
  }
});

// API جستجو
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 5, fileName } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'سوال وارد نشده است'
      });
    }

    const result = await searchInVector(query, limit, fileName);
    res.json(result);
  } catch (error) {
    console.error('خطا در جستجو:', error);
    res.status(500).json({
      success: false,
      message: `خطا در جستجو: ${error.message}`
    });
  }
});

// API دریافت لیست فایل‌ها
router.get('/files', async (req, res) => {
  try {
    const result = await getFilesList();
    res.json(result);
  } catch (error) {
    console.error('خطا در دریافت لیست فایل‌ها:', error);
    res.status(500).json({
      success: false,
      message: `خطا در دریافت لیست فایل‌ها: ${error.message}`
    });
  }
});

// API حذف فایل
router.delete('/files/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'نام فایل مشخص نشده است'
      });
    }

    const result = await deleteFileFromVector(fileName);
    res.json(result);
  } catch (error) {
    console.error('خطا در حذف فایل:', error);
    res.status(500).json({
      success: false,
      message: `خطا در حذف فایل: ${error.message}`
    });
  }
});

// API دریافت آمار
router.get('/stats', async (req, res) => {
  try {
    const result = await getVectorStats();
    res.json(result);
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    res.status(500).json({
      success: false,
      message: `خطا در دریافت آمار: ${error.message}`
    });
  }
});

// API تست اتصال
router.get('/health', async (req, res) => {
  try {
    const stats = await getVectorStats();
    res.json({
      success: true,
      message: 'Upstash Vector متصل است',
      stats: stats.stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در اتصال به Upstash Vector',
      error: error.message
    });
  }
});

module.exports = router;