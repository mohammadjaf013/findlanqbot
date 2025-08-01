const { ulid } = require('ulid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// بررسی محیط اجرا
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// استفاده از Turso در production
let tursoDb = null;
if (isProduction || isVercel) {
  try {
    tursoDb = require('./turso-db');
    console.log('🔗 Turso connected for session storage');
  } catch (error) {
    console.warn('⚠️ Turso not available, falling back to in-memory storage');
    tursoDb = null;
  }
}

// استفاده از حافظه موقت به عنوان fallback
let inMemoryStorage = {
  sessions: new Map(),
  conversations: new Map()
};

// ایجاد دیتابیس در پوشه data (فقط در development)
let db = null;
let dbPath = null;

if (!isProduction && !isVercel) {
  dbPath = path.join(__dirname, '../../data/database.db');
  db = new sqlite3.Database(dbPath);
}

// ایجاد جدول sessions اگر وجود نداشته باشد (فقط در development)
function initSessionDatabase() {
  if (isProduction || isVercel) {
    return Promise.resolve(); // در production نیازی به init نیست
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not available in production'));
      return;
    }
    
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // ایجاد جدول conversations
      db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

// ایجاد session جدید
async function createSession() {
  if (isProduction || isVercel) {
    const sessionId = ulid();
    const now = new Date().toISOString();
    
    try {
      if (tursoDb) {
        // استفاده از Turso
        return await tursoDb.createSession(sessionId, now);
      } else {
        // استفاده از حافظه موقت
        const session = {
          id: sessionId,
          createdAt: now,
          lastActivity: now,
          conversations: []
        };
        
        inMemoryStorage.sessions.set(sessionId, session);
        console.log(`🆔 Session created (in-memory): ${sessionId}`);
        return session;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      // Fallback به حافظه موقت
      const session = {
        id: sessionId,
        createdAt: now,
        lastActivity: now,
        conversations: []
      };
      
      inMemoryStorage.sessions.set(sessionId, session);
      console.log(`🆔 Session created (fallback): ${sessionId}`);
      return session;
    }
  }
  
  // استفاده از SQLite در development
  await initSessionDatabase();
  
  return new Promise((resolve, reject) => {
    const sessionId = ulid();
    const now = new Date().toISOString();
    
    db.run(
      'INSERT INTO sessions (id, created_at, last_activity) VALUES (?, ?, ?)',
      [sessionId, now, now],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const session = {
          id: sessionId,
          createdAt: now,
          lastActivity: now,
          conversations: []
        };
        
        console.log(`🆔 Session created: ${sessionId}`);
        resolve(session);
      }
    );
  });
}

// دریافت session
async function getSession(sessionId) {
  if (!sessionId) {
    return null;
  }
  
  if (isProduction || isVercel) {
    try {
      if (tursoDb) {
        // استفاده از Turso
        return await tursoDb.getSession(sessionId);
      } else {
        // استفاده از حافظه موقت
        const session = inMemoryStorage.sessions.get(sessionId);
        if (session) {
          // به‌روزرسانی آخرین فعالیت
          session.lastActivity = new Date().toISOString();
          inMemoryStorage.sessions.set(sessionId, session);
        }
        return session;
      }
    } catch (error) {
      console.error('Error getting session:', error);
      // Fallback به حافظه موقت
      const session = inMemoryStorage.sessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date().toISOString();
        inMemoryStorage.sessions.set(sessionId, session);
      }
      return session;
    }
  }
  
  // استفاده از SQLite در development
  await initSessionDatabase();
  
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM sessions WHERE id = ?',
      [sessionId],
      async (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }
        
        // به‌روزرسانی آخرین فعالیت
        const now = new Date().toISOString();
        db.run(
          'UPDATE sessions SET last_activity = ? WHERE id = ?',
          [now, sessionId],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating session activity:', updateErr);
            }
          }
        );
        
        const session = {
          id: row.id,
          createdAt: row.created_at,
          lastActivity: now,
          conversations: []
        };
        
        resolve(session);
      }
    );
  });
}

