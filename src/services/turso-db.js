const { createClient } = require('@libsql/client');

// تنظیمات Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ایجاد جداول اگر وجود نداشته باشند
async function initDatabase() {
  try {
    // ایجاد جدول documents
    await client.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ایجاد جدول files
    await client.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT NOT NULL UNIQUE,
        file_hash TEXT NOT NULL,
        chunks_count INTEGER NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ایجاد جدول vector_chunks با embedding
    await client.execute(`
      CREATE TABLE IF NOT EXISTS vector_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT NOT NULL,
        chunk_text TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        file_hash TEXT NOT NULL,
        embedding TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Turso database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Turso database:', error);
    throw error;
  }
}

// دریافت همه اسناد
async function getAllDocuments() {
  try {
    const result = await client.execute('SELECT content FROM documents ORDER BY created_at DESC');
    return result.rows.map(row => row.content);
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

// اضافه کردن سند جدید
async function addDocument(content) {
  try {
    const result = await client.execute({
      sql: 'INSERT INTO documents (content) VALUES (?)',
      args: [content]
    });
    return result.lastInsertRowid;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// ذخیره فایل و chunks آن همراه با embeddings
async function saveFileAndChunks(fileName, fileHash, chunksWithEmbeddings) {
  try {
    // ابتدا فایل را ذخیره می‌کنیم
    await client.execute({
      sql: 'INSERT OR REPLACE INTO files (file_name, file_hash, chunks_count) VALUES (?, ?, ?)',
      args: [fileName, fileHash, chunksWithEmbeddings.length]
    });
    
    // حذف chunks قبلی این فایل
    await client.execute({
      sql: 'DELETE FROM vector_chunks WHERE file_name = ?',
      args: [fileName]
    });
    
    // ذخیره chunks جدید همراه با embeddings
    for (let i = 0; i < chunksWithEmbeddings.length; i++) {
      const item = chunksWithEmbeddings[i];
      const embeddingJson = JSON.stringify(item.embedding);
      
      await client.execute({
        sql: 'INSERT INTO vector_chunks (file_name, chunk_text, chunk_index, file_hash, embedding) VALUES (?, ?, ?, ?, ?)',
        args: [fileName, item.text, i, fileHash, embeddingJson]
      });
    }
    
    console.log(`✅ Saved ${chunksWithEmbeddings.length} chunks for file: ${fileName}`);
  } catch (error) {
    console.error('Error saving file and chunks:', error);
    throw error;
  }
}

// دریافت همه chunks
async function getAllChunks() {
  try {
    const result = await client.execute('SELECT chunk_text FROM vector_chunks ORDER BY file_name, chunk_index');
    return result.rows.map(row => row.chunk_text);
  } catch (error) {
    console.error('Error getting chunks:', error);
    throw error;
  }
}

// دریافت همه chunks همراه با embeddings
async function getAllChunksWithEmbeddings() {
  try {
    const result = await client.execute('SELECT chunk_text, embedding FROM vector_chunks ORDER BY file_name, chunk_index');
    
    const chunks = result.rows.map(row => ({
      text: row.chunk_text,
      embedding: JSON.parse(row.embedding)
    }));
    
    return chunks;
  } catch (error) {
    console.error('Error getting chunks with embeddings:', error);
    throw error;
  }
}

// جستجو در chunks بر اساس کلمات کلیدی
async function searchChunks(query, limit = 5) {
  try {
    if (!query || query.trim() === '') {
      // اگر query خالی باشد، همه chunks را برگردان
      const result = await client.execute({
        sql: 'SELECT chunk_text FROM vector_chunks ORDER BY file_name, chunk_index LIMIT ?',
        args: [limit]
      });
      return result.rows.map(row => row.chunk_text);
    }
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const conditions = searchTerms.map(() => 'LOWER(chunk_text) LIKE ?').join(' AND ');
    const params = searchTerms.map(term => `%${term}%`);
    
    const result = await client.execute({
      sql: `SELECT chunk_text FROM vector_chunks WHERE ${conditions} ORDER BY file_name, chunk_index LIMIT ?`,
      args: [...params, limit]
    });
    
    return result.rows.map(row => row.chunk_text);
  } catch (error) {
    console.error('Error searching chunks:', error);
    throw error;
  }
}

// دریافت لیست فایل‌ها
async function getFilesList() {
  try {
    const result = await client.execute('SELECT file_name, chunks_count, uploaded_at FROM files ORDER BY uploaded_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting files list:', error);
    throw error;
  }
}

// حذف فایل و chunks آن
async function deleteFile(fileName) {
  try {
    await client.execute({
      sql: 'DELETE FROM files WHERE file_name = ?',
      args: [fileName]
    });
    
    await client.execute({
      sql: 'DELETE FROM vector_chunks WHERE file_name = ?',
      args: [fileName]
    });
    
    console.log(`✅ Deleted file: ${fileName}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// بستن اتصال (برای سازگاری - Turso خودکار مدیریت می‌شود)
function closeDatabase() {
  console.log('Turso connection will be managed automatically');
}

module.exports = { 
  initDatabase, 
  getAllDocuments, 
  addDocument, 
  closeDatabase,
  saveFileAndChunks,
  getAllChunks,
  getAllChunksWithEmbeddings,
  searchChunks,
  getFilesList,
  deleteFile
}; 