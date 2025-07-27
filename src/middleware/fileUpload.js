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
    
    const busboy = Busboy({ 
      headers: req.headers,
      limits: {
        fileSize: 4 * 1024 * 1024, // 4MB limit for Vercel
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
    req.pipe(busboy);
  });
}

module.exports = { fileUploadMiddleware }; 