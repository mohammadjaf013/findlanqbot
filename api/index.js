const app = require('../src/app');
const { handle } = require('hono/vercel');

// Database initialization
const { initDatabase } = process.env.TURSO_DATABASE_URL 
  ? require('../src/services/turso-db') 
  : require('../src/services/db');

let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized for Vercel');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
    }
  }
}

// Middleware to ensure DB is initialized
app.use('*', async (c, next) => {
  await ensureDbInitialized();
  await next();
});

module.exports = handle(app); 