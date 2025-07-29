# Upstash Vector API Documentation

## مقدمه
این API برای مدیریت فایل‌ها و جستجو در Upstash Vector طراحی شده است. این سیستم از embedding های Google Gemini استفاده می‌کند.

## متغیرهای محیطی مورد نیاز
```env
UPSTASH_VECTOR_REST_URL="https://your-vector-url.upstash.io"
UPSTASH_VECTOR_REST_TOKEN="your-token"
GEMINI_API_KEY="your-gemini-api-key"
```

## API Endpoints

### 1. آپلود فایل
**POST** `/api/vector/upload`

فایل Word یا Text را آپلود و در Upstash Vector ذخیره می‌کند.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (فایل .docx, .doc, یا .txt)

**Response:**
```json
{
  "success": true,
  "fileName": "document.docx",
  "chunksCount": 15,
  "fileHash": "abc123...",
  "message": "فایل با موفقیت در Upstash Vector ذخیره شد"
}
```

### 2. آپلود متن مستقیم
**POST** `/api/vector/upload-text`

متن را مستقیماً در Upstash Vector ذخیره می‌کند.

**Request:**
```json
{
  "text": "متن مورد نظر برای ذخیره",
  "fileName": "optional-custom-name.txt"
}
```

**Response:**
```json
{
  "success": true,
  "fileName": "text-1234567890.txt",
  "chunksCount": 3,
  "fileHash": "def456...",
  "message": "فایل با موفقیت در Upstash Vector ذخیره شد"
}
```

### 3. جستجو
**POST** `/api/vector/search`

در فایل‌های ذخیره شده جستجو می‌کند.

**Request:**
```json
{
  "query": "سوال مورد نظر",
  "limit": 5,
  "fileName": "optional-filter-by-file"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "text": "متن مرتبط",
      "fileName": "document.docx",
      "score": 0.95,
      "chunkIndex": 2
    }
  ],
  "query": "سوال مورد نظر",
  "message": "جستجو با موفقیت انجام شد"
}
```

### 4. لیست فایل‌ها
**GET** `/api/vector/files`

لیست همه فایل‌های ذخیره شده را برمی‌گرداند.

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "fileName": "document.docx",
      "chunksCount": 15,
      "fileHash": "abc123...",
      "uploadedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "totalFiles": 1
}
```

### 5. حذف فایل
**DELETE** `/api/vector/files/:fileName`

فایل مشخص شده را حذف می‌کند.

**Response:**
```json
{
  "success": true,
  "deletedChunks": 15,
  "fileName": "document.docx",
  "message": "فایل با موفقیت حذف شد"
}
```

### 6. آمار کلی
**GET** `/api/vector/stats`

آمار کلی سیستم را برمی‌گرداند.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalVectors": 150,
    "totalFiles": 10,
    "averageChunksPerFile": 15
  }
}
```

### 7. تست اتصال
**GET** `/api/vector/health`

وضعیت اتصال به Upstash Vector را بررسی می‌کند.

**Response:**
```json
{
  "success": true,
  "message": "Upstash Vector متصل است",
  "stats": {
    "totalVectors": 150,
    "totalFiles": 10,
    "averageChunksPerFile": 15
  }
}
```

## مثال‌های استفاده

### با cURL:

```bash
# آپلود فایل
curl -X POST http://localhost:3001/api/vector/upload \
  -F "file=@document.docx"

# آپلود متن
curl -X POST http://localhost:3001/api/vector/upload-text \
  -H "Content-Type: application/json" \
  -d '{"text": "متن تست", "fileName": "test.txt"}'

# جستجو
curl -X POST http://localhost:3001/api/vector/search \
  -H "Content-Type: application/json" \
  -d '{"query": "فنلاند", "limit": 5}'

# لیست فایل‌ها
curl http://localhost:3001/api/vector/files

# حذف فایل
curl -X DELETE http://localhost:3001/api/vector/files/document.docx
```

### با JavaScript:

```javascript
// آپلود فایل
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('/api/vector/upload', {
  method: 'POST',
  body: formData
});

// جستجو
const searchResponse = await fetch('/api/vector/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'سوال مورد نظر',
    limit: 5
  })
});

const searchResult = await searchResponse.json();
console.log(searchResult.results);
```

## مزایای Upstash Vector

1. **سرعت بالا**: Redis-based، بسیار سریع
2. **مقیاس‌پذیری**: بدون محدودیت storage
3. **Serverless**: هزینه کمتر
4. **REST API**: ساده برای استفاده
5. **رایگان تا 10K vector**: برای شروع عالی
6. **پشتیبانی از Persian**: بدون مشکل با متن فارسی

## هزینه‌ها

- **رایگان**: 10,000 vector
- **پرداخت**: $0.20 برای هر 100,000 vector
- **بسیار ارزانتر از Pinecone**

## نکات مهم

1. **Embedding Model**: از Google Gemini `text-embedding-004` استفاده می‌شود
2. **Chunk Size**: 1000 کاراکتر با overlap 200 کاراکتر
3. **Rate Limiting**: 100ms delay بین هر 10 embedding
4. **File Size Limit**: حداکثر 10MB برای آپلود
5. **Supported Formats**: .docx, .doc, .txt