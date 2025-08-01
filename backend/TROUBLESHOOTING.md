# راهنمای عیب‌یابی

## مشکل: "Not Found" Error

### 1. بررسی endpoints موجود

ابتدا endpoint اصلی را تست کنید:
```bash
curl https://bot-api.finlandq.com/
```

### 2. تست endpoint ساده
```bash
curl https://bot-api.finlandq.com/test
```

### 3. بررسی health endpoint
```bash
curl https://bot-api.finlandq.com/api/health
```

### 4. تست session endpoint
```bash
curl -X POST https://bot-api.finlandq.com/api/session/new \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 5. تست ask endpoint
```bash
curl -X POST https://bot-api.finlandq.com/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "سلام"}'
```

## مشکل: Database Errors

### خطای "no such table: sessions"

1. **اجرای اسکریپت ایجاد جداول**:
   ```bash
   npm run init-turso
   ```

2. **بررسی متغیرهای محیطی**:
   ```bash
   echo $TURSO_DATABASE_URL
   echo $TURSO_AUTH_TOKEN
   ```

3. **بررسی اتصال به دیتابیس**:
   ```bash
   turso db shell your-db-name
   .tables
   ```

## مشکل: CORS Errors

### تنظیم CORS در frontend

```javascript
// در frontend
const response = await fetch('https://bot-api.finlandq.com/api/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'سوال شما'
  })
});
```

## مشکل: Environment Variables

### بررسی متغیرهای محیطی در Vercel

1. به Vercel Dashboard بروید
2. پروژه را انتخاب کنید
3. به Settings > Environment Variables بروید
4. متغیرهای زیر را بررسی کنید:
   - `NODE_ENV=production`
   - `VERCEL=1`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `GEMINI_API_KEY`

## مشکل: Routing Issues

### بررسی routing در development

```bash
# اجرای سرور در development
npm run dev

