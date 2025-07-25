const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ایجاد دیتابیس در پوشه data
const dbPath = path.join(__dirname, '../../data/database.db');
const db = new sqlite3.Database(dbPath);

// ایجاد جدول اگر وجود نداشته باشد
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
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

module.exports = { 
  initDatabase, 
  getAllDocuments, 
  addDocument, 
  closeDatabase 
}; 