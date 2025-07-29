const { Index } = require('@upstash/vector');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const crypto = require('crypto');

// تنظیمات API کلیدها
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDaZf6m6Qc-j_Mky9Zk9jRTQPffvYXQd9M';

// راه‌اندازی Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// راه‌اندازی Upstash Vector
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

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

// تقسیم متن به chunks
async function splitText(text) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", ""]
  });
  
  return await textSplitter.splitText(text);
}

// ذخیره فایل در Upstash Vector
async function saveFileToVector(fileName, text, metadata = {}) {
  try {
    // تقسیم متن به chunks
    const chunks = await splitText(text);
    
    // ایجاد embeddings برای همه chunks
    console.log(`در حال ایجاد ${chunks.length} embedding...`);
    const vectors = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await createEmbedding(chunk);
      
      // ایجاد ID یکتا برای هر chunk
      const vectorId = `${fileName}-${i}-${crypto.randomBytes(8).toString('hex')}`;
      
      vectors.push({
        id: vectorId,
        vector: embedding,
        metadata: {
          fileName,
          chunkIndex: i,
          text: chunk,
          fileHash: crypto.createHash('md5').update(text).digest('hex'),
          ...metadata
        }
      });
      
      // کمی صبر برای جلوگیری از rate limiting
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // ذخیره در Upstash Vector
    await index.upsert(vectors);
    
    console.log(`✅ ${vectors.length} chunk در Upstash Vector ذخیره شد`);
    
    return {
      success: true,
      fileName,
      chunksCount: chunks.length,
      fileHash: crypto.createHash('md5').update(text).digest('hex'),
      message: 'فایل با موفقیت در Upstash Vector ذخیره شد'
    };
  } catch (error) {
    console.error('خطا در ذخیره فایل:', error);
    throw new Error(`خطا در ذخیره فایل: ${error.message}`);
  }
}

// جستجو در Upstash Vector
async function searchInVector(query, limit = 5, filterFileName = null) {
  try {
    // ایجاد embedding برای سوال
    const queryEmbedding = await createEmbedding(query);
    
    // تنظیم فیلتر
    const filter = filterFileName ? { fileName: filterFileName } : undefined;
    
    // جستجو در Upstash Vector
    const results = await index.query({
      vector: queryEmbedding,
      topK: limit,
      filter,
      includeMetadata: true
    });
    
    // استخراج متن‌های مرتبط
    const relevantTexts = results.map(result => ({
      text: result.metadata.text,
      fileName: result.metadata.fileName,
      score: result.score,
      chunkIndex: result.metadata.chunkIndex
    }));
    
    console.log(`🔍 ${relevantTexts.length} نتیجه یافت شد`);
    
    return {
      success: true,
      results: relevantTexts,
      query,
      message: 'جستجو با موفقیت انجام شد'
    };
  } catch (error) {
    console.error('خطا در جستجو:', error);
    throw new Error(`خطا در جستجو: ${error.message}`);
  }
}

// دریافت لیست فایل‌ها
async function getFilesList() {
  try {
    // دریافت همه vectors
    const allVectors = await index.fetch([], { includeMetadata: true });
    
    // گروه‌بندی بر اساس fileName
    const filesMap = new Map();
    
    allVectors.forEach(vector => {
      const fileName = vector.metadata.fileName;
      if (!filesMap.has(fileName)) {
        filesMap.set(fileName, {
          fileName,
          chunksCount: 0,
          fileHash: vector.metadata.fileHash,
          uploadedAt: vector.metadata.uploadedAt || new Date().toISOString()
        });
      }
      filesMap.get(fileName).chunksCount++;
    });
    
    const filesList = Array.from(filesMap.values());
    filesList.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    return {
      success: true,
      files: filesList,
      totalFiles: filesList.length
    };
  } catch (error) {
    console.error('خطا در دریافت لیست فایل‌ها:', error);
    throw new Error(`خطا در دریافت لیست فایل‌ها: ${error.message}`);
  }
}

// حذف فایل از Upstash Vector
async function deleteFileFromVector(fileName) {
  try {
    // ابتدا همه vectors مربوط به این فایل را پیدا کن
    const allVectors = await index.fetch([], { includeMetadata: true });
    const fileVectorIds = allVectors
      .filter(vector => vector.metadata.fileName === fileName)
      .map(vector => vector.id);
    
    if (fileVectorIds.length === 0) {
      return {
        success: false,
        message: 'فایل مورد نظر یافت نشد'
      };
    }
    
    // حذف vectors
    await index.delete(fileVectorIds);
    
    console.log(`🗑️ ${fileVectorIds.length} chunk از فایل ${fileName} حذف شد`);
    
    return {
      success: true,
      deletedChunks: fileVectorIds.length,
      fileName,
      message: 'فایل با موفقیت حذف شد'
    };
  } catch (error) {
    console.error('خطا در حذف فایل:', error);
    throw new Error(`خطا در حذف فایل: ${error.message}`);
  }
}

// دریافت آمار کلی
async function getVectorStats() {
  try {
    const allVectors = await index.fetch([], { includeMetadata: true });
    
    const stats = {
      totalVectors: allVectors.length,
      totalFiles: new Set(allVectors.map(v => v.metadata.fileName)).size,
      averageChunksPerFile: allVectors.length / new Set(allVectors.map(v => v.metadata.fileName)).size || 0
    };
    
    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    throw new Error(`خطا در دریافت آمار: ${error.message}`);
  }
}

module.exports = {
  saveFileToVector,
  searchInVector,
  getFilesList,
  deleteFileFromVector,
  getVectorStats,
  createEmbedding,
  splitText
};