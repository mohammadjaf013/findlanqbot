'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Search, Trash2, Plus, List, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

interface FileItem {
  fileName: string;
  chunksCount: number;
  fileHash: string;
  uploadedAt: string;
}

interface SearchResult {
  text: string;
  fileName: string;
  score: number;
  chunkIndex: number;
}

interface Stats {
  dimension: number;
  vectorCount: number | string;
  status: string;
  indexName?: string;
  error?: string;
}

export default function VectorManagementPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // فرم‌ها
  const [textUpload, setTextUpload] = useState({ text: '', fileName: '' });
  const [searchQuery, setSearchQuery] = useState({ query: '', limit: 5, fileName: '' });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // تب‌ها
  const [activeTab, setActiveTab] = useState<'files' | 'upload' | 'search' | 'stats'>('files');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // نمایش پیام
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // دریافت لیست فایل‌ها
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/vector/files`);
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
      } else {
        showMessage('error', data.message || 'خطا در دریافت لیست فایل‌ها');
      }
    } catch (error) {
      showMessage('error', 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // دریافت آمار
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/vector/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('خطا در دریافت آمار:', error);
    }
  };

  // آپلود متن
  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textUpload.text.trim()) {
      showMessage('error', 'لطفاً متن را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/vector/upload-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textUpload.text,
          title: textUpload.fileName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'متن با موفقیت آپلود شد');
        setTextUpload({ text: '', fileName: '' });
        fetchFiles();
        fetchStats();
      } else {
        showMessage('error', data.message || 'خطا در آپلود متن');
      }
    } catch (error) {
      showMessage('error', 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // آپلود فایل
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/vector/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'فایل با موفقیت آپلود شد');
        fetchFiles();
        fetchStats();
      } else {
        showMessage('error', data.message || 'خطا در آپلود فایل');
      }
    } catch (error) {
      showMessage('error', 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // جستجو
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.query.trim()) {
      showMessage('error', 'لطفاً سوال را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/vector/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchQuery)
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        showMessage('success', `${data.results.length} نتیجه یافت شد`);
      } else {
        showMessage('error', data.message || 'خطا در جستجو');
      }
    } catch (error) {
      showMessage('error', 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // حذف فایل
  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید فایل "${fileName}" را حذف کنید؟`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/vector/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'فایل با موفقیت حذف شد');
        fetchFiles();
        fetchStats();
      } else {
        showMessage('error', data.message || 'خطا در حذف فایل');
      }
    } catch (error) {
      showMessage('error', 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  // بارگذاری اولیه
  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت فایل‌های Upstash Vector</h1>
          <p className="text-gray-600">آپلود، مدیریت و جستجو در فایل‌های ذخیره شده</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'files', label: 'لیست فایل‌ها', icon: List },
                { id: 'upload', label: 'آپلود', icon: Upload },
                { id: 'search', label: 'جستجو', icon: Search },
                { id: 'stats', label: 'آمار', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'files' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">لیست فایل‌ها</h2>
                <button
                  onClick={fetchFiles}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
                </button>
              </div>

              {files.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">هیچ فایلی یافت نشد</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          نام فایل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تعداد Chunks
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاریخ آپلود
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => (
                        <tr key={file.fileName}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {file.fileName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {file.chunksCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(file.uploadedAt).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteFile(file.fileName)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">آپلود فایل</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* آپلود فایل */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">آپلود فایل</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">فایل Word یا Text را اینجا رها کنید</p>
                    <input
                      type="file"
                      accept=".docx,.doc,.txt"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      انتخاب فایل
                    </label>
                  </div>
                </div>

                {/* آپلود متن */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">آپلود متن مستقیم</h3>
                  <form onSubmit={handleTextUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان
                      </label>
                      <input
                        type="text"
                        value={textUpload.fileName}
                        onChange={(e) => setTextUpload({ ...textUpload, fileName: e.target.value })}
                        placeholder="نام فایل را وارد کنید"
                        className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        متن
                      </label>
                      <textarea
                        value={textUpload.text}
                        onChange={(e) => setTextUpload({ ...textUpload, text: e.target.value })}
                        placeholder="متن مورد نظر را وارد کنید..."
                        rows={8}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      {loading ? 'در حال آپلود...' : 'آپلود متن'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">جستجو در فایل‌ها</h2>
              
              <form onSubmit={handleSearch} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سوال
                    </label>
                    <input
                      type="text"

                      value={searchQuery.query}
                      onChange={(e) => setSearchQuery({ ...searchQuery, query: e.target.value })}
                      placeholder="سوال خود را وارد کنید..."
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تعداد نتایج
                    </label>
                    <input
                      type="number"
                      value={searchQuery.limit}
                      onChange={(e) => setSearchQuery({ ...searchQuery, limit: parseInt(e.target.value) })}
                      min="1"
                      max="20"
                      className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      فیلتر بر اساس فایل (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={searchQuery.fileName}
                      onChange={(e) => setSearchQuery({ ...searchQuery, fileName: e.target.value })}
                      placeholder="نام فایل"
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Search size={16} />
                  {loading ? 'در حال جستجو...' : 'جستجو'}
                </button>
              </form>

              {/* نتایج جستجو */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">نتایج جستجو</h3>
                  {searchResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500">
                          فایل: {result.fileName} | Chunk: {result.chunkIndex + 1}
                        </span>
                        <span className="text-sm text-green-600">
                          امتیاز: {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-gray-900">{result.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">آمار سیستم</h2>
              
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 size={24} className="text-blue-600" />
                      </div>
                      <div className="mr-4">
                        <p className="text-sm font-medium text-blue-600">کل Vectors</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.vectorCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText size={24} className="text-green-600" />
                      </div>
                      <div className="mr-4">
                        <p className="text-sm font-medium text-green-600">Dimension</p>
                        <p className="text-2xl font-bold text-green-900">{stats.dimension}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <List size={24} className="text-purple-600" />
                      </div>
                      <div className="mr-4">
                        <p className="text-sm font-medium text-purple-600">وضعیت</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {stats.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {stats.indexName && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <BarChart3 size={24} className="text-gray-600" />
                        </div>
                        <div className="mr-4">
                          <p className="text-sm font-medium text-gray-600">نام Index</p>
                          <p className="text-lg font-bold text-gray-900">{stats.indexName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {stats.error && (
                    <div className="bg-red-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertCircle size={24} className="text-red-600" />
                        </div>
                        <div className="mr-4">
                          <p className="text-sm font-medium text-red-600">خطا</p>
                          <p className="text-sm text-red-900">{stats.error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">در حال بارگذاری آمار...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}