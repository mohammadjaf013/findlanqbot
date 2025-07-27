'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean
    message?: string
    fileName?: string
    chunksCount?: number
    error?: string
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // بررسی نوع فایل
      if (!selectedFile.name.match(/\.(doc|docx)$/i)) {
        setUploadResult({
          error: 'فقط فایل‌های Word (.doc, .docx) مجاز هستند'
        })
        setFile(null)
        return
      }
      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadResult({ error: 'لطفاً یک فایل انتخاب کنید' })
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('https://bot-api.finlandq.com/api/rag/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: result.message || 'فایل با موفقیت آپلود شد',
          fileName: result.fileName,
          chunksCount: result.chunksCount
        })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setUploadResult({
          error: result.error || 'خطا در آپلود فایل'
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
      <div className="max-w-2xl mx-auto pt-10">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          آپلود فایل Word
        </h1>

        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          {/* Drop Zone */}
          <div className="mb-6">
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
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
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-semibold">کلیک کنید</span> یا فایل را اینجا رها کنید
                </p>
                <p className="text-xs text-gray-400">
                  فقط فایل‌های Word (DOC, DOCX) - حداکثر 2MB
                </p>
                {file && (
                  <p className="mt-3 text-sm text-green-400">
                    فایل انتخاب شده: {file.name}
                  </p>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".doc,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
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
                در حال آپلود...
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                آپلود فایل
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
              <li>• فقط فایل‌های Word (.doc, .docx) قابل آپلود هستند</li>
              <li>• حجم فایل نباید بیش از 2 مگابایت باشد</li>
              <li>• فایل آپلود شده به بخش‌های کوچکتر تقسیم می‌شود</li>
              <li>• پس از آپلود، می‌توانید از محتوای فایل سوال بپرسید</li>
            </ul>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
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