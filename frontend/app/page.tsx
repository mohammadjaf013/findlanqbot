'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        body {
          font-family: 'Vazirmatn', sans-serif;
          scroll-behavior: smooth;
        }
        .bg-hero-gradient {
          background-color: #f7f9fc;
          background-image: radial-gradient(circle at 1% 1%, #eaf2ff 0%, #f7f9fc 70%);
        }
        details > summary {
          list-style: none;
        }
        details > summary::-webkit-details-marker {
          display: none;
        }
        details[open] summary ~ * {
          animation: sweep .5s ease-in-out;
        }
        @keyframes sweep {
          0%    {opacity: 0; transform: translateY(-10px)}
          100%  {opacity: 1; transform: translateY(0)}
        }
      `}</style>

      <div className="bg-gray-50 text-gray-800 antialiased">
        {/* Header/Navigation */}
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b border-gray-200">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="q.png" alt="لوگو فنلاند کیو" className="h-9 w-9" />
              <Link href="/" className="text-xl font-bold text-gray-900">فنلاند کیو</Link>
        </div>
        
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-x-8 text-sm font-semibold text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">خانه</a>
              <a href="#services" className="hover:text-blue-600 transition-colors">خدمات</a>
              <a href="#faq" className="hover:text-blue-600 transition-colors">سوالات متداول</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">تماس با ما</a>
            </div>
            <div className="hidden md:block">
              <Link href="/finlandq3" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-300 shadow-sm">
                شروع چت با ربات
              </Link>
          </div>
          
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                  <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
            <a href="#" className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-100">خانه</a>
            <a href="#services" className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-100">خدمات</a>
            <a href="#faq" className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-100">سوالات متداول</a>
            <a href="#contact" className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-100">تماس با ما</a>
            <div className="p-4">
              <Link href="/finlandq3" className="w-full block text-center bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-300 shadow-sm">
                شروع چت با ربات
              </Link>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section */}
          <section className="bg-hero-gradient pt-20 pb-24 text-center">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                مهاجرت به فنلاند،<br />
                <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">هوشمند و آسان</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                فنلاند کیو، دستیار هوشمند شما برای پاسخ به تمام سوالات مربوط به مهاجرت تحصیلی، کاری و استارتاپی به فنلاند است. مسیر خود را با اطلاعات دقیق و به‌روز شروع کنید.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link href="/finlandq4" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
                  شروع گفتگو
                </Link>
                <a href="#" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300 border border-gray-300">
                  ثبت درخواست مشاوره
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </a>
          </div>
        </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">خدمات ما</h2>
                <p className="mt-3 text-gray-500">ما شما را در تمام مراحل مهاجرت به فنلاند همراهی می‌کنیم.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Service Card 1 */}
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 9.5a10.4 10.4 0 0 0-10 0"/><path d="M17 14.5a10.4 10.4 0 0 1-10 0"/><path d="M7 20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1z"/><path d="M12 2a3.5 3.5 0 0 0-3.5 3.5v1.4a4 4 0 0 0 7 0V5.5A3.5 3.5 0 0 0 12 2z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">چت‌بات هوشمند</h3>
                  <p className="text-gray-600 mb-5">پاسخ‌های فوری و ۲۴ ساعته به سوالات عمومی شما در مورد ویزا، هزینه‌ها و شرایط زندگی در فنلاند.</p>
                  <Link href="/finlandq4" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">شروع چت ←</Link>
                </div>
                {/* Service Card 2 */}
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 14-2 2 2 2"/><path d="m14 18 2-2-2-2"/></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">مشاوره تخصصی</h3>
                  <p className="text-gray-600 mb-5">برای بررسی شرایط اختصاصی شما و دریافت راهنمایی قدم‌به‌قدم، یک جلسه مشاوره با کارشناسان ما رزرو کنید.</p>
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">رزرو وقت مشاوره ←</a>
                </div>
                {/* Service Card 3 */}
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">راهنمای جامع</h3>
                  <p className="text-gray-600 mb-5">دسترسی به مقالات و راهنماهای کامل در مورد کاریابی، اجاره خانه، سیستم آموزشی و فرهنگ فنلاند.</p>
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">ورود به بخش مقالات ←</a>
                </div>
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section id="faq" className="py-20 bg-hero-gradient">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">سوالات متداول</h2>
                <p className="mt-3 text-gray-500">پاسخ برخی از سوالات پرتکرار کاربران</p>
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                <details className="p-6 rounded-lg bg-white shadow-sm cursor-pointer border border-gray-200">
                  <summary className="font-semibold text-lg flex justify-between items-center">
                    <span>آیا برای استفاده از چت‌بات نیاز به پرداخت هزینه است؟</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
                  </summary>
                  <p className="mt-4 text-gray-600">خیر، استفاده از چت‌بات هوشمند فنلاند کیو برای دریافت اطلاعات عمومی کاملا رایگان است.</p>
                </details>
                <details className="p-6 rounded-lg bg-white shadow-sm cursor-pointer border border-gray-200">
                  <summary className="font-semibold text-lg flex justify-between items-center">
                    <span>فرآیند گرفتن ویزای تحصیلی چقدر طول می‌کشد؟</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
                  </summary>
                  <p className="mt-4 text-gray-600">زمان بررسی پرونده‌ها بسته به سفارت و فصل اقدام متفاوت است، اما به طور معمول بین ۱ تا ۳ ماه زمان می‌برد. دستیار هوشمند ما می‌تواند اطلاعات به‌روزتری به شما بدهد.</p>
                </details>
                <details className="p-6 rounded-lg bg-white shadow-sm cursor-pointer border border-gray-200">
                  <summary className="font-semibold text-lg flex justify-between items-center">
                    <span>آیا بدون مدرک زبان هم می‌توان اقدام کرد؟</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
                  </summary>
                  <p className="mt-4 text-gray-600">برای اکثر برنامه‌های تحصیلی و کاری، داشتن مدرک زبان (انگلیسی یا فنلاندی) الزامی است. با این حال، شرایط خاصی نیز وجود دارد که می‌توانید جزئیات آن را از کارشناسان ما بپرسید.</p>
                </details>
              </div>
            </div>
          </section>
        </main>
        
        {/* Footer */}
        <footer id="contact" className="bg-gray-900 text-white">
          <div className="container mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              {/* About */}
              <div className="col-span-4 md:col-span-1">
                <h4 className="text-lg font-bold mb-4">فنلاند کیو</h4>
                <p className="text-gray-400 text-sm">دستیار هوشمند شما در مسیر مهاجرت به فنلاند. ما با استفاده از هوش مصنوعی و تخصص کارشناسان، پیچیدگی‌های این مسیر را برای شما ساده می‌کنیم.</p>
              </div>
              {/* Links */}
              <div>
                <h5 className="font-semibold mb-4 text-gray-200">لینک‌های سریع</h5>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">درباره ما</a></li>
                  <li><a href="#services" className="text-gray-400 hover:text-white transition-colors text-sm">خدمات</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">وبلاگ</a></li>
                  <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">سوالات متداول</a></li>
                </ul>
              </div>
              {/* Legal */}
              <div>
                <h5 className="font-semibold mb-4 text-gray-200">اطلاعات حقوقی</h5>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">شرایط استفاده</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">حریم خصوصی</a></li>
                </ul>
              </div>
              {/* Contact */}
              <div>
                <h5 className="font-semibold mb-4 text-gray-200">تماس با ما</h5>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <span>support@finlandq.com</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
              <p>&copy; 2025 فنلاند کیو. تمام حقوق محفوظ است.</p>
        </div>
        </div>
        </footer>
      </div>
    </>
  );
} 