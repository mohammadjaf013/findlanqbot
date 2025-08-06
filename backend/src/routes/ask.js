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
const { RunnableSequence, RunnableWithMemory } = require('@langchain/core/runnables');
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

  // تابع پیشرفته با استفاده از LangChain کامل و BufferMemory
  async function askWithLangChain(question, context, sessionId) {
    try {
      console.log(`🤖 Starting advanced LangChain processing for session: ${sessionId}`);

      // 1. تنظیم مدل
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        maxOutputTokens: 2024,
        temperature: 0.7,
        apiKey: process.env.GEMINI_API_KEY,
      });

      // 2. ایجاد تمپلیت پیشرفته با memory key
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", `
شما دستیار هوشمند برند فنلاند کیو هستید، متخصص در مهاجرت، تحصیل، کار و زندگی در فنلاند.

قوانین مهم:

- فقط درباره محصولات فنلاند کیو و کاروانونچر صحبت کن.
- نقش شما مشاور دلسوز، حرفه‌ای و آشنا به تمام محصولات این برند است.
- لحن شما همیشه صمیمی، ساده و دوستانه‌ست 😄 از ایموجی استفاده کن ✨
- فقط یک‌بار معرفی لازم است، بعد از آن فقط پاسخ بده.
- هدف تو کمک به انتخاب آگاهانه و مناسب است، نه فقط فروش.
- اگر اطلاعات کم بود، بگو: «برای اطلاعات بیشتر فرم مشاوره رو پر کن 💬»
- هر سوالی رو دقیق بخون، نیاز کاربر رو بفهم، بعد پاسخ بده.
- اگر لازمه، با چند سوال اول نیازش رو پیدا کن بعد محصول معرفی کن ✅
- اطلاعات مرجع بصورت markdown هست و هر بخش با # یا H1 جدا شده اول درک کن سوال برای کدام قسمت هست و از ان قسمت جواب بده زیاد بلند هم جواب نده 



