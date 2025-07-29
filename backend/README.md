# FindLanQBot Backend

Backend API برای سیستم FindLanQBot با قابلیت Upstash Vector

## ویژگی‌ها

- ✅ API های RESTful
- ✅ Upstash Vector برای جستجوی معنایی
- ✅ Google Gemini برای embeddings
- ✅ پشتیبانی از فایل‌های Word و Text
- ✅ دیتابیس SQLite/Turso
- ✅ CORS enabled

## نصب و راه‌اندازی

### 1. نصب dependencies
```bash
npm install
```

### 2. تنظیم متغیرهای محیطی
```env
# Upstash Vector
UPSTASH_VECTOR_REST_URL="https://your-vector-url.upstash.io"
UPSTASH_VECTOR_REST_TOKEN="your-token"

# Google Gemini
GEMINI_API_KEY="your-gemini-api-key"

# Turso Database (اختیاری)
TURSO_DATABASE_URL="your-turso-url"
TURSO_AUTH_TOKEN="your-turso-token"
```

### 3. اجرای سرور
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Vector Management
- `POST /api/vector/upload` - آپلود فایل
- `POST /api/vector/upload-text` - آپلود متن
- `POST /api/vector/search` - جستجو
- `GET /api/vector/files` - لیست فایل‌ها
- `DELETE /api/vector/files/:fileName` - حذف فایل
- `GET /api/vector/stats` - آمار
- `GET /api/vector/health` - تست اتصال

### RAG System
- `POST /api/rag/upload` - آپلود فایل RAG
- `POST /api/rag/ask` - سوال از RAG
- `GET /api/rag/files` - لیست فایل‌های RAG

### General
- `POST /api/ask` - سوال عمومی
- `POST /api/documents` - اضافه کردن سند

## Deployment

### Vercel
```bash
vercel --prod
```

### Local
```bash
npm start
```

## تست

```bash
npm test
```

## ساختار پروژه

```
backend/
├── src/
│   ├── app.js              # اپلیکیشن اصلی
│   ├── services/
│   │   ├── upstash-vector.js  # سرویس Upstash Vector
│   │   ├── rag.js             # سرویس RAG
│   │   ├── ai.js              # سرویس AI
│   │   ├── db.js              # دیتابیس SQLite
│   │   └── turso-db.js        # دیتابیس Turso
│   ├── routes/
│   │   ├── ask.js             # روت‌های سوال
│   │   ├── rag.js             # روت‌های RAG
│   │   └── vector-api.js      # روت‌های Vector
│   └── middleware/
│       └── fileUpload.js      # میدلور آپلود
├── data/                     # دیتابیس SQLite
├── uploads/                  # فایل‌های آپلود شده
├── package.json
├── vercel.json
└── README.md
```