# تست endpoints محلی
curl http://localhost:3001/
curl http://localhost:3001/test
curl http://localhost:3001/api/health
```

### تست endpoints با اسکریپت
```bash
npm run test-endpoints
```

## مشکل: Session Management

### بررسی session storage

1. **تست ایجاد session**:
   ```bash
   curl -X POST https://bot-api.finlandq.com/api/session/new
   ```

2. **تست دریافت تاریخچه**:
   ```bash
   curl https://bot-api.finlandq.com/api/session/YOUR_SESSION_ID/history
   ```

3. **تست آمار sessions**:
   ```bash
   curl https://bot-api.finlandq.com/api/session/stats
   ```

## مشکل: AI Service

### بررسی Gemini API

1. **بررسی API Key**:
   ```bash
   echo $GEMINI_API_KEY
   ```

2. **تست AI service**:
   ```bash
   curl -X POST https://bot-api.finlandq.com/api/ask \
     -H "Content-Type: application/json" \
     -d '{"question": "سلام، چطوری؟"}'
   ```

## مشکل: File Upload

### بررسی file upload

1. **تست upload فایل**:
   ```bash
   curl -X POST https://bot-api.finlandq.com/api/rag/upload \
     -F "file=@your-file.pdf"
   ```

2. **تست upload متن**:
   ```bash
   curl -X POST https://bot-api.finlandq.com/api/rag/upload-text \
     -H "Content-Type: application/json" \
     -d '{"content": "متن تست"}'
   ```

## مشکل: Vector Search

### بررسی vector search

1. **تست جستجو**:
   ```bash
   curl -X POST https://bot-api.finlandq.com/api/vector/search \
     -H "Content-Type: application/json" \
     -d '{"query": "جستجوی شما"}'
   ```

2. **بررسی فایل‌های موجود**:
   ```bash
   curl https://bot-api.finlandq.com/api/vector/files
   ```

## مشکل: Performance

### بررسی عملکرد

1. **بررسی response time**:
   ```bash
   time curl https://bot-api.finlandq.com/api/health
   ```

2. **بررسی memory usage**:
   - در Vercel Dashboard > Functions
   - بررسی memory usage و execution time

## مشکل: Logs

### بررسی logs در Vercel

1. به Vercel Dashboard بروید
2. پروژه را انتخاب کنید
3. به Functions بروید
4. روی function کلیک کنید
5. Logs را بررسی کنید

### بررسی logs محلی

```bash
npm run dev
# logs در console نمایش داده می‌شوند
```

## مشکل: Deployment

### بررسی deployment

1. **بررسی build logs**:
   - در Vercel Dashboard > Deployments
   - آخرین deployment را بررسی کنید

2. **بررسی function logs**:
   - در Vercel Dashboard > Functions
   - logs را بررسی کنید

3. **بررسی environment variables**:
   - در Vercel Dashboard > Settings > Environment Variables
   - همه متغیرها را بررسی کنید

## مشکل: Database Connection

### بررسی اتصال به Turso

1. **تست اتصال**:
   ```bash
   turso db shell your-db-name
   .tables
   SELECT COUNT(*) FROM sessions;
   ```

2. **بررسی tokens**:
   ```bash
   turso db tokens list your-db-name
   ```

3. **ایجاد token جدید**:
   ```bash
   turso db tokens create your-db-name
   ```

## مشکل: API Limits

### بررسی محدودیت‌های API

1. **Gemini API limits**:
   - بررسی quota در Google Cloud Console
   - بررسی billing

2. **Turso limits**:
   - بررسی usage در Turso Dashboard
   - بررسی plan limits

3. **Vercel limits**:
   - بررسی usage در Vercel Dashboard
   - بررسی plan limits

## مشکل: Security

### بررسی امنیت

1. **بررسی CORS**:
   - اطمینان از تنظیم صحیح CORS
   - بررسی origin headers

2. **بررسی API keys**:
   - اطمینان از عدم افشای API keys
   - بررسی environment variables

3. **بررسی rate limiting**:
   - بررسی rate limiting در Vercel
   - بررسی API limits

## مشکل: Monitoring

### بررسی monitoring

1. **Vercel Analytics**:
   - بررسی performance metrics
   - بررسی error rates

2. **Custom monitoring**:
   - اضافه کردن logging
   - بررسی response times

3. **Health checks**:
   - تست endpoint `/api/health`
   - بررسی database connectivity

## مشکل: Recent Backend Errors

### خطای TypeError: require(...) is not a function
**خطا:** `TypeError: require(...) is not a function` در `turso-db.js:300:38`

**علت:** استفاده نادرست از `require('ulid')()` در محیط‌های خاص

**راه حل:**
1. اطمینان از import صحیح در بالای فایل:
   ```javascript
   const { ulid } = require('ulid');
   ```
2. استفاده از `ulid()` به جای `require('ulid')()`:
   ```javascript
   // ❌ اشتباه
   const messageId = require('ulid')();
   
   // ✅ درست
   const messageId = ulid();
   ```

### خطای GoogleGenerativeAIError: models/gemini-2.0-flash-exp is not found
**خطا:** `GoogleGenerativeAIError: [404 Not Found] models/gemini-2.0-flash-exp is not found`

**علت:** مدل `gemini-2.0-flash-exp` در دسترس نیست یا نام آن اشتباه است

**راه حل:**
1. استفاده از مدل صحیح:
   ```javascript
   // ❌ اشتباه
   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
   
   // ✅ درست
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
   ```

2. بررسی environment variable:
   ```javascript
   // ❌ اشتباه
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
   
   // ✅ درست
   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   ```

3. تست fixes:
   ```bash
   node test-fixes.js
   ```

### تست Fixes
برای تست کردن fixes اخیر:
```bash
# اجرای تست script
node test-fixes.js

# بررسی خروجی
# باید پیام‌های زیر را ببینید:
# ✅ ulid test passed: [ID]
# ✅ AI model test passed: gemini-1.5-flash is accessible
# ✅ GEMINI_API_KEY is set
``` 