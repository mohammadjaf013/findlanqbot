# FindLanQBot - پلتفرم چت هوش مصنوعی

پلتفرم چت هوش مصنوعی با قابلیت پاسخ بر اساس اسناد موجود در دیتابیس.

## 🚀 ویژگی‌ها

- **بک‌اند**: Hono.js (سریع و مناسب سرورلس)
- **فرانت‌اند**: Next.js با TypeScript
- **هوش مصنوعی**: پشتیبانی از Gemini API (قابل گسترش)
- **دیتابیس**: SQLite (قابل تغییر به سایر دیتابیس‌ها)
- **دیپلوی**: پشتیبانی از سرور عادی و AWS Lambda
- **فرانت‌اند**: پشتیبانی از Vercel و سرور عادی

## 📁 ساختار پروژه

```
findlanqbot/
├── src/                    # بک‌اند Hono
│   ├── app.js             # نقطه ورود اصلی
│   ├── routes/
│   │   └── ask.js         # روت‌های API
│   └── services/
│       ├── db.js          # سرویس دیتابیس
│       └── ai.js          # سرویس هوش مصنوعی
├── frontend/              # فرانت‌اند Next.js
│   ├── app/
│   │   ├── page.tsx       # صفحه اصلی
│   │   ├── layout.tsx     # layout اصلی
│   │   └── globals.css    # استایل‌های اصلی
│   ├── package.json
│   └── next.config.js
├── .github/workflows/     # GitHub Actions
│   ├── deploy-backend-server.yml
│   ├── deploy-backend-aws.yml
│   ├── deploy-frontend-vercel.yml
│   └── deploy-frontend-server.yml
└── package.json
```

## 🛠️ نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- npm یا yarn

### ۱. کلون کردن پروژه

```bash
git clone <repository-url>
cd findlanqbot
```

### ۲. راه‌اندازی بک‌اند

```bash
# نصب وابستگی‌ها
npm install

# کپی کردن فایل محیطی
cp env.example .env

# ویرایش فایل .env و اضافه کردن کلید API
# GEMINI_API_KEY=your_api_key_here

# راه‌اندازی سرور
npm run dev
```

### ۳. راه‌اندازی فرانت‌اند

```bash
cd frontend

# نصب وابستگی‌ها
npm install

# راه‌اندازی سرور توسعه
npm run dev
```

## 🔧 تنظیمات

### متغیرهای محیطی

فایل `.env` را ایجاد کنید:

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### کلید API Gemini

1. به [Google AI Studio](https://makersuite.google.com/app/apikey) بروید
2. یک کلید API جدید ایجاد کنید
3. کلید را در فایل `.env` قرار دهید

## 📡 API Endpoints

### `POST /api/ask`
پرسش از مدل هوش مصنوعی

```json
{
  "question": "سوال شما",
  "model": "gemini" // اختیاری، پیش‌فرض: gemini
}
```

**پاسخ:**
```json
{
  "success": true,
  "question": "سوال شما",
  "answer": "پاسخ مدل هوش مصنوعی",
  "model": "gemini",
  "documentsCount": 5
}
```

### `GET /api/health`
بررسی وضعیت سرویس

### `POST /api/documents`
اضافه کردن سند جدید

```json
{
  "content": "محتوای سند"
}
```

## 🚀 دیپلوی

### GitHub Secrets

برای دیپلوی، این متغیرها را در GitHub Secrets قرار دهید:

#### برای سرور عادی:
- `SERVER_HOST`: آدرس سرور
- `SERVER_USER`: نام کاربری
- `SERVER_SSH_KEY`: کلید SSH خصوصی
- `SERVER_TARGET_PATH`: مسیر نصب بک‌اند
- `SERVER_TARGET_PATH_FRONTEND`: مسیر نصب فرانت‌اند

#### برای AWS Lambda:
- `AWS_ACCESS_KEY_ID`: کلید دسترسی AWS
- `AWS_SECRET_ACCESS_KEY`: کلید مخفی AWS
- `AWS_REGION`: منطقه AWS
- `AWS_LAMBDA_FUNCTION_NAME`: نام تابع Lambda
- `GEMINI_API_KEY`: کلید API Gemini

#### برای Vercel:
- `VERCEL_TOKEN`: توکن Vercel
- `VERCEL_ORG_ID`: آیدی سازمان Vercel
- `VERCEL_PROJECT_ID`: آیدی پروژه Vercel

### دیپلوی خودکار

پس از push به branch `main`، دیپلوی به صورت خودکار انجام می‌شود.

## 🔄 گسترش مدل‌های هوش مصنوعی

برای اضافه کردن مدل جدید (مثل Kimi یا Sonat):

1. فایل `src/services/ai.js` را ویرایش کنید
2. تابع جدید اضافه کنید
3. در switch statement اضافه کنید

```javascript
// مثال برای Kimi
async function askKimi(question, docs) {
  // پیاده‌سازی درخواست به Kimi API
}

// در switch statement
case 'kimi':
  return await askKimi(question, docs);
```

## 📝 مجوز

MIT License

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات را commit کنید
4. Pull Request ارسال کنید 