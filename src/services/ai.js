const { GoogleGenerativeAI } = require('@google/generative-ai');

// تنظیمات API کلیدها - برای Bun
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDaZf6m6Qc-j_Mky9Zk9jRTQPffvYXQd9M';

// راه‌اندازی Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// درخواست به Gemini
async function askGemini(question, docs) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    console.log("GEMINI_API_KEY",GEMINI_API_KEY)
    // انتخاب مدل
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

module.exports = { askAI, askGemini }; 