const { ulid } = require('ulid');

// حافظه موقت ساده برای sessions
const sessions = new Map();
const conversations = new Map();

// ایجاد session جدید
async function createSession() {
  const sessionId = ulid();
  const now = new Date().toISOString();
  
  const session = {
    id: sessionId,
    createdAt: now,
    lastActivity: now,
    conversations: []
  };
  
  sessions.set(sessionId, session);
  conversations.set(sessionId, []);
  
  console.log(`🆔 Session created: ${sessionId}`);
  return session;
}

// دریافت session
async function getSession(sessionId) {
  if (!sessionId) {
    return null;
  }
  
  const session = sessions.get(sessionId);
  if (session) {
    // به‌روزرسانی آخرین فعالیت
    session.lastActivity = new Date().toISOString();
    sessions.set(sessionId, session);
  }
  
  return session;
}

// اضافه کردن پیام به session
async function addMessageToSession(sessionId, role, content, metadata = {}) {
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
  
  // اضافه کردن پیام
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  conversations.get(sessionId).push(message);
  
  // به‌روزرسانی آخرین فعالیت session
  const session = sessions.get(sessionId);
  if (session) {
    session.lastActivity = now;
    sessions.set(sessionId, session);
  }
  
  console.log(`💬 Message added to session ${sessionId}: ${role} - ${content.substring(0, 50)}...`);
  return true;
}

// دریافت تاریخچه مکالمه
async function getConversationHistory(sessionId, limit = 10) {
  const sessionConversations = conversations.get(sessionId) || [];
  
  return sessionConversations
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

// پاک کردن sessions قدیمی
async function cleanupOldSessions(hoursOld = 24) {
  const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));
  let cleaned = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (new Date(session.lastActivity) < cutoffTime) {
      sessions.delete(sessionId);
      conversations.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} old sessions`);
  }
  
  return cleaned;
}

// آمار sessions
async function getSessionStats() {
  const totalSessions = sessions.size;
  let oldestSession = null;
  
  for (const session of sessions.values()) {
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

// ران کردن cleanup هر ساعت
setInterval(async () => {
  try {
    await cleanupOldSessions(24); // حذف sessions بیش از 24 ساعت
  } catch (error) {
    console.error('Error in session cleanup:', error);
  }
}, 60 * 60 * 1000); // هر ساعت

module.exports = {
  createSession,
  getSession,
  addMessageToSession,
  getConversationHistory,
  buildContextFromHistory,
  cleanupOldSessions,
  getSessionStats
}; 