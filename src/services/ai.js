const { GoogleGenerativeAI } = require('@google/generative-ai');

// تنظیمات API کلیدها - برای Bun
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDaZf6m6Qc-j_Mky9Zk9jRTQPffvYXQd9M';

// راه‌اندازی Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testGemini() {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'X-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "سلام خوبی ؟"
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Test failed:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('Test successful:', data.candidates[0].content.parts[0].text);
    return true;
  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  }
}

async function askGeminiWithFetch(question, docs) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const apiKey = process.env.GEMINI_API_KEY;
  const context = docs.length > 0 ? `\n\nمتن‌های موجود:\n${docs.join('\n\n')}` : '';
  const prompt = `لطفاً به سوال زیر پاسخ دهید. اگر اطلاعات کافی در متن‌های موجود نیست، بگویید که اطلاعات کافی ندارید.

سوال: ${question}${context}

پاسخ:`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const res = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Gemini API error: ' + err);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'پاسخی دریافت نشد';
}
// درخواست به Gemini
async function askGemini(question, docs) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    // انتخاب مدل
    console.log('gemini',genAI.apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",systemInstruction:"finlandq assistent" });

    const context = docs.length > 0 ? `\n\nمتن‌های موجود:\n${docs.join('\n\n')}` : '';
    const prompt = `لطفاً به سوال زیر پاسخ دهید. اگر اطلاعات کافی در متن‌های موجود نیست، بگویید که اطلاعات کافی ندارید.

سوال: ${question}${context}

پاسخ:`;

    // تولید پاسخ
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    throw new Error('خطا در ارتباط با مدل هوش مصنوعی');
  }
}

// تابع عمومی برای پرسش (قابل گسترش برای مدل‌های دیگر)
async function askAI(question, docs, model = 'gemini') {
  switch (model.toLowerCase()) {
    case 'gemini':
      return await askGemini(question, docs);
    // در آینده می‌توانید مدل‌های دیگر را اضافه کنید
    // case 'kimi':
    //   return await askKimi(question, docs);
    // case 'sonat':
    //   return await askSonat(question, docs);
    default:
      throw new Error(`مدل ${model} پشتیبانی نمی‌شود`);
  }
}

module.exports = { askAI, askGemini, askGeminiWithFetch,testGemini };