// اضافه کردن پیام به session
async function addMessageToSession(sessionId, role, content, metadata = {}) {
  if (isProduction || isVercel) {
    try {
      if (tursoDb) {
        // استفاده از Turso
        return await tursoDb.addMessageToSession(sessionId, role, content, metadata);
      } else {
        // استفاده از حافظه موقت
        const messageId = ulid();
        const now = new Date().toISOString();
        
        const message = {
          id: messageId,
          sessionId,
          role,
          content,
          timestamp: now,
          metadata
        };
        
        // اضافه کردن پیام به حافظه
        if (!inMemoryStorage.conversations.has(sessionId)) {
          inMemoryStorage.conversations.set(sessionId, []);
        }
        inMemoryStorage.conversations.get(sessionId).push(message);
        
        // به‌روزرسانی آخرین فعالیت session
        const session = inMemoryStorage.sessions.get(sessionId);
        if (session) {
          session.lastActivity = now;
          inMemoryStorage.sessions.set(sessionId, session);
        }
        
        console.log(`💬 Message added to session ${sessionId} (in-memory): ${role} - ${content.substring(0, 50)}...`);
        return true;
      }
    } catch (error) {
      console.error('Error adding message to session:', error);
      // Fallback به حافظه موقت
      const messageId = ulid();
      const now = new Date().toISOString();
      
      const message = {
        id: messageId,
        sessionId,
        role,
        content,
        timestamp: now,
        metadata
      };
      
      if (!inMemoryStorage.conversations.has(sessionId)) {
        inMemoryStorage.conversations.set(sessionId, []);
      }
      inMemoryStorage.conversations.get(sessionId).push(message);
      
      const session = inMemoryStorage.sessions.get(sessionId);
      if (session) {
        session.lastActivity = now;
        inMemoryStorage.sessions.set(sessionId, session);
      }
      
      console.log(`💬 Message added to session ${sessionId} (fallback): ${role} - ${content.substring(0, 50)}...`);
      return true;
    }
  }
  
  // استفاده از SQLite در development
  await initSessionDatabase();
  
  return new Promise((resolve, reject) => {
    const messageId = ulid();
    const now = new Date().toISOString();
    const metadataJson = JSON.stringify(metadata);
    
    db.run(
      'INSERT INTO conversations (id, session_id, role, content, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [messageId, sessionId, role, content, now, metadataJson],
      function(err) {
        if (err) {
          console.error(`Error adding message to session ${sessionId}:`, err);
          reject(err);
          return;
        }
        
        // به‌روزرسانی آخرین فعالیت session
        db.run(
          'UPDATE sessions SET last_activity = ? WHERE id = ?',
          [now, sessionId],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating session activity:', updateErr);
            }
          }
        );
        
        console.log(`💬 Message added to session ${sessionId}: ${role} - ${content.substring(0, 50)}...`);
        resolve(true);
      }
    );
  });
}

// دریافت تاریخچه مکالمه
async function getConversationHistory(sessionId, limit = 10) {
  if (isProduction || isVercel) {
    try {
      if (tursoDb) {
        // استفاده از Turso
        return await tursoDb.getConversationHistory(sessionId, limit);
      } else {
        // استفاده از حافظه موقت
        const conversations = inMemoryStorage.conversations.get(sessionId) || [];
        return conversations
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-limit)
          .map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            metadata: msg.metadata
          }));
      }
    } catch (error) {
      console.error('Error getting conversation history:', error);
      // Fallback به حافظه موقت
      const conversations = inMemoryStorage.conversations.get(sessionId) || [];
      return conversations
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-limit)
        .map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata
        }));
    }
  }
  
  // استفاده از SQLite در development
  await initSessionDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM conversations WHERE session_id = ? ORDER BY timestamp ASC LIMIT ?',
      [sessionId, limit],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const messages = rows.map(row => ({
          id: row.id,
          role: row.role,
          content: row.content,
          timestamp: row.timestamp,
          metadata: row.metadata ? JSON.parse(row.metadata) : {}
        }));
        
        resolve(messages);
      }
    );
  });
}

