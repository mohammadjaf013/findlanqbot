'use client'

import { useState } from 'react'

export default function UploadTextPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean
    message?: string
    fileName?: string
    chunksCount?: number
    error?: string
  } | null>(null)

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) {
      setUploadResult({ error: 'لطفاً عنوان و محتوا را وارد کنید' })
      return
    }

    if (content.length < 50) {
      setUploadResult({ error: 'متن باید حداقل 50 کاراکتر باشد' })
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const response = await fetch('https://findlanqbot-backorg2-fyce1jrzb.vercel.app/api/vector/upload-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message || 'متن با موفقیت ذخیره شد',
          fileName: result.fileName,
          chunksCount: result.chunksCount
        })
        setTitle('')
        setContent('')
      } else {
        setUploadResult({
          error: result.error || 'خطا در ذخیره متن'
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadResult({
        error: 'خطا در ارتباط با سرور'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto pt-10">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          آپلود متن مستقیم
        </h1>

        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-white font-semibold mb-2">
              عنوان سند:
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: راهنمای مهاجرت به فنلاند"
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              maxLength={100}
            />
            <p className="text-gray-400 text-sm mt-1">
              {title.length}/100 کاراکتر
            </p>
          </div>

          {/* Content Textarea */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-white font-semibold mb-2">
              محتوای سند:
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="محتوای کامل سند خود را اینجا وارد کنید..."
              className="w-full bg-gray-700 text-white p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={15}
              maxLength={50000}
            />
            <p className="text-gray-400 text-sm mt-1">
              {content.length}/50,000 کاراکتر (حداقل 50 کاراکتر)
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!title.trim() || !content.trim() || uploading || content.length < 50}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                در حال ذخیره...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                ذخیره متن
              </>
            )}
          </button>

          {/* Result Messages */}
          {uploadResult && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                uploadResult.success
                  ? 'bg-green-900 border border-green-700 text-green-300'
                  : 'bg-red-900 border border-red-700 text-red-300'
              }`}
            >
              {uploadResult.success ? (
                <div>
                  <p className="font-semibold mb-2">✅ {uploadResult.message}</p>
                  <p className="text-sm">نام فایل: {uploadResult.fileName}</p>
                  <p className="text-sm">تعداد بخش‌ها: {uploadResult.chunksCount}</p>
                </div>
              ) : (
                <p>❌ {uploadResult.error}</p>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-white font-semibold mb-2">راهنما:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• عنوان باید مختصر و توصیفی باشد</li>
              <li>• محتوا باید حداقل 50 کاراکتر داشته باشد</li>
              <li>• متن به بخش‌های کوچکتر تقسیم می‌شود</li>
              <li>• از این روش برای اسناد طولانی استفاده کنید</li>
              <li>• پس از ذخیره، می‌توانید از محتوا سوال بپرسید</li>
            </ul>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center gap-6 mt-6">
          <a
            href="/upload"
            className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            آپلود فایل
          </a>
          
          <a
            href="/"
            className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  )
} 