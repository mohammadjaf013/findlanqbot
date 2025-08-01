// انتخاب نوع دیتابیس بر اساس متغیر محیطی (فقط در production)
let getAllDocuments = null;
let addDocument = null;

if (process.env.NODE_ENV === 'production') {
  if (process.env.TURSO_DATABASE_URL) {
    const tursoDb = require('../services/turso-db');
    getAllDocuments = tursoDb.getAllDocuments;
    addDocument = tursoDb.addDocument;
  } else {
    const localDb = require('../services/db');
    getAllDocuments = localDb.getAllDocuments;
    addDocument = localDb.addDocument;
  }
}

const { Hono } = require('hono');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage, AIMessage } = require('@langchain/core/messages');
const { ConversationChain, LLMChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');
const { PromptTemplate, ChatPromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const path = require('path');
const fs = require('fs');
const { 
  createSession, 
  getSession, 
  addMessageToSession, 
  getConversationHistory, 
  buildContextFromHistory,
  getSessionStats 
} = require('../services/session');

module.exports = (app) => {
  // روت تست برای session management
  app.get('/api/session/test', async (c) => {
    try {
      console.log('🧪 Testing session management...');
      
      // ایجاد session جدید
      const session = await createSession();
      console.log('✅ Session created:', session.id);
      
      // اضافه کردن پیام تست
      await addMessageToSession(session.id, 'user', 'پیام تست');
      console.log('✅ Test message added');
      
      // دریافت session
      const retrievedSession = await getSession(session.id);
      console.log('✅ Session retrieved:', retrievedSession ? 'success' : 'failed');
      
      // دریافت تاریخچه
      const history = await getConversationHistory(session.id);
      console.log('✅ History retrieved:', history.length, 'messages');
      
      return c.json({
        success: true,
        test: 'Session management test completed',
        sessionId: session.id,
        sessionExists: !!retrievedSession,
        historyCount: history.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Session test failed:', error);
      return c.json({ 
        error: 'Session test failed',
        message: error.message 
      }, 500);
    }
  });

  // روت برای ایجاد session جدید
  app.post('/api/session/new', async (c) => {
    try {
      const session = await createSession();
      
      return c.json({
        success: true,
        session: {
          id: session.id,
          createdAt: session.createdAt
        },
        message: 'Session created successfully'
      });
      
    } catch (error) {
      console.error('Error creating session:', error);
      return c.json({ 
        error: 'خطا در ایجاد session' 
      }, 500);
    }
  });

  // روت برای دریافت تاریخچه مکالمه
  app.get('/api/session/:sessionId/history', async (c) => {
    try {
      const sessionId = c.req.param('sessionId');
      const limit = parseInt(c.req.query('limit')) || 10;
      
      const history = await getConversationHistory(sessionId, limit);
      const session = await getSession(sessionId);
      
      if (!session) {
        return c.json({ 
          error: 'Session یافت نشد' 
        }, 404);
      }
      
      return c.json({
        success: true,
        sessionId,
        messages: history, // Changed from 'history' to 'messages' to match frontend expectation
        totalMessages: history.length,
        lastActivity: session.lastActivity
      });
      
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return c.json({ 
        error: 'خطا در دریافت تاریخچه' 
      }, 500);
    }
  });

  // تابع پیشرفته با استفاده از LangChain کامل
  async function askWithLangChain(question, context, sessionId) {
    try {
      console.log(`🤖 Starting advanced LangChain processing for session: ${sessionId}`);

      // 1. تنظیم مدل
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        maxOutputTokens: 1500,
        temperature: 0.7,
        apiKey: process.env.GEMINI_API_KEY,
      });

      // 2. ایجاد تمپلیت پیشرفته
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", `شما دستیار هوشمند فنلاند کیو هستید که در زمینه مهاجرت، تحصیل، کار و زندگی در فنلاند تخصص دارید.

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
- توی هر پیام هم لازم نیست خودت رو معرفی کنی  

قوانین کنترل Copilot:
- اگر کاربر درخواست مشاوره کرد (مثل "مشاوره می‌خوام"، "نیاز به راهنمایی دارم"، "کمک می‌خوام"), در پایان پاسخ [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن
- اگر کاربر سوال پیچیده‌ای پرسید که نیاز به مشاوره شخصی دارد، [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن
- اگر کاربر مشخصات شخصی (سن، تحصیلات، وضعیت) گفت، [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن

اطلاعات مرجع: {context}
تاریخچه مکالمه: {chat_history}
سوال فعلی: {question}`],
        ["human", "{question}"]
      ]);

      // 3. ایجاد زنجیره قابل اجرا
      const chain = RunnableSequence.from([
        {
          context: () => context.join('\n\n'),
          chat_history: async () => {
            if (sessionId) {
              const history = await getConversationHistory(sessionId, 5);
              return history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            }
            return '';
          },
          question: () => question
        },
        promptTemplate,
        model,
        new StringOutputParser()
      ]);

      // 4. اجرای زنجیره
      console.log(`🔄 Executing LangChain sequence...`);
      const aiResponse = await chain.invoke({});

      // 5. استخراج copilot actions
      const { response: cleanResponse, actions } = extractCopilotActions(aiResponse);
      
      if (actions.length > 0) {
        console.log(`🎯 Copilot Actions detected:`, actions);
      }

      // 6. ذخیره در کش (اختیاری)
      if (sessionId) {
        console.log(`💾 Caching response for session: ${sessionId}`);
      }
      
      return { text: cleanResponse, copilotActions: actions };
    } catch (error) {
      console.error('Error in advanced LangChain AI:', error);
      throw error;
    }
  }

  // تابع مدیریت کش و حافظه
  function createMemoryManager(sessionId) {
    return new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output",
      sessionId: sessionId
    });
  }

  // تابع استخراج copilot actions
  function extractCopilotActions(aiResponse) {
    const actions = [];
    
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
        console.log("actions",cleanResponse);
        
        cleanResponse = cleanResponse.replace(pattern, '').trim();
      }
    });
    
    return { 
      response: cleanResponse, 
      actions: actions 
    };
  }

  // روت ساده برای پرسش با استفاده از فایل finlandq.txt + session management + LangChain
  app.post('/api/ask', async (c) => {
    try {
      const { question, model = 'gemini', sessionId, useLangChain = true } = await c.req.json();
      
      if (!question || question.trim() === '') {
        return c.json({ 
          error: 'سوال نمی‌تواند خالی باشد' 
        }, 400);
      }

      // اگر sessionId داده نشده، یکی جدید بساز
      let currentSession;
      if (sessionId) {
        currentSession = await getSession(sessionId);
        if (!currentSession) {
          console.log(`❌ Session not found: ${sessionId}`);
          return c.json({ 
            error: 'Session یافت نشد' 
          }, 404);
        }
        console.log(`✅ Using existing session: ${sessionId}`);
      } else {
        currentSession = await createSession();
        console.log(`🆔 Created new session: ${currentSession.id}`);
      }

      console.log(`📋 Ask with Session: "${question}" (Session: ${currentSession.id}, LangChain: ${useLangChain})`);

      // خواندن فایل finlandq.txt
      let contextFromFile = '';
      try {
        const filePath = path.join(__dirname, '../../finlandq.txt');
        contextFromFile = fs.readFileSync(filePath, 'utf8');
        console.log(`📖 File loaded: ${contextFromFile.length} characters`);
      } catch (fileError) {
        console.error('خطا در خواندن فایل:', fileError);
      }

      // ساخت context از تاریخچه مکالمه
      const conversationContext = await buildContextFromHistory(currentSession.id, false);

      // ترکیب context فایل و تاریخچه مکالمه
      const fullContext = [
        contextFromFile,
        conversationContext
      ].filter(ctx => ctx.trim().length > 0);

      // ذخیره سوال کاربر در session
      await addMessageToSession(currentSession.id, 'user', question.trim());
      console.log(`💬 User message saved to session: ${currentSession.id}`);

             // ارسال به مدل هوش مصنوعی (با یا بدون LangChain)
       let aiResult;
       if (useLangChain) {
         console.log(`🤖 Using advanced LangChain for AI processing`);
         aiResult = await askWithLangChain(question.trim(), fullContext, currentSession.id);
       } else {
         console.log(`🤖 Using direct Gemini API`);
         const { askGemini } = require('../services/ai');
         aiResult = await askGemini(question.trim(), fullContext);
       }
      
      // Check if AI response contains copilot actions
      const answer = typeof aiResult === 'string' ? aiResult : aiResult.text;
      const copilotActions = typeof aiResult === 'object' ? aiResult.copilotActions || [] : [];
      
      await addMessageToSession(currentSession.id, 'assistant', answer, {
        model,
        useLangChain,
        contextLength: contextFromFile.length,
        conversationLength: conversationContext.length,
        copilotActions: copilotActions
      });
      console.log(`🤖 Assistant message saved to session: ${currentSession.id}`);
      
      return c.json({ 
        success: true,
        sessionId: currentSession.id,
        question: question.trim(),
        answer,
        copilotActions: copilotActions,
        model,
        useLangChain,
        contextSource: 'finlandq.txt',
        contextLength: contextFromFile.length,
        conversationHistory: await getConversationHistory(currentSession.id, 5)
      });
      
    } catch (error) {
      console.error('Error in /api/ask:', error);
      return c.json({ 
        error: error.message || 'خطا در پردازش سوال' 
      }, 500);
    }
  });

  // روت برای دریافت وضعیت سرویس
  app.get('/api/health', async (c) => {
    try {
      let docs = [];
      if (getAllDocuments) {
        docs = await getAllDocuments();
      }
      
      const sessionStats = await getSessionStats();
      
      return c.json({ 
        status: 'healthy',
        documentsCount: docs.length,
        sessionStats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in health check:', error);
      return c.json({ 
        status: 'unhealthy',
        error: error.message 
      }, 500);
    }
  });

  // روت برای بررسی وضعیت session management
  app.get('/api/session/status', async (c) => {
    try {
      const sessionStats = await getSessionStats();
      
      // تست ایجاد session
      const testSession = await createSession();
      const retrievedSession = await getSession(testSession.id);
      
      // پاک کردن session تست
      // await cleanupOldSessions(0); // پاک کردن sessions قدیمی‌تر از 0 ساعت
      
      return c.json({
        success: true,
        sessionManagement: {
          canCreate: !!testSession,
          canRetrieve: !!retrievedSession,
          testSessionId: testSession.id,
          retrievedSessionId: retrievedSession?.id
        },
        stats: sessionStats,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: process.env.VERCEL === '1',
          hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
          hasTursoToken: !!process.env.TURSO_AUTH_TOKEN
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in session status check:', error);
      return c.json({ 
        success: false,
        error: 'Session status check failed',
        message: error.message,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: process.env.VERCEL === '1',
          hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
          hasTursoToken: !!process.env.TURSO_AUTH_TOKEN
        }
      }, 500);
    }
  });

  // روت برای آمار sessions
  app.get('/api/session/stats', async (c) => {
    try {
      const stats = await getSessionStats();
      
      return c.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error getting session stats:', error);
      return c.json({ 
        error: 'خطا در دریافت آمار sessions' 
      }, 500);
    }
  });

  // روت برای اضافه کردن سند جدید (اختیاری)
  app.post('/api/documents', async (c) => {
    try {
      const { content } = await c.req.json();
      
      if (!content || content.trim() === '') {
        return c.json({ 
          error: 'محتوای سند نمی‌تواند خالی باشد' 
        }, 400);
      }

      if (!addDocument) {
        return c.json({ 
          error: 'سرویس دیتابیس در دسترس نیست' 
        }, 503);
      }

      const id = await addDocument(content.trim());
      
      return c.json({ 
        success: true,
        id,
        message: 'سند با موفقیت اضافه شد'
      });
      
    } catch (error) {
      console.error('Error in /api/documents:', error);
      return c.json({ 
        error: error.message || 'خطای داخلی سرور' 
      }, 500);
    }
  });
}; 