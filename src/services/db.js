const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ایجاد دیتابیس در پوشه data
const dbPath = path.join(__dirname, '../../data/database.db');
const db = new sqlite3.Database(dbPath);

// ایجاد جدول اگر وجود نداشته باشد
function initDatabase() {
  return new Promise((resolve, reject) => {
    // ایجاد جدول documents
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // ایجاد جدول files
      db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_name TEXT NOT NULL UNIQUE,
          file_hash TEXT NOT NULL,
          chunks_count INTEGER NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // ایجاد جدول vector_chunks با embedding
        db.run(`
          CREATE TABLE IF NOT EXISTS vector_chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT NOT NULL,
            chunk_text TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            file_hash TEXT NOT NULL,
            embedding TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });
}

// دریافت همه اسناد
function getAllDocuments() {
  return new Promise((resolve, reject) => {
    db.all('SELECT content FROM documents ORDER BY created_at DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => r.content));
    });
  });
}

// اضافه کردن سند جدید
function addDocument(content) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO documents (content) VALUES (?)', [content], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// بستن اتصال دیتابیس
function closeDatabase() {
  db.close();
}

// توابع جدید برای Vector Storage

// ذخیره فایل و chunks آن همراه با embeddings
function saveFileAndChunks(fileName, fileHash, chunksWithEmbeddings) {
  return new Promise((resolve, reject) => {
    // ابتدا فایل را ذخیره می‌کنیم
    db.run(
      'INSERT OR REPLACE INTO files (file_name, file_hash, chunks_count) VALUES (?, ?, ?)',
      [fileName, fileHash, chunksWithEmbeddings.length],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // حذف chunks قبلی این فایل
        db.run('DELETE FROM vector_chunks WHERE file_name = ?', [fileName], (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // ذخیره chunks جدید همراه با embeddings
          const stmt = db.prepare('INSERT INTO vector_chunks (file_name, chunk_text, chunk_index, file_hash, embedding) VALUES (?, ?, ?, ?, ?)');
          
          chunksWithEmbeddings.forEach((item, index) => {
            const embeddingJson = JSON.stringify(item.embedding);
            stmt.run([fileName, item.text, index, fileHash, embeddingJson]);
          });
          
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    );
  });
}

// دریافت همه chunks
function getAllChunks() {
  return new Promise((resolve, reject) => {
    db.all('SELECT chunk_text FROM vector_chunks ORDER BY file_name, chunk_index', (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => r.chunk_text));
    });
  });
}

// دریافت همه chunks همراه با embeddings
function getAllChunksWithEmbeddings() {
  return new Promise((resolve, reject) => {
    db.all('SELECT chunk_text, embedding FROM vector_chunks ORDER BY file_name, chunk_index', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        const chunks = rows.map(row => ({
          text: row.chunk_text,
          embedding: JSON.parse(row.embedding)
        }));
        resolve(chunks);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

// جستجو در chunks بر اساس کلمات کلیدی
function searchChunks(query, limit = 5) {
  return new Promise((resolve, reject) => {
    if (!query || query.trim() === '') {
      // اگر query خالی باشد، همه chunks را برگردان
      db.all('SELECT chunk_text FROM vector_chunks ORDER BY file_name, chunk_index LIMIT ?', [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.chunk_text));
      });
      return;
    }
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const conditions = searchTerms.map(() => 'LOWER(chunk_text) LIKE ?').join(' AND ');
    const params = searchTerms.map(term => `%${term}%`);
    
    db.all(
      `SELECT chunk_text, file_name FROM vector_chunks WHERE ${conditions} ORDER BY file_name, chunk_index LIMIT ?`,
      [...params, limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.chunk_text));
      }
    );
  });
}

// دریافت لیست فایل‌ها
function getFilesList() {
  return new Promise((resolve, reject) => {
    db.all('SELECT file_name, chunks_count, uploaded_at FROM files ORDER BY uploaded_at DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// حذف فایل و chunks آن
function deleteFile(fileName) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM files WHERE file_name = ?', [fileName], (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      db.run('DELETE FROM vector_chunks WHERE file_name = ?', [fileName], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
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