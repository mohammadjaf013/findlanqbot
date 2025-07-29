# 🚀 راهنمای سریع راه‌اندازی FindLanQBot

## ⚡ راه‌اندازی در ۵ دقیقه

### ۱. نصب وابستگی‌ها

```bash
# نصب وابستگی‌های بک‌اند
npm install

# نصب وابستگی‌های فرانت‌اند
cd frontend
npm install
cd ..
```

### ۲. تنظیم کلید API

```bash
# کپی کردن فایل محیطی
cp env.example .env

# ویرایش فایل .env و اضافه کردن کلید Gemini
# GEMINI_API_KEY=your_actual_api_key_here
```

### ۳. راه‌اندازی سرورها

```bash
# ترمینال اول - بک‌اند
npm run dev

# ترمینال دوم - فرانت‌اند
cd frontend
npm run dev
```

### ۴. تست کردن

- بک‌اند: http://localhost:3001
- فرانت‌اند: http://localhost:3000

## 🔑 دریافت کلید API Gemini

1. به [Google AI Studio](https://makersuite.google.com/app/apikey) بروید
2. وارد حساب Google خود شوید
3. روی "Create API Key" کلیک کنید
4. کلید را کپی کرده و در فایل `.env` قرار دهید

## 📝 اضافه کردن اسناد اولیه

برای تست، می‌توانید اسناد اولیه اضافه کنید:

```bash
curl -X POST http://localhost:3001/api/documents \
  -H "Content-Type: application/json" \
  -d '{"content": "این یک سند نمونه است برای تست سیستم"}'
```

## 🚀 دیپلوی

### برای سرور عادی:
1. GitHub Secrets را تنظیم کنید
2. Push کنید - دیپلوی خودکار انجام می‌شود

### برای AWS Lambda:
1. تابع Lambda ایجاد کنید
2. GitHub Secrets را تنظیم کنید
3. Push کنید

### برای Vercel:
1. پروژه را به Vercel متصل کنید
2. متغیرهای محیطی را تنظیم کنید
3. دیپلوی خودکار انجام می‌شود

## 🐛 عیب‌یابی

### خطای "GEMINI_API_KEY not found"
- فایل `.env` را بررسی کنید
- کلید API را درست وارد کرده‌اید؟

### خطای اتصال به بک‌اند
- بک‌اند روی پورت 3001 در حال اجرا است؟
- CORS تنظیم شده است؟

### خطای دیتابیس
- پوشه `data` ایجاد شده است؟
- مجوزهای نوشتن در پوشه وجود دارد؟

## 📞 پشتیبانی

اگر مشکلی داشتید:
1. README.md را مطالعه کنید
2. فایل‌های log را بررسی کنید
3. GitHub Issues ایجاد کنید



frontend> vercel build
vercel --prod