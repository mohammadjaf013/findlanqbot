const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');

// Middleware برای handle کردن multipart/form-data
function fileUploadMiddleware() {
  return async (c, next) => {
    const contentType = c.req.header('content-type');
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return await next();
    }
    
    try {
      // Parse multipart data
      const formData = await parseMultipart(c.req.raw);
      
      // Add parsed data to context
      c.set('formData', formData);
      
      await next();
    } catch (error) {
      console.error('File upload middleware error:', error);
      return c.json({ error: 'خطا در پردازش فایل' }, 400);
    }
  };
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};
    
    // Get headers from the right place
    let headers = req.headers || req.raw?.headers || {};
    
    // Convert Headers object to plain object if needed
    if (headers.constructor && headers.constructor.name === 'Headers') {
      const plainHeaders = {};
      for (const [key, value] of headers.entries()) {
        plainHeaders[key.toLowerCase()] = value;
      }
      headers = plainHeaders;
      console.log('Converted Headers object to plain object');
    } else if (typeof headers.get === 'function') {
      // Alternative method for Headers-like objects
      const plainHeaders = {};
      const contentType = headers.get('content-type');
      if (contentType) plainHeaders['content-type'] = contentType;
      // Add other essential headers
      const contentLength = headers.get('content-length');
      if (contentLength) plainHeaders['content-length'] = contentLength;
      headers = plainHeaders;
      console.log('Converted Headers-like object to plain object');
    }
    
    console.log('Headers for busboy:', headers);
    console.log('Content-Type:', headers['content-type']);
    
    if (!headers['content-type']) {
      reject(new Error('Content-Type header missing: ' + JSON.stringify(Object.keys(headers))));
      return;
    }
    
    const busboy = Busboy({ 
      headers: headers,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for safer Vercel deployment
        files: 1
      }
    });
    
    busboy.on('field', (name, value) => {
      fields[name] = value;
    });
    
    busboy.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      
      if (!filename) {
        file.resume();
        return;
      }
      
      // Create temporary file path
      const tempPath = path.join('/tmp', `upload_${Date.now()}_${filename}`);
      const chunks = [];
      
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        files[name] = {
          name: filename,
          size: buffer.length,
          type: mimeType,
          buffer: buffer,
          tempPath: tempPath
        };
        
        // Save to temp file
        fs.writeFileSync(tempPath, buffer);
      });
    });
    
    busboy.on('finish', () => {
      resolve({ fields, files });
    });
    
    busboy.on('error', (error) => {
      reject(error);
    });
    
    // Pipe request to busboy
    if (req.pipe) {
      req.pipe(busboy);
    } else if (req.raw && req.raw.pipe) {
      req.raw.pipe(busboy);
    } else {
      reject(new Error('Cannot pipe request to busboy'));
    }
  });
}

module.exports = { fileUploadMiddleware }; 