# FindLanQBot Frontend

فرانت‌اند Next.js برای پلتفرم چت هوش مصنوعی FindLanQBot.

## 🚀 ویژگی‌ها

- **Next.js 14** با App Router
- **TypeScript** برای type safety
- **Tailwind CSS** برای استایل‌دهی
- **Lucide React** برای آیکون‌ها
- **Responsive Design** برای همه دستگاه‌ها
- **RTL Support** برای زبان فارسی

## 🛠️ نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- npm یا yarn

### نصب

```bash
cd frontend
npm install
```

### راه‌اندازی در حالت توسعه

```bash
npm run dev
```

فرانت‌اند روی `http://localhost:3000` در دسترس خواهد بود.

### Build برای تولید

```bash
npm run build
npm start
```

## 🔧 تنظیمات

### متغیرهای محیطی

فایل `.env.local` را در پوشه `frontend` ایجاد کنید:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### اتصال به بک‌اند

فرانت‌اند به صورت پیش‌فرض به `http://localhost:3001` متصل می‌شود. برای تغییر:

1. فایل `.env.local` را ویرایش کنید
2. یا متغیر `NEXT_PUBLIC_API_URL` را در سرور تنظیم کنید

## 📱 استفاده

1. صفحه اصلی را باز کنید
2. سوال خود را در فیلد ورودی بنویسید
3. دکمه "ارسال" را کلیک کنید یا Enter بزنید
4. پاسخ از مدل هوش مصنوعی دریافت می‌شود

## 🎨 سفارشی‌سازی

### تغییر رنگ‌ها

فایل `tailwind.config.js` را ویرایش کنید:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6', // رنگ اصلی
        600: '#2563eb',
        700: '#1d4ed8',
      }
    },
  },
},
```

### تغییر فونت

فایل `app/layout.tsx` را ویرایش کنید:

```typescript
import { Vazirmatn } from 'next/font/google'

const vazir = Vazirmatn({ subsets: ['arabic'] })

// در JSX
<html lang="fa" dir="rtl">
  <body className={vazir.className}>{children}</body>
</html>
```

## 🚀 دیپلوی

### Vercel (توصیه شده)

1. پروژه را به Vercel متصل کنید
2. متغیرهای محیطی را تنظیم کنید
3. دیپلوی خودکار انجام می‌شود

### سرور عادی

1. `npm run build` اجرا کنید
2. فایل‌های `.next` و `public` را کپی کنید
3. `npm start` اجرا کنید

## 📝 ساختار فایل‌ها

```
frontend/
├── app/
│   ├── page.tsx           # صفحه اصلی
│   ├── layout.tsx         # layout اصلی
│   └── globals.css        # استایل‌های اصلی
├── components/            # کامپوننت‌های قابل استفاده مجدد
├── lib/                   # توابع کمکی
├── types/                 # تعاریف TypeScript
└── package.json
```

## 🔄 توسعه

### اضافه کردن کامپوننت جدید

1. فایل جدید در پوشه `components` ایجاد کنید
2. کامپوننت را در `page.tsx` import کنید
3. استفاده کنید

### اضافه کردن صفحه جدید

1. فایل جدید در پوشه `app` ایجاد کنید
2. مسیر به صورت خودکار تعریف می‌شود

## 🐛 عیب‌یابی

### خطای اتصال به API

1. مطمئن شوید بک‌اند در حال اجرا است
2. آدرس API را در `.env.local` بررسی کنید
3. CORS را در بک‌اند بررسی کنید

### خطای Build

1. `npm run lint` اجرا کنید
2. خطاهای TypeScript را برطرف کنید
3. وابستگی‌ها را بررسی کنید 