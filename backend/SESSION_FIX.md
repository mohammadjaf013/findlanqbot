# رفع مشکل SQLite در محیط Production

## مشکل
در محیط production (Vercel)، SQLite فقط خواندنی است و نمی‌تواند عملیات نوشتن انجام دهد. این باعث خطای `SQLITE_READONLY` می‌شود.

## راه حل
فایل `session.js` را اصلاح کردیم تا:

1. **در محیط Development**: از SQLite استفاده کند
2. **در محیط Production**: از Turso (Cloud SQLite) استفاده کند
3. **Fallback**: در صورت عدم دسترسی به Turso، از حافظه موقت استفاده کند

## تغییرات اعمال شده

### 1. تشخیص محیط اجرا
```javascript
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
```

### 2. اتصال به Turso
```javascript
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
```

### 3. حافظه موقت به عنوان fallback
```javascript
let inMemoryStorage = {
  sessions: new Map(),
  conversations: new Map()
};
```

### 4. شرطی کردن استفاده از SQLite
```javascript
if (!isProduction && !isVercel) {
  dbPath = path.join(__dirname, '../../data/database.db');
  db = new sqlite3.Database(dbPath);
}
```

### 5. تنظیم متغیرهای محیطی در Vercel
فایل `vercel.json` به‌روزرسانی شد:
```json
{
  "env": {
    "NODE_ENV": "production",
    "VERCEL": "1"
  }
}
```

### 6. اضافه کردن جداول sessions به Turso
جداول `sessions` و `conversations` به فایل `turso-db.js` اضافه شدند.

### 7. ایجاد خودکار جداول
جداول به طور خودکار در ابتدای اجرا ایجاد می‌شوند.

## مزایا
- ✅ رفع خطای SQLITE_READONLY
- ✅ ذخیره دائمی sessions در Turso
- ✅ عملکرد سریع‌تر در production
- ✅ سازگاری با محیط serverless
- ✅ حفظ عملکرد در development
- ✅ Fallback به حافظه موقت در صورت عدم دسترسی به Turso

## محدودیت‌ها
- نیاز به تنظیم Turso Database
- در صورت عدم دسترسی به Turso، داده‌ها در حافظه موقت ذخیره می‌شوند

## نکات مهم
1. در production، sessions در Turso ذخیره می‌شوند
2. در صورت عدم دسترسی به Turso، از حافظه موقت استفاده می‌شود
3. برای production واقعی، حتماً Turso Database را تنظیم کنید

## راه‌اندازی Turso Database

### 1. نصب Turso CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. ورود به حساب Turso
```bash
turso auth login
```

### 3. ایجاد دیتابیس
```bash
turso db create finlandq-sessions
```

### 4. دریافت اطلاعات اتصال
```bash
turso db tokens create finlandq-sessions
turso db show finlandq-sessions --url
```

### 5. تنظیم متغیرهای محیطی
```bash
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

### 6. ایجاد جداول (مهم!)
```bash
npm run init-turso
```

### 7. تنظیم در Vercel
- در Vercel Dashboard، به بخش Environment Variables بروید
- متغیرهای بالا را اضافه کنید

## ساختار جداول Turso

### جدول sessions
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### جدول conversations
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
);
```

## عیب‌یابی

### خطای "no such table: sessions"
اگر این خطا را دریافت کردید:

1. **اطمینان از تنظیم متغیرهای محیطی**:
   ```bash
   echo $TURSO_DATABASE_URL
   echo $TURSO_AUTH_TOKEN
   ```

2. **اجرای اسکریپت ایجاد جداول**:
   ```bash
   npm run init-turso
   ```

3. **بررسی جداول**:
   ```bash
   turso db shell your-db-name
   .tables
   SELECT COUNT(*) FROM sessions;
   ```

### خطای "Session یافت نشد"
اگر این خطا را دریافت کردید:

1. **تست session management**:
   ```bash
   curl https://bot-api.finlandq.com/api/session/status
   ```

2. **تست ایجاد session**:
   ```bash
   curl -X POST https://bot-api.finlandq.com/api/session/new
   ```

3. **تست ask endpoint**:
   ```bash
   curl -X POST https://bot-api.finlandq.com/api/ask \
     -H "Content-Type: application/json" \
     -d '{"question": "سلام"}'
   ```

4. **بررسی logs در Vercel**:
   - به Vercel Dashboard بروید
   - Functions > Logs را بررسی کنید
   - دنبال پیام‌های "🆔 Created new session" بگردید

5. **تست با فایل HTML**:
   - فایل `test-session.html` را در مرورگر باز کنید
   - همه تست‌ها را اجرا کنید
   npm run init-turso
   ```

3. **بررسی اتصال به دیتابیس**:
   ```bash
   turso db shell finlandq-sessions
   .tables
   ```

4. **در صورت عدم دسترسی به CLI**:
   - جداول به طور خودکار در ابتدای اجرا ایجاد می‌شوند
   - اگر مشکل ادامه داشت، از حافظه موقت استفاده می‌شود 