قوانین کنترل Copilot:
- اگر کاربر درخواست مشاوره کرد (مثل "مشاوره می‌خوام"، "نیاز به راهنمایی دارم"، "کمک می‌خوام"), در پایان پاسخ [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن
- اگر کاربر سوال پیچیده‌ای پرسید که نیاز به مشاوره شخصی دارد، [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن
- اگر کاربر مشخصات شخصی (سن، تحصیلات، وضعیت) گفت، [COPILOT_ACTION:CONSULTATION_REQUEST] اضافه کن

اطلاعات مرجع: - از {context} برای پاسخ دقیق و کاربردی استفاده کن، نه تکراری یا عمومی.
تاریخچه مکالمه: {chat_history}
سوال فعلی: {input}`],
        ["human", "{input}"]
      ]);

      // 3. ایجاد BufferMemory با تنظیمات بهینه
      const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "chat_history",
        inputKey: "input",
        outputKey: "output",
        maxTokenLimit: 2000, // محدودیت توکن برای کنترل حافظه
        sessionId: sessionId
      });

      // 4. بارگذاری تاریخچه مکالمه به حافظه
      if (sessionId) {
        try {
          const history = await getConversationHistory(sessionId, 10);
          console.log(`📚 Loading ${history.length} messages into memory for session: ${sessionId}`);
          console.log("history",history)
          // استفاده از Map برای جفت‌سازی سریع‌تر
          const userMessages = new Map();
          const conversations = [];
          
          // اول تمام پیام‌های user را در Map ذخیره کن
          history.forEach(msg => {
            if (msg.role === 'user') {
              userMessages.set(msg.timestamp, msg.content);
            }
          });
          
          // سپس برای هر پیام assistant، user مربوطه را پیدا کن
          history.forEach(msg => {
            if (msg.role === 'assistant') {
              // پیدا کردن آخرین پیام user قبل از این assistant message
              let latestUserTime = 0;
              let latestUserContent = '';
              
              for (const [timestamp, content] of userMessages.entries()) {
                if (timestamp < msg.timestamp && timestamp > latestUserTime) {
                  latestUserTime = timestamp;
                  latestUserContent = content;
                }
              }
              
              if (latestUserContent) {
                conversations.push({
                  input: latestUserContent,
                  output: msg.content
                });
                // حذف پیام user استفاده شده تا duplicate نشود
                userMessages.delete(latestUserTime);
              }
            }
          });
          
          // اضافه کردن به حافظه
          for (const conv of conversations) {
            await memory.saveContext(
              { input: conv.input },
              { output: conv.output }
            );
          }
          
          console.log(`✅ Loaded ${conversations.length} conversation pairs into memory`);
          
        } catch (memoryError) {
          console.error('خطا در بارگذاری تاریخچه به حافظه:', memoryError);
          console.log('🔄 Continuing with empty memory...');
        }
      }

      // 5. ایجاد زنجیره با حافظه و RunnableWithMemory
      const chainWithMemory = RunnableSequence.from([
        {
          context: () => context.join('\n\n'),
          input: () => question,
          chat_history: async () => {
            try {
              const memoryVariables = await memory.loadMemoryVariables({});
              return memoryVariables.chat_history || '';
            } catch (error) {
              console.error('خطا در بارگذاری متغیرهای حافظه:', error);
              return '';
            }
          }
        },
        promptTemplate,
        model,
        new StringOutputParser()
      ]);

      // 6. اجرای زنجیره با حافظه
      console.log(`🔄 Executing LangChain sequence with memory...`);
      const aiResponse = await chainWithMemory.invoke({});

      // 7. ذخیره مکالمه در حافظه
      try {
        await memory.saveContext(
          { input: question },
          { output: aiResponse }
        );
        console.log(`💾 Memory updated for session: ${sessionId}`);
      } catch (memorySaveError) {
        console.error('خطا در ذخیره حافظه:', memorySaveError);
        // ادامه اجرا حتی در صورت خطا در ذخیره حافظه
      }

      // 8. استخراج copilot actions
      const { response: cleanResponse, actions } = extractCopilotActions(aiResponse);
      
      if (actions.length > 0) {
        console.log(`🎯 Copilot Actions detected:`, actions);
      }
      
      return { text: cleanResponse, copilotActions: actions };
    } catch (error) {
      console.error('Error in advanced LangChain AI:', error);
      throw error;
    }
  }

  // تابع مدیریت حافظه پیشرفته با تنظیمات بهینه
  function createMemoryManager(sessionId) {
    return new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output",
      maxTokenLimit: 2000, // محدودیت توکن برای کنترل حافظه
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
        const filePath = path.join(__dirname, '../../finlandq.md');
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

  // روت جدید برای آمار جامع sessions
  app.get('/api/session/analytics', async (c) => {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';
      
      let analytics = {
        totalSessions: 0,
        activeSessions: 0,
        totalQuestions: 0,
        totalActiveTime: 0,
        averageQuestionsPerSession: 0,
        averageSessionDuration: 0,
        sessionsByDate: {},
        questionsByDate: {},
        oldestSession: null,
        newestSession: null
      };

      if (isProduction || isVercel) {
        // استفاده از Turso
        const tursoDb = require('../services/turso-db');
        
        try {
          // استفاده از تابع getSessionStats موجود
          const basicStats = await tursoDb.getSessionStats();
          analytics.totalSessions = basicStats.totalSessions;
          analytics.activeSessions = basicStats.activeSessions;
          analytics.oldestSession = basicStats.oldestSession;
          
          // برای محاسبه آمار دقیق‌تر، نیاز به query های مستقیم داریم
          const { createClient } = require('@libsql/client');
          const client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
          });
          
          // تعداد کل سوالات
          const questionsResult = await client.execute('SELECT COUNT(*) as total FROM conversations WHERE role = ?', ['user']);
          analytics.totalQuestions = questionsResult.rows[0].total;
          
          // محاسبه زمان فعال
          const sessionsResult = await client.execute('SELECT created_at, last_activity FROM sessions');
          let totalActiveTime = 0;
          
          sessionsResult.rows.forEach(session => {
            const sessionStart = new Date(session.created_at);
            const sessionEnd = new Date(session.last_activity);
            const duration = (sessionEnd - sessionStart) / (1000 * 60 * 60); // ساعت
            totalActiveTime += duration;
          });
          
          analytics.totalActiveTime = Math.round(totalActiveTime * 100) / 100;
          
          // محاسبه میانگین‌ها
          if (analytics.totalSessions > 0) {
            analytics.averageQuestionsPerSession = Math.round((analytics.totalQuestions / analytics.totalSessions) * 100) / 100;
            analytics.averageSessionDuration = Math.round((analytics.totalActiveTime / analytics.totalSessions) * 100) / 100;
          }
          
          // آمار بر اساس تاریخ
          const sessionsByDateResult = await client.execute('SELECT DATE(created_at) as date FROM sessions');
          sessionsByDateResult.rows.forEach(row => {
            analytics.sessionsByDate[row.date] = (analytics.sessionsByDate[row.date] || 0) + 1;
          });
          
          // سوالات بر اساس تاریخ
          const questionsByDateResult = await client.execute('SELECT DATE(timestamp) as date FROM conversations WHERE role = ?', ['user']);
          questionsByDateResult.rows.forEach(row => {
            analytics.questionsByDate[row.date] = (analytics.questionsByDate[row.date] || 0) + 1;
          });
          
          // جدیدترین session
          const newestResult = await client.execute('SELECT MAX(created_at) as newest FROM sessions');
          if (newestResult.rows[0].newest) {
            analytics.newestSession = newestResult.rows[0].newest;
          }
          
        } catch (error) {
          console.error('Error getting analytics from Turso:', error);
          // Fallback to basic stats
          analytics = {
            totalSessions: 0,
            activeSessions: 0,
            totalQuestions: 0,
            totalActiveTime: 0,
            averageQuestionsPerSession: 0,
            averageSessionDuration: 0,
            sessionsByDate: {},
            questionsByDate: {},
            oldestSession: null,
            newestSession: null
          };
        }
      } else {
        // استفاده از SQLite در development
        await initSessionDatabase();
        
        analytics = await new Promise((resolve, reject) => {
          // تعداد کل sessions
          db.get('SELECT COUNT(*) as total FROM sessions', (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            
            analytics.totalSessions = row.total;
            analytics.activeSessions = row.total;
            
            // تعداد کل سوالات
            db.get('SELECT COUNT(*) as total FROM conversations WHERE role = ?', ['user'], (err, row) => {
              if (err) {
                reject(err);
                return;
              }
              
              analytics.totalQuestions = row.total;
              
              // محاسبه زمان فعال
              db.all('SELECT created_at, last_activity FROM sessions', (err, rows) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                let totalActiveTime = 0;
                rows.forEach(session => {
                  const sessionStart = new Date(session.created_at);
                  const sessionEnd = new Date(session.last_activity);
                  const duration = (sessionEnd - sessionStart) / (1000 * 60 * 60); // ساعت
                  totalActiveTime += duration;
                });
                
                analytics.totalActiveTime = Math.round(totalActiveTime * 100) / 100;
                
                // محاسبه میانگین‌ها
                if (analytics.totalSessions > 0) {
                  analytics.averageQuestionsPerSession = Math.round((analytics.totalQuestions / analytics.totalSessions) * 100) / 100;
                  analytics.averageSessionDuration = Math.round((analytics.totalActiveTime / analytics.totalSessions) * 100) / 100;
                }
                
                // آمار بر اساس تاریخ
                db.all('SELECT DATE(created_at) as date FROM sessions', (err, rows) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  
                  rows.forEach(row => {
                    analytics.sessionsByDate[row.date] = (analytics.sessionsByDate[row.date] || 0) + 1;
                  });
                  
                  // سوالات بر اساس تاریخ
                  db.all('SELECT DATE(timestamp) as date FROM conversations WHERE role = ?', ['user'], (err, rows) => {
                    if (err) {
                      reject(err);
                      return;
                    }
                    
                    rows.forEach(row => {
                      analytics.questionsByDate[row.date] = (analytics.questionsByDate[row.date] || 0) + 1;
                    });
                    
                    // قدیمی‌ترین و جدیدترین session
                    db.get('SELECT MIN(created_at) as oldest, MAX(created_at) as newest FROM sessions', (err, row) => {
                      if (err) {
                        reject(err);
                        return;
                      }
                      
                      analytics.oldestSession = row.oldest;
                      analytics.newestSession = row.newest;
                      
                      resolve(analytics);
                    });
                  });
                });
              });
            });
          });
        });
      }
      
      return c.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return c.json({ 
        error: 'خطا در دریافت آمار جامع sessions',
        message: error.message
      }, 500);
    }
  });

  // روت ساده برای آمار پایه sessions
  app.get('/api/session/basic-stats', async (c) => {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';
      
      let stats = {
        chatSessions: 0,
        questionsAsked: 0,
        activeTimeHours: 0
      };

      if (isProduction || isVercel) {
        // استفاده از Turso
        const tursoDb = require('../services/turso-db');
        
        try {
          // استفاده از تابع getSessionStats موجود
          const basicStats = await tursoDb.getSessionStats();
          stats.chatSessions = basicStats.totalSessions;
          
          // برای محاسبه آمار دقیق‌تر، نیاز به query های مستقیم داریم
          const { createClient } = require('@libsql/client');
          const client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
          });
          
          // تعداد کل سوالات
          const questionsResult = await client.execute('SELECT COUNT(*) as total FROM conversations WHERE role = ?', ['user']);
          stats.questionsAsked = questionsResult.rows[0].total;
          
          // محاسبه زمان فعال
          const sessionsResult = await client.execute('SELECT created_at, last_activity FROM sessions');
          let totalActiveTime = 0;
          
          sessionsResult.rows.forEach(session => {
            const sessionStart = new Date(session.created_at);
            const sessionEnd = new Date(session.last_activity);
            const duration = (sessionEnd - sessionStart) / (1000 * 60 * 60); // ساعت
            totalActiveTime += duration;
          });
          
          stats.activeTimeHours = Math.round(totalActiveTime * 100) / 100;
          
        } catch (error) {
          console.error('Error getting basic stats from Turso:', error);
          // Fallback to zero values
          stats = {
            chatSessions: 0,
            questionsAsked: 0,
            activeTimeHours: 0
          };
        }
      } else {
        // استفاده از SQLite در development
        await initSessionDatabase();
        
        stats = await new Promise((resolve, reject) => {
          // تعداد کل sessions
          db.get('SELECT COUNT(*) as total FROM sessions', (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            
            stats.chatSessions = row.total;
            
            // تعداد کل سوالات
            db.get('SELECT COUNT(*) as total FROM conversations WHERE role = ?', ['user'], (err, row) => {
              if (err) {
                reject(err);
                return;
              }
              
              stats.questionsAsked = row.total;
              
              // محاسبه زمان فعال
              db.all('SELECT created_at, last_activity FROM sessions', (err, rows) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                let totalActiveTime = 0;
                rows.forEach(session => {
                  const sessionStart = new Date(session.created_at);
                  const sessionEnd = new Date(session.last_activity);
                  const duration = (sessionEnd - sessionStart) / (1000 * 60 * 60); // ساعت
                  totalActiveTime += duration;
                });
                
                stats.activeTimeHours = Math.round(totalActiveTime * 100) / 100;
                resolve(stats);
              });
            });
          });
        });
      }
      
      return c.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error getting basic session stats:', error);
      return c.json({ 
        error: 'خطا در دریافت آمار پایه sessions',
        message: error.message
      }, 500);
    }
  });

  // روت debug برای بررسی داده‌های Turso
  app.get('/api/session/debug', async (c) => {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';
      
      if (isProduction || isVercel) {
        const { createClient } = require('@libsql/client');
        const client = createClient({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });
        
        // بررسی جداول موجود
        const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
        const tables = tablesResult.rows.map(row => row.name);
        
        // بررسی تعداد sessions
        const sessionsResult = await client.execute('SELECT COUNT(*) as total FROM sessions');
        const sessionsCount = sessionsResult.rows[0].total;
        
        // بررسی تعداد conversations
        const conversationsResult = await client.execute('SELECT COUNT(*) as total FROM conversations');
        const conversationsCount = conversationsResult.rows[0].total;
        
        // بررسی چند session نمونه
        const sampleSessions = await client.execute('SELECT * FROM sessions LIMIT 3');
        
        // بررسی چند conversation نمونه
        const sampleConversations = await client.execute('SELECT * FROM conversations LIMIT 3');
        
        return c.json({
          success: true,
          debug: {
            tables,
            sessionsCount,
            conversationsCount,
            sampleSessions: sampleSessions.rows,
            sampleConversations: sampleConversations.rows,
            environment: {
              nodeEnv: process.env.NODE_ENV,
              isVercel: process.env.VERCEL === '1',
              hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
              hasTursoToken: !!process.env.TURSO_AUTH_TOKEN
            }
          },
          timestamp: new Date().toISOString()
        });
        
      } else {
        return c.json({
          success: true,
          debug: {
            message: 'Debug endpoint only available in production',
            environment: {
              nodeEnv: process.env.NODE_ENV,
              isVercel: process.env.VERCEL === '1'
            }
          }
        });
      }
      
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      return c.json({ 
        error: 'خطا در debug endpoint',
        message: error.message
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