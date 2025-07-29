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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const context = docs.length > 0 ? `\n\nاطلاعات مربوطه:\n${docs.join('\n\n')}` : '';
    
    const prompt = `شما دستیار هوشمند فنلاند کیو هستید که در زمینه مهاجرت، تحصیل، کار و زندگی در فنلاند تخصص دارید.

قوانین مهم:
- اسم تو کیو هست و دستیار هوشمند فلاند کیو هستی
- همیشه به زبان راحت و ساده پاسخ دهید
- مثل یک مشاور حرفه ای باشید و به سوالات کاربر پاسخ دهید
- تو داری مخصولات فنلاند کیو رو توضیح میدی پس مثل یک مشاور و یک فروشنده متخصص باید رفتار کنی اما لحن عامیانه
- از اموجی استفاده کن حتما 
- سعی کن از اطلاعات که داره کامل مشتری رو بفهمونی
- هرگز اشاره نکنید که "بر اساس متن‌های ارائه شده" یا "با توجه به اطلاعات موجود"
- پاسخ را طوری بدهید که انگار خودتان این اطلاعات را می‌دانید
- اگر اطلاعات کافی ندارید، به کاربر بگویید: "برای اطلاعات تکمیلی با پشتیبانی شماره 021-91691021 تماس بگیرید"

سوال: ${question}
${context}

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

// ایجاد embedding برای متن
async function createEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.log('خطا در embedding:', error.message);
    // fallback به vector تصادفی برای تست
    return Array.from({length: 768}, () => Math.random());
  }
}

// ایجاد embeddings برای آرایه‌ای از متن‌ها
async function createEmbeddings(texts) {
  const chunksWithEmbeddings = [];
  
  console.log(`در حال ایجاد embeddings برای ${texts.length} chunk...`);
  
  for (let i = 0; i < texts.length; i++) {
    console.log(`پردازش chunk ${i + 1}/${texts.length}`);
    const embedding = await createEmbedding(texts[i]);
    chunksWithEmbeddings.push({
      text: texts[i],
      embedding: embedding
    });
    
    // کمی صبر برای جلوگیری از rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return chunksWithEmbeddings;
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

module.exports = { askAI, askGemini, createEmbedding, createEmbeddings }; 