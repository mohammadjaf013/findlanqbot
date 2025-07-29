const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// انتخاب نوع دیتابیس بر اساس متغیر محیطی (فقط در production)
let saveFileAndChunks = null;
let searchChunks = null;
let getFilesList = null;
let deleteFile = null;
let getAllChunksWithEmbeddings = null;

if (process.env.NODE_ENV === 'production') {
  if (process.env.TURSO_DATABASE_URL) {
    const tursoDb = require('./turso-db');
    saveFileAndChunks = tursoDb.saveFileAndChunks;
    searchChunks = tursoDb.searchChunks;
    getFilesList = tursoDb.getFilesList;
    deleteFile = tursoDb.deleteFile;
    getAllChunksWithEmbeddings = tursoDb.getAllChunksWithEmbeddings;
  } else {
    const localDb = require('./db');
    saveFileAndChunks = localDb.saveFileAndChunks;
    searchChunks = localDb.searchChunks;
    getFilesList = localDb.getFilesList;
    deleteFile = localDb.deleteFile;
    getAllChunksWithEmbeddings = localDb.getAllChunksWithEmbeddings;
  }
}

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

// ایجاد embedding برای متن
async function createEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.log('خطا در embedding:', error.message);
    // fallback به vector تصادفی برای تست
    return Array.from({length: 768}, () => Math.random());
  }
}

// محاسبه cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// پردازش کامل فایل Word و ذخیره در دیتابیس
async function processWordFile(filePath, fileName) {
  try {
    // استخراج متن
    const text = await extractTextFromWord(filePath);
    
    // تقسیم به chunks
    const chunks = await splitText(text);
    
    // ایجاد embedding برای هر chunk
    console.log('در حال ایجاد embeddings...');
    const chunksWithEmbeddings = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`پردازش chunk ${i + 1}/${chunks.length}`);
      const embedding = await createEmbedding(chunks[i]);
      chunksWithEmbeddings.push({
        text: chunks[i],
        embedding: embedding
      });
      
      // کمی صبر برای جلوگیری از rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // ایجاد hash برای فایل
    const fileHash = crypto.createHash('md5').update(text).digest('hex');
    
    // ذخیره در دیتابیس (فقط اگر در دسترس باشد)
    if (saveFileAndChunks) {
      await saveFileAndChunks(fileName, fileHash, chunksWithEmbeddings);
    }
    
    return {
      success: true,
      text: text,
      chunks: chunks,
      embeddings: chunksWithEmbeddings.length,
      fileHash: fileHash,
      message: saveFileAndChunks ? 'فایل با موفقیت پردازش و ذخیره شد' : 'فایل پردازش شد اما ذخیره نشد (دیتابیس در دسترس نیست)'
    };
  } catch (error) {
    throw new Error(`خطا در پردازش فایل: ${error.message}`);
  }
}

// RAG Query با استفاده از embedding similarity
async function ragQuery(question) {
  try {
    // ایجاد embedding برای سوال
    console.log('در حال ایجاد embedding برای سوال...');
    const questionEmbedding = await createEmbedding(question);
    
    // دریافت همه chunks از دیتابیس (فقط اگر در دسترس باشد)
    if (!getAllChunksWithEmbeddings) {
      return {
        success: false,
        context: [],
        message: 'دیتابیس در دسترس نیست'
      };
    }
    
    const allChunks = await getAllChunksWithEmbeddings();
    
    if (allChunks.length === 0) {
      return {
        success: false,
        context: [],
        message: 'هیچ فایلی در دیتابیس یافت نشد'
      };
    }
    
    // محاسبه similarity برای همه chunks
    const similarities = allChunks.map(chunk => ({
      text: chunk.text,
      similarity: cosineSimilarity(questionEmbedding, chunk.embedding)
    }));
    
    // مرتب‌سازی بر اساس similarity و انتخاب بهترین‌ها
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topChunks = similarities.slice(0, 5).map(item => item.text);
    
    console.log('Top similarities:', similarities.slice(0, 3).map(s => s.similarity));
    
    return {
      success: true,
      context: topChunks,
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
  getFilesList: getFilesList || (() => Promise.resolve([])),
  deleteFile: deleteFile || (() => Promise.resolve({ success: false, message: 'دیتابیس در دسترس نیست' })),
  createEmbedding,
  cosineSimilarity
}; 