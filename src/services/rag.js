const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { saveFileAndChunks, searchChunks, getFilesList, deleteFile } = require('./db');

// تنظیمات API کلیدها
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDaZf6m6Qc-j_Mky9Zk9jRTQPffvYXQd9M';

// راه‌اندازی Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// بررسی نوع فایل
function isValidFileType(fileName) {
  const allowedTypes = ['.docx', '.doc'];
  const ext = path.extname(fileName).toLowerCase();
  return allowedTypes.includes(ext);
}

// ذخیره فایل آپلود شده
async function saveUploadedFile(file, fileName) {
  const uploadDir = 'uploads';
  
  // ایجاد پوشه اگر وجود نداشته باشد
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filePath = path.join(uploadDir, `${Date.now()}-${fileName}`);
  
  // ذخیره فایل
  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));
  
  return filePath;
}

// استخراج متن از فایل Word
async function extractTextFromWord(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`خطا در استخراج متن از فایل: ${error.message}`);
  }
}

// تقسیم متن به chunks
async function splitText(text) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", ""]
  });
  
  return await textSplitter.splitText(text);
}

// ایجاد Vector Store ساده (بدون embedding برای تست)
async function createVectorStore(texts) {
  try {
    // برای تست، فقط متن‌ها را ذخیره می‌کنیم
    return {
      texts: texts,
      search: async (query, k = 5) => {
        // جستجوی ساده بر اساس کلمات کلیدی
        const queryWords = query.toLowerCase().split(' ');
        const results = texts.filter(text => 
          queryWords.some(word => text.toLowerCase().includes(word))
        );
        return results.slice(0, k).map(text => ({ pageContent: text }));
      }
    };
  } catch (error) {
    throw new Error(`خطا در ایجاد Vector Store: ${error.message}`);
  }
}

// جستجو در Vector Store
async function searchSimilar(vectorStore, query, k = 5) {
  try {
    const results = await vectorStore.search(query, k);
    return results.map(doc => doc.pageContent);
  } catch (error) {
    throw new Error(`خطا در جستجو: ${error.message}`);
  }
}

// پردازش کامل فایل Word و ذخیره در دیتابیس
async function processWordFile(filePath, fileName) {
  try {
    // استخراج متن
    const text = await extractTextFromWord(filePath);
    
    // تقسیم به chunks
    const chunks = await splitText(text);
    
    // ایجاد hash برای فایل
    const fileHash = crypto.createHash('md5').update(text).digest('hex');
    
    // ذخیره در دیتابیس
    await saveFileAndChunks(fileName, fileHash, chunks);
    
    return {
      success: true,
      text: text,
      chunks: chunks,
      fileHash: fileHash,
      message: 'فایل با موفقیت پردازش و ذخیره شد'
    };
  } catch (error) {
    throw new Error(`خطا در پردازش فایل: ${error.message}`);
  }
}

// RAG Query با استفاده از دیتابیس
async function ragQuery(question) {
  try {
    // جستجوی متن‌های مشابه در دیتابیس
    const similarTexts = await searchChunks(question, 5);
    
    // ساخت prompt برای Gemini
    const context = similarTexts.join('\n\n');
    const prompt = `بر اساس متن‌های زیر به سوال پاسخ دهید:

متن‌های مرتبط:
${context}

سوال: ${question}

پاسخ:`;

    return {
      success: true,
      context: similarTexts,
      prompt: prompt,
      message: 'جستجو با موفقیت انجام شد'
    };
  } catch (error) {
    throw new Error(`خطا در RAG Query: ${error.message}`);
  }
}

module.exports = {
  isValidFileType,
  saveUploadedFile,
  processWordFile,
  ragQuery,
  getFilesList,
  deleteFile
}; 