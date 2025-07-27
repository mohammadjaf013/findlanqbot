import Link from 'next/link';
import { ArrowLeft, MessageCircle, FileText, Globe } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#4385f6] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#4385f6] to-blue-600 bg-clip-text text-transparent mb-4">
            فنلاند کیو
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            دستیار هوشمند مهاجرت به فنلاند
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <MessageCircle className="w-12 h-12 text-[#4385f6] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">چت هوشمند</h3>
            <p className="text-gray-600 text-sm">پاسخ سریع به سوالات مهاجرت، تحصیل و کار</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <FileText className="w-12 h-12 text-[#4385f6] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">آپلود اسناد</h3>
            <p className="text-gray-600 text-sm">بارگذاری مدارک و دریافت راهنمایی دقیق</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <Globe className="w-12 h-12 text-[#4385f6] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">اطلاعات کامل</h3>
            <p className="text-gray-600 text-sm">راهنمای جامع زندگی در فنلاند</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/finlandq"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#4385f6] to-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transition-all duration-200 group"
          >
            شروع چت
            <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/upload"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transition-all duration-200 group"
          >
            آپلود فایل
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link>
          
          <Link 
            href="/upload-text"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transition-all duration-200 group"
          >
            آپلود متن
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            برای پشتیبانی: 88888888
          </p>
        </div>
      </div>
    </main>
  )
} 