// ساخت context برای LangChain از تاریخچه
async function buildContextFromHistory(sessionId, includeLatest = true) {
  const history = await getConversationHistory(sessionId);
  
  if (history.length === 0) {
    return '';
  }
  
  let contextMessages = history;
  if (!includeLatest && history.length > 0) {
    // حذف آخرین پیام (معمولاً سوال فعلی)
    contextMessages = history.slice(0, -1);
  }
  
  const context = contextMessages
    .map(msg => `${msg.role === 'user' ? 'کاربر' : 'کیو'}: ${msg.content}`)
    .join('\n\n');
    
  return context ? `\n\nتاریخچه مکالمه قبلی:\n${context}\n` : '';
}

// پاک کردن sessions قدیمی (cleanup)
async function cleanupOldSessions(hoursOld = 24) {
  if (isProduction || isVercel) {
    try {
      if (tursoDb) {
        // استفاده از Turso
        return await tursoDb.cleanupOldSessions(hoursOld);
      } else {
        // پاک کردن از حافظه موقت
        const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));
        let cleaned = 0;
        
        for (const [sessionId, session] of inMemoryStorage.sessions.entries()) {
          if (new Date(session.lastActivity) < cutoffTime) {
            inMemoryStorage.sessions.delete(sessionId);
            inMemoryStorage.conversations.delete(sessionId);
            cleaned++;
          }
        }
        
        if (cleaned > 0) {
          console.log(`🧹 Cleaned up ${cleaned} old sessions (in-memory)`);
        }
        
        return cleaned;
      }
    } catch (error) {
      console.error('Error in session cleanup:', error);
      return 0;
    }
  }
  
  // استفاده از SQLite در development
  await initSessionDatabase();
  
  return new Promise((resolve, reject) => {
    const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000)).toISOString();
    
    db.run(
      'DELETE FROM sessions WHERE last_activity < ?',
      [cutoffTime],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const cleaned = this.changes;
        if (cleaned > 0) {
          console.log(`🧹 Cleaned up ${cleaned} old sessions`);
        }
        
        resolve(cleaned);
      }
    );
  });
}

// آمار sessions
async function getSessionStats() {
  if (isProduction || isVercel) {
    try {
      if (tursoDb) {
        // استفاده از Turso
        return await tursoDb.getSessionStats();
      } else {
        // آمار از حافظه موقت
        const totalSessions = inMemoryStorage.sessions.size;
        let oldestSession = null;
        
        for (const session of inMemoryStorage.sessions.values()) {
          if (!oldestSession || new Date(session.createdAt) < new Date(oldestSession.createdAt)) {
            oldestSession = session;
          }
        }
        
        return {
          totalSessions,
          activeSessions: totalSessions,
          oldestSession: oldestSession ? oldestSession.createdAt : null
        };
      }
    } catch (error) {
      console.error('Error getting session stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        oldestSession: null
      };
    }
  }
  
  // استفاده از SQLite در development
  await initSessionDatabase();
  
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as total FROM sessions', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      const totalSessions = row.total;
      
      // دریافت قدیمی‌ترین session
      db.get('SELECT MIN(created_at) as oldest FROM sessions', (err, oldestRow) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          totalSessions,
          activeSessions: totalSessions, // فعلاً همه active هستند
          oldestSession: oldestRow.oldest
        });
      });
    });
  });
}

// ران کردن cleanup هر ساعت (فقط در development)
if (!isProduction && !isVercel) {
  setInterval(async () => {
    try {
      await cleanupOldSessions(24); // حذف sessions بیش از 24 ساعت
    } catch (error) {
      console.error('Error in session cleanup:', error);
    }
  }, 60 * 60 * 1000); // هر ساعت
}

module.exports = {
  createSession,
  getSession,
  addMessageToSession,
  getConversationHistory,
  buildContextFromHistory,
  cleanupOldSessions,
  getSessionStats
}; 