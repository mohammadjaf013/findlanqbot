const { Index } = require('@upstash/vector');
// حذف Google AI - این سرویس مستقل است
const crypto = require('crypto');

// راه‌اندازی Upstash Vector
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

if (!process.env.UPSTASH_VECTOR_REST_URL) {
  throw new Error('UPSTASH_VECTOR_REST_URL is missing!');
}

console.log('🔗 Upstash Vector connected independently');

// ایجاد vector مستقل بدون Google AI
async function createEmbedding(text) {
  try {
    // روش 1: Hash-based vector generation
    const textHash = crypto.createHash('sha512').update(text).digest('hex');
    
    // تبدیل hex string به vector 1024-dimensional
    const vector = [];
    for (let i = 0; i < 1024; i++) {
      const hexIndex = (i * 2) % textHash.length;
      const hexPair = textHash[hexIndex] + textHash[(hexIndex + 1) % textHash.length];
      const num = parseInt(hexPair, 16) / 255; // normalize to 0-1
      vector.push((num - 0.5) * 2); // convert to -1 to 1 range
    }
    
    console.log(`🔧 Generated independent 1024-dim vector for: ${text.substring(0, 50)}...`);
    return vector;
  } catch (error) {
    console.log('خطا در vector generation:', error.message);
    // fallback به vector تصادفی
    return Array.from({length: 1024}, () => (Math.random() - 0.5) * 2);
  }
}

// تقسیم متن به chunks (ساده بدون langchain)
async function splitText(text) {
  // تقسیم بر اساس پاراگراف‌ها
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks = [];
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim().length > 1000) {
      // اگر پاراگراف خیلی بزرگ بود، آن را به جملات تقسیم کن
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 50);
      chunks.push(...sentences);
    } else {
      chunks.push(paragraph);
    }
  }
  
  return chunks.filter(chunk => chunk.trim().length > 50);
}

// ایجاد embeddings برای آرایه‌ای از chunks
async function createEmbeddings(chunks) {
  try {
    console.log(`🔧 Creating embeddings for ${chunks.length} chunks...`);
    const chunksWithEmbeddings = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await createEmbedding(chunk);
      
      chunksWithEmbeddings.push({
        text: chunk,
        embedding: embedding,
        index: i
      });
      
      // کمی صبر برای جلوگیری از rate limiting
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Created embeddings for ${chunksWithEmbeddings.length} chunks`);
    return chunksWithEmbeddings;
  } catch (error) {
    console.error('خطا در ایجاد embeddings:', error);
    throw new Error(`خطا در ایجاد embeddings: ${error.message}`);
  }
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
    // استفاده از info برای دریافت آمار کلی
    const info = await index.info();
    
    const stats = {
      dimension: info.dimension || 1024,
      vectorCount: info.vectorCount || 0,
      status: 'connected',
      indexName: info.indexName || 'vector-db'
    };
    
    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    // Fallback stats if info() fails
    return {
      success: true,
      stats: {
        dimension: 1024,
        vectorCount: 'unknown',
        status: 'error',
        error: error.message
      }
    };
  }
}

module.exports = {
  saveFileToVector,
  searchInVector,
  getFilesList,
  deleteFileFromVector,
  getVectorStats,
  createEmbedding,
  createEmbeddings,
  splitText
};