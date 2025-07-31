'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles, Globe, Users, ArrowLeft, Crown, Shield, CheckCircle, X, Sun, Moon, Zap, Bot, User2, Copy, ThumbsUp, ThumbsDown, RotateCcw, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const parseMarkdown = (text: string) => {
  let result = text;
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  result = result.replace(/\n/g, '<br>');
  return result;
};

export default function FinlandQPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '🎉 سلام! من دستیار هوشمند **فنلاند کیو** هستم\n\nمن می‌تونم در این موارد کمکتون کنم:\n• **مهاجرت به فنلاند** - راهنمایی کامل\n• **تحصیل در فنلاند** - دانشگاه‌ها و بورسیه‌ها\n• **کار در فنلاند** - فرصت‌های شغلی\n• **اقامت و ویزا** - مراحل قانونی\n\nچطور می‌تونم کمکتون کنم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInConsultationMode, setIsInConsultationMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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

    // Load theme preference
    const savedTheme = localStorage.getItem('finlandq-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('finlandq-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage.trim();
    setInputMessage('');
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startConsultation = () => {
    setIsInConsultationMode(true);
    const consultationMessage: Message = {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'assistant',
      content: '🎯 درخواست مشاوره شما دریافت شد! برای اطلاعات بیشتر با شماره 91691021 تماس بگیرید.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, consultationMessage]);
  };

  const quickActions = [
    { icon: "🎓", label: "تحصیل در فنلاند", action: () => setInputMessage("راهنمایی تحصیل در فنلاند") },
    { icon: "💼", label: "کار در فنلاند", action: () => setInputMessage("فرصت‌های شغلی فنلاند") },
    { icon: "🏠", label: "اقامت و ویزا", action: () => setInputMessage("راهنمایی اقامت فنلاند") },
    { icon: "📞", label: "مشاوره تخصصی", action: startConsultation }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`} dir="rtl">
      {/* Ant Design X Inspired Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-blue-200/50'} backdrop-blur-xl border-b sticky top-0 z-50 shadow-lg transition-all duration-500`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section - Ant Design X Style */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="flex items-center gap-4"
            >
              <Link href="/" className="flex items-center gap-4 group">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-12 h-12 ${isDarkMode ? 'bg-gradient-to-br from-blue-400 to-purple-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-all duration-300 shadow-lg`}
                >
                  <Globe className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600'} bg-clip-text text-transparent`}>
                    فنلاند کیو
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    دستیار هوشمند مهاجرت به فنلاند
                  </p>
                </div>
              </Link>
            </motion.div>
            
            {/* Controls */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
              className="flex items-center gap-4"
            >
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Status */}
              <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-green-900/50 border-green-700' : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200'} px-4 py-2 rounded-full border transition-all duration-300`}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-500 rounded-full"
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>آنلاین</span>
              </div>

              <Link 
                href="/" 
                className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-all duration-300 hover:scale-105`}
              >
                <ArrowLeft className="w-4 h-4" />
                برگشت
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Ant Design X Inspired Chat Interface */}
      <div className="h-[calc(100vh-80px)] flex flex-col max-w-6xl mx-auto">
        {/* Chat Header - Ant Design X Style */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white'} p-6 relative overflow-hidden transition-all duration-500`}
        >
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-16 h-16 ${isDarkMode ? 'bg-gray-600/50' : 'bg-white/20'} backdrop-blur-sm rounded-2xl flex items-center justify-center border ${isDarkMode ? 'border-gray-500' : 'border-white/30'}`}
              >
                <Bot className="w-8 h-8" />
              </motion.div>
              <div>
                <h2 className="font-bold text-xl flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  چت با دستیار فنلاند کیو
                </h2>
                <p className="text-sm opacity-90 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  آماده پاسخگویی به سوالات شما با تکنولوژی AI
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={startConsultation}
                disabled={isInConsultationMode || isLoading}
                className={`${isDarkMode ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white py-3 px-6 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 text-sm font-medium shadow-lg`}
              >
                <Users className="w-4 h-4" />
                {isInConsultationMode ? 'در حال مشاوره...' : 'درخواست مشاوره'}
              </motion.button>

              {sessionId && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`${isDarkMode ? 'bg-gray-600/50 border-gray-500' : 'bg-white/20 border-white/30'} backdrop-blur-sm px-4 py-2 rounded-xl text-xs border`}
                >
                  ID: {sessionId.slice(-8)}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Ant Design X Style */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200/50'} border-b p-4 backdrop-blur-sm`}
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 text-sm font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200'} shadow-sm hover:shadow-md`}
              >
                <span className="text-lg">{action.icon}</span>
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Messages Area - Ant Design X Style */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 via-blue-50/30 to-indigo-50/30'} transition-all duration-500`}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  delay: index * 0.05
                }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className={`max-w-[85%] lg:max-w-[70%] ${
                    message.type === 'user' 
                      ? `${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'} text-white shadow-xl` 
                      : `${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white text-gray-800 border border-gray-200/50'} shadow-lg backdrop-blur-sm`
                  } rounded-2xl px-6 py-4 transition-all duration-300 relative group`}
                >
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {message.type === 'assistant' ? (
                      <Bot className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    ) : (
                      <User2 className="w-4 h-4 text-blue-100" />
                    )}
                    <span className={`text-xs font-medium ${message.type === 'user' ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {message.type === 'assistant' ? 'دستیار فنلاند کیو' : 'شما'}
                    </span>
                    <span className={`text-xs ${message.type === 'user' ? 'text-blue-100' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString('fa-IR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="relative">
                    <p 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                    ></p>
                  </div>

                  {/* Message Actions */}
                  {message.type === 'assistant' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <button className={`p-1 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'} transition-colors`}>
                        <Copy className="w-3 h-3" />
                      </button>
                      <button className={`p-1 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'} transition-colors`}>
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button className={`p-1 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'} transition-colors`}>
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Ant Design X Loading indicator */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-start"
            >
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200/50'} backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border`}>
                <div className="flex items-center gap-3">
                  <Bot className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className={`w-2 h-2 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full`}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className={`w-2 h-2 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-500'} rounded-full`}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className={`w-2 h-2 ${isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'} rounded-full`}
                    />
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>در حال تایپ...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Ant Design X Input Area */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200/50'} border-t p-6 backdrop-blur-sm transition-all duration-500`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="سوال خود را بپرسید یا برای مشاوره بنویسید 'مشاوره می‌خوام'..."
                  className={`w-full resize-none rounded-2xl border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-500' : 'border-gray-200 bg-white text-gray-800 placeholder-gray-500 focus:border-blue-400'} px-6 py-4 pr-16 focus:outline-none focus:ring-4 ${isDarkMode ? 'focus:ring-blue-500/20' : 'focus:ring-blue-200'} shadow-lg focus:shadow-xl transition-all duration-300 text-sm backdrop-blur-sm`}
                  rows={1}
                  disabled={isLoading}
                />
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </motion.div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white px-6 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2`}
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">ارسال</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}