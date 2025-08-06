const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// تابع تشخیص copilot actions در متن AI
function extractCopilotActions(aiResponse) {
  const actions = [];
  
  // Pattern برای تشخیص action commands
  const actionPatterns = [
    {
      pattern: /\[COPILOT_ACTION:CONSULTATION_REQUEST\]/g,
      action: { type: 'consultation_request', requireConfirmation: true }
    },
    {
      pattern: /\[COPILOT_ACTION:OPEN_FORM\]/g,
      action: { type: 'open_form', formType: 'consultation' }
    },
    {
      pattern: /\[COPILOT_ACTION:CONFIRM_ACTION\]/g,
      action: { type: 'confirm_action', message: 'آیا مطمئن هستید؟' }
    },
    {
      pattern: /\[COPILOT_ACTION:SHOW_QUICK_REPLY:([^\]]+)\]/g,
      action: { type: 'show_quick_reply', options: [] }
    }
  ];
  
  let cleanResponse = aiResponse;
  
  actionPatterns.forEach(({ pattern, action }) => {
    const matches = [...aiResponse.matchAll(pattern)];
    if (matches.length > 0) {
      matches.forEach(match => {
        if (action.type === 'show_quick_reply') {
          const options = match[1].split(',').map(opt => opt.trim());
          actions.push({ ...action, options });
        } else {
          actions.push(action);
        }
      });
      
      // حذف action commands از متن نهایی
      cleanResponse = cleanResponse.replace(pattern, '').trim();
    }
  });
  
  return { 
    response: cleanResponse, 
    actions: actions 
  };
}

async function askGemini(question, docs) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const context = docs.length > 0 && docs[0] ? `\n\nاطلاعات مرجع (از این اطلاعات برای پاسخ استفاده کن):\n${docs.join('\n\n')}` : '';
    
    const prompt = `شما دستیار هوشمند فنلاند کیو هستید که در زمینه مهاجرت، تحصیل، کار و زندگی در فنلاند تخصص دارید.

قوانین مهم:

تو یک دستیار هوشمند هستی با نام «کیو»، نماینده رسمی برند فنلاند کیو.
نقش تو مشاور حرفه‌ای و فروشنده متخصص محصولات این برند هست.

قوانین اصلی:
- همیشه با لحن صمیمی، ساده و قابل فهم صحبت کن 😄
- از ایموجی‌ها استفاده کن تا حس راحتی و دوستی منتقل شه ✨
- مثل یه مشاور دلسوز و کاربلد جواب بده؛ کسی که کاملاً محصولات رو می‌شناسه
- هدف تو کمک به کاربر برای انتخاب محصول مناسبشه، نه صرفاً فروش
- از اطلاعات کامل استفاده کن تا همه‌چیز رو دقیق و واضح توضیح بدی
- هیچ‌وقت نگویید "بر اساس اطلاعات داده‌شده" یا "طبق متن بالا" ❌
- اگر اطلاعات کافی نداری، بگو: «برای اطلاعات بیشتر، لطفاً فرم درخواست مشاوره رو پر کن 💬»
- فقط درباره محصولات برند فنلاند کیو و کاروانونچر صحبت کن، نه برندهای دیگه
- هر سوالی رو با دقت بخون، نیاز کاربر رو بفهم، بعد پاسخ بده اگر نیاز شد چند سوال بپرس که متوجه بشی نیاز کاربر کدام محصول هست بعد تعریف کن براش محصول رو✅
- یادت نره: تو کیو هستی، و همه چیز درباره فنلاند کیو رو بلدی 💙


قوانین کنترل Copilot:
- اگر کاربر درخواست مشاوره کرد (مثل "مشاوره می‌خوام"، "نیاز به راهنمایی دارم"، "کمک می‌خوام"), در پایان پاسخ [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن
- اگر کاربر سوال پیچیده‌ای پرسید که نیاز به مشاوره شخصی دارد، [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن
- اگر کاربر مشخصات شخصی (سن، تحصیلات، وضعیت) گفت، [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن

سوال: ${question}
${context}

پاسخ:`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    // Extract copilot actions
    const { response, actions } = extractCopilotActions(aiResponse);
    
    if (actions.length > 0) {
      console.log(`🎯 Copilot Actions detected:`, actions);
      return { text: response, copilotActions: actions };
    }
    
    return { text: response, copilotActions: [] };
    
  } catch (error) {
    console.error('خطا در Google AI:', error);
    return { 
      text: 'متأسفم، خطایی رخ داده است. .',
      copilotActions: []
    };
  }
}

// Alias برای سازگاری با کدهای قدیمی
async function askAI(question, docs, model = 'gemini') {
  const result = await askGemini(question, docs);
  return result.text; // فقط متن برمیگردونه برای compatibility
}

module.exports = { askGemini, askAI, extractCopilotActions }; 