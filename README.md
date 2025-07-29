# FindLanQBot - Finland Migration Assistant

سیستم هوشمند راهنمایی مهاجرت، تحصیل و کار در فنلاند

## 🏗️ ساختار پروژه

این پروژه شامل دو بخش جداگانه است:

### 📱 Frontend (Next.js)
- رابط کاربری مدرن و ریسپانسیو
- مدیریت فایل‌های Upstash Vector
- چت هوشمند با AI
- صفحات آپلود و مدیریت

### 🔧 Backend (Node.js + Hono)
- API های RESTful
- سیستم RAG با Upstash Vector
- پردازش فایل‌های Word و Text
- دیتابیس SQLite/Turso

## 🚀 راه‌اندازی

### Frontend
```bash
# نصب dependencies
npm install

# اجرای development server
npm run dev

# build برای production
npm run build
```

### Backend
```bash
# رفتن به پوشه backend
cd backend

# نصب dependencies
npm install

# اجرای development server
npm run dev

# اجرای production
npm start
```

## 🔧 متغیرهای محیطی

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
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

## 📁 ساختار فایل‌ها

```
findlanqbot/
├── frontend/                 # Next.js Frontend
│   ├── app/
│   │   ├── components/
│   │   ├── finlandq/
│   │   ├── upload/
│   │   ├── upload-text/
│   │   └── vector-management/
│   ├── public/
│   └── package.json
├── backend/                  # Node.js Backend
│   ├── src/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middleware/
│   ├── data/
│   ├── uploads/
│   └── package.json
└── README.md
```

## 🌐 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Vercel)
```bash
cd backend
vercel --prod
```

## 🔗 API Endpoints

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

## 🧪 تست

### Frontend
```bash
npm run lint
```

### Backend
```bash
cd backend
npm test
```

## 📊 ویژگی‌ها

- ✅ رابط کاربری زیبا و کاربرپسند
- ✅ سیستم RAG پیشرفته با Upstash Vector
- ✅ پشتیبانی از فایل‌های Word و Text
- ✅ جستجوی معنایی دقیق
- ✅ مدیریت کامل فایل‌ها
- ✅ آمار زنده سیستم
- ✅ طراحی ریسپانسیو
- ✅ API های RESTful

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید بسازید
3. تغییرات را commit کنید
4. Pull Request ارسال کنید

## 📄 لایسنس

MIT License 