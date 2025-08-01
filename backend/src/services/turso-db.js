const { createClient } = require('@libsql/client');
const { ulid } = require('ulid');

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
    
    // ایجاد جدول sessions
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ایجاد جدول conversations
    await client.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
      )
    `);
    
    // ایجاد جدول consultations
    await client.execute(`
      CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        salutationtype TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        email TEXT NOT NULL,
        mobile TEXT NOT NULL,
        city TEXT NOT NULL,
        acquainted TEXT NOT NULL,
        position TEXT NOT NULL,
        message TEXT,
        source TEXT DEFAULT 'chatbot',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Turso database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Turso database:', error);
    throw error;
  }
}

// ایجاد جداول در ابتدای اجرا
(async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Failed to initialize database on startup:', error);
  }
})();

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

// ===== SESSION MANAGEMENT FUNCTIONS =====

// ایجاد session جدید
async function createSession(sessionId, createdAt) {
  try {
    // اطمینان از وجود جداول
    await initDatabase();
    
    await client.execute({
      sql: 'INSERT INTO sessions (id, created_at, last_activity) VALUES (?, ?, ?)',
      args: [sessionId, createdAt, createdAt]
    });
    
    const session = {
      id: sessionId,
      createdAt: createdAt,
      lastActivity: createdAt,
      conversations: []
    };
    
    console.log(`🆔 Session created (Turso): ${sessionId}`);
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// دریافت session
async function getSession(sessionId) {
  try {
    // اطمینان از وجود جداول
    await initDatabase();
    
    const result = await client.execute({
      sql: 'SELECT * FROM sessions WHERE id = ?',
      args: [sessionId]
    });
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    const now = new Date().toISOString();
    
    // به‌روزرسانی آخرین فعالیت
    await client.execute({
      sql: 'UPDATE sessions SET last_activity = ? WHERE id = ?',
      args: [now, sessionId]
    });
    
    const session = {
      id: row.id,
      createdAt: row.created_at,
      lastActivity: now,
      conversations: []
    };
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
}

// اضافه کردن پیام به session
async function addMessageToSession(sessionId, role, content, metadata = {}) {
  try {
    // اطمینان از وجود جداول
    await initDatabase();
    
    const messageId = ulid();
    const now = new Date().toISOString();
    const metadataJson = JSON.stringify(metadata);
    
    await client.execute({
      sql: 'INSERT INTO conversations (id, session_id, role, content, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      args: [messageId, sessionId, role, content, now, metadataJson]
    });
    
    // به‌روزرسانی آخرین فعالیت session
    await client.execute({
      sql: 'UPDATE sessions SET last_activity = ? WHERE id = ?',
      args: [now, sessionId]
    });
    
    console.log(`💬 Message added to session ${sessionId} (Turso): ${role} - ${content.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.error('Error adding message to session:', error);
    throw error;
  }
}

// دریافت تاریخچه مکالمه
async function getConversationHistory(sessionId, limit = 10) {
  try {
    // اطمینان از وجود جداول
    await initDatabase();
    
    const result = await client.execute({
      sql: 'SELECT * FROM conversations WHERE session_id = ? ORDER BY timestamp ASC LIMIT ?',
      args: [sessionId, limit]
    });
    
    const messages = result.rows.map(row => ({
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
    
    return messages;
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw error;
  }
}

// پاک کردن sessions قدیمی
async function cleanupOldSessions(hoursOld = 24) {
  try {
    // اطمینان از وجود جداول
    await initDatabase();
    
    const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000)).toISOString();
    
    const result = await client.execute({
      sql: 'DELETE FROM sessions WHERE last_activity < ?',
      args: [cutoffTime]
    });
    
    const cleaned = result.rowsAffected;
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old sessions (Turso)`);
    }
    
    return cleaned;
  } catch (error) {
    console.error('Error in session cleanup:', error);
    throw error;
  }
}

// آمار sessions
async function getSessionStats() {
  try {
    // اطمینان از وجود جداول
    await initDatabase();
    
    const totalResult = await client.execute('SELECT COUNT(*) as total FROM sessions');
    const totalSessions = totalResult.rows[0].total;
    
    const oldestResult = await client.execute('SELECT MIN(created_at) as oldest FROM sessions');
    const oldestSession = oldestResult.rows[0].oldest;
    
    return {
      totalSessions,
      activeSessions: totalSessions,
      oldestSession: oldestSession
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    throw error;
  }
}

// اضافه کردن مشاوره جدید
async function addConsultation(formData) {
  try {
    const consultationId = ulid();
    const position = Array.isArray(formData.position) ? formData.position.join(', ') : formData.position;
    
    await client.execute({
      sql: `
        INSERT INTO consultations (
          id, session_id, salutationtype, first_name, last_name, age, 
          email, mobile, city, acquainted, position, message, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        consultationId,
        formData.sessionId || null,
        formData.salutationtype,
        formData.first_name,
        formData.last_name,
        parseInt(formData.age),
        formData.email,
        formData.mobile,
        formData.city,
        formData.acquainted,
        position,
        formData.message || '',
        formData.source || 'chatbot'
      ]
    });

    console.log('✅ Consultation added successfully:', consultationId);
    return { id: consultationId };
  } catch (error) {
    console.error('❌ Error adding consultation:', error);
    throw error;
  }
}

// دریافت همه مشاوره‌ها
async function getAllConsultations() {
  try {
    const result = await client.execute(`
      SELECT * FROM consultations 
      ORDER BY created_at DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      salutationtype: row.salutationtype,
      first_name: row.first_name,
      last_name: row.last_name,
      age: row.age,
      email: row.email,
      mobile: row.mobile,
      city: row.city,
      acquainted: row.acquainted,
      position: row.position,
      message: row.message,
      source: row.source,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('❌ Error getting consultations:', error);
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
  deleteFile,
  // Session management functions
  createSession,
  getSession,
  addMessageToSession,
  getConversationHistory,
  cleanupOldSessions,
  getSessionStats,
  // Consultation functions
  addConsultation,
  getAllConsultations
}; 