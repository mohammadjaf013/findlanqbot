'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Crown, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Bubble, Conversations, Prompts, Sender, Welcome, ThoughtChain } from '@ant-design/x';
import { App, ConfigProvider, Spin } from 'antd';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FinlandQ4Page() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'سلام! من دستیار هوشمند فنلاند کیو هستم. برای راهنمایی در مورد مهاجرت، تحصیل و کار در فنلاند آماده‌ام.\n\n💡 **نکته:** اگر نیاز به مشاوره دارید، فقط کافیه بنویسید "مشاوره می‌خوام" و من خودکار فرم مشاوره را برایتان باز می‌کنم!\n\nچطور می‌تونم کمکتون کنم؟',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');
    
    if (urlSessionId) {
      setSessionId(urlSessionId);
      loadConversationHistory(urlSessionId);
    } else {
      createNewSession();
    }
  }, []);

  // Load conversation history
  const loadConversationHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`https://bot-api.finlandq.com/api/session/${sessionId}/history`);
      const data = await response.json();
      
      if (data.success && data.messages && data.messages.length > 0) {
        const historyMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          type: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('خطا در بارگذاری تاریخچه مکالمه:', error);
    }
  };

  // Create new session
  const createNewSession = async () => {
    try {
      const response = await fetch('https://bot-api.finlandq.com/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        const newSessionId = data.session.id;
        setSessionId(newSessionId);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('session', newSessionId);
        window.history.replaceState({}, '', newUrl.toString());
      }
    } catch (error) {
      console.error('خطا در ایجاد session:', error);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message function
  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const requestBody = {
        question: userMessage.content,
        sessionId: sessionId,
        useLangChain: true
      };
      
      const response = await fetch('https://bot-api.finlandq.com/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('session', data.sessionId);
          window.history.replaceState({}, '', newUrl.toString());
        }
        
        setIsLoading(false);
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: data.answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'خطا در دریافت پاسخ');
      }
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: 'متأسفم، خطایی رخ داده است. برای اطلاعات تکمیلی با پشتیبانی شماره 91691021 تماس بگیرید.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Convert messages to Ant Design X format
  const conversationItems = messages.map((message) => ({
    key: message.id,
    label: message.type === 'user' ? 'شما' : 'فنلاند کیو',
    timestamp: message.timestamp.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    placement: message.type === 'user' ? 'end' : 'start',
    typing: false,
    content: message.content,
    role: message.type
  }));

  // Add loading message if needed
  if (isLoading) {
    conversationItems.push({
      key: 'loading',
      label: 'فنلاند کیو',
      timestamp: new Date().toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      placement: 'start',
      typing: true,
      content: '',
      role: 'assistant'
    });
  }

  // Welcome prompts
  const welcomePrompts = [
    {
      key: '1',
      description: '🎓 تحصیل در فنلاند',
      content: 'می‌خوام در مورد تحصیل در فنلاند اطلاعات بگیرم'
    },
    {
      key: '2', 
      description: '💼 کار در فنلاند',
      content: 'چطور می‌تونم در فنلاند کار پیدا کنم؟'
    },
    {
      key: '3',
      description: '🏠 اقامت و زندگی',
      content: 'در مورد اقامت و زندگی در فنلاند بگو'
    },
    {
      key: '4',
      description: '👥 مشاوره تخصصی',
      content: 'مشاوره می‌خوام'
    }
  ];

  return (
    <ConfigProvider
      direction="rtl"
      theme={{
        token: {
          fontFamily: 'Vazir, -apple-system, BlinkMacSystemFont, segoe ui, Roboto, helvetica neue, Arial, noto sans, sans-serif',
          colorPrimary: '#4385f6',
        },
      }}
    >
      <App>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden" dir="rtl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
            />
            <motion.div
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-xl"
            />
          </div>

          {/* Enhanced Header */}
          <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bg-white/90 backdrop-blur-xl border-b border-blue-200/50 sticky top-0 z-50 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                  className="flex items-center gap-4"
                >
                  <Link href="/" className="flex items-center gap-4 group">
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        فنلاند کیو 4
                      </h1>
                      <p className="text-xs text-gray-600 flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 bg-green-500 rounded-full"
                        />
                        دستیار هوشمند با Ant Design X
                      </p>
                    </div>
                  </Link>
                </motion.div>
                
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
                  className="flex items-center gap-4"
                >
                  <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-green-500 rounded-full"
                    />
                    <span className="text-sm font-medium text-green-700">آنلاین</span>
                  </div>
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    برگشت
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Chat Container */}
          <div className="h-[calc(100vh-80px)] flex flex-col">
            {/* Chat Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 md:p-3 p-2 text-white relative overflow-hidden"
            >
              <div className="relative flex md:flex-row flex-col md:gap-0 gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"
                  >
                    <img src="/q.png" className='w-full h-full object-contain p-2' alt="FinlandQ" />
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-sm md:text-xl flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-300" />
                      چت با Ant Design X فنلاند کیو
                    </h2>
                    <p className="text-sm opacity-90 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      آماده پاسخگویی به سوالات شما
                    </p>
                  </div>
                </div>
                
                {sessionId && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-white/20 hidden md:block backdrop-blur-sm px-4 py-2 rounded-xl text-xs border border-white/30"
                  >
                    ID: {sessionId.slice(-8)}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Main Chat Area with Ant Design X */}
            <div className="flex-1 p-4 bg-white/50 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto h-full">
                {messages.length === 1 ? (
                  // Welcome screen with prompts
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <Welcome
                        variant="filled"
                        icon="🤖"
                        title="سلام! من دستیار فنلاند کیو هستم"
                        description="برای راهنمایی در مورد مهاجرت، تحصیل و کار در فنلاند آماده‌ام"
                        extra={
                          <Prompts
                            title="شروع سریع:"
                            items={welcomePrompts}
                            onItemClick={(item) => handleSend(item.content)}
                            styles={{
                              item: {
                                borderRadius: '12px',
                                border: '1px solid #e1e5e9',
                                marginBottom: '8px',
                                textAlign: 'right'
                              }
                            }}
                          />
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <Sender
                        placeholder="سوال خود را بپرسید یا برای مشاوره بنویسید 'مشاوره می‌خوام'..."
                        onSubmit={handleSend}
                        loading={isLoading}
                        style={{ direction: 'rtl', textAlign: 'right' }}
                        styles={{
                          input: {
                            direction: 'rtl',
                            textAlign: 'right',
                            fontFamily: 'Vazir, sans-serif'
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Chat conversation
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-hidden">
                      <Conversations
                        items={conversationItems}
                        styles={{
                          list: {
                            height: '100%',
                            direction: 'rtl'
                          }
                        }}
                        renderItem={(item) => (
                          <Bubble
                            key={item.key}
                            placement={item.placement as any}
                            typing={item.typing}
                            avatar={item.role === 'assistant' ? '🤖' : '👤'}
                            content={
                              item.typing ? (
                                <div className="flex items-center gap-2">
                                  <Spin size="small" />
                                  <span>در حال تایپ...</span>
                                </div>
                              ) : (
                                <div 
                                  dangerouslySetInnerHTML={{ 
                                    __html: item.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                      .replace(/\n/g, '<br>')
                                  }} 
                                />
                              )
                            }
                            footer={
                              <div className="text-xs opacity-70 mt-1">
                                {item.timestamp}
                              </div>
                            }
                            styles={{
                              content: {
                                direction: 'rtl',
                                textAlign: 'right',
                                fontFamily: 'Vazir, sans-serif',
                                backgroundColor: item.role === 'user' ? '#4385f6' : '#f8f9fa',
                                color: item.role === 'user' ? 'white' : '#333',
                                borderRadius: '12px',
                                padding: '12px 16px'
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                    <div className="mt-4">
                      <Sender
                        placeholder="سوال خود را بپرسید..."
                        onSubmit={handleSend}
                        loading={isLoading}
                        style={{ direction: 'rtl', textAlign: 'right' }}
                        styles={{
                          input: {
                            direction: 'rtl',
                            textAlign: 'right',
                            fontFamily: 'Vazir, sans-serif'
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </App>
    </ConfigProvider>
  );
}