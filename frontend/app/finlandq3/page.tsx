'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles, Globe, Users, ArrowLeft, HelpCircle, Crown, Shield, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConsultationFormData {
  salutationtype: string;
  first_name: string;
  last_name: string;
  age: string;
  email: string;
  mobile: string;
  city: string;
  acquainted: string;
  position: string[];
  message: string;
  conversation_summary?: string;
  sales_analysis?: string;
  source?: string;
}

interface ConsultationFormData {
  salutationtype: string;
  first_name: string;
  last_name: string;
  age: string;
  email: string;
  mobile: string;
  city: string;
  acquainted: string;
  position: string[];
  message: string;
  conversation_summary?: string;
  sales_analysis?: string;
  source?: string;
}

// Quick Reply Options Component
function QuickReplyOptions({ question, onSelect, isLoading }: { 
  question: any; 
  onSelect: (answer: string | string[]) => void; 
  isLoading: boolean;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');

  const handleOptionClick = (value: string) => {
    if (question.multiple) {
      const newSelection = selectedOptions.includes(value)
        ? selectedOptions.filter(v => v !== value)
        : [...selectedOptions, value];
      setSelectedOptions(newSelection);
    } else {
      onSelect(value);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onSelect(textInput.trim());
      setTextInput('');
    }
  };

  const handleMultipleSubmit = () => {
    if (selectedOptions.length > 0) {
      onSelect(selectedOptions);
      setSelectedOptions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.type === 'textarea') return;
      handleTextSubmit();
    }
  };

  // گزینه‌ای
  if (question.options && !question.multiple) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((option: any, index: number) => (
            <motion.button
              key={typeof option === 'string' ? option : option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOptionClick(typeof option === 'string' ? option : option.value)}
              disabled={isLoading}
              className="text-right p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg transition-all duration-300 disabled:opacity-50 text-gray-800 text-sm sm:text-base shadow-sm hover:shadow-md"
            >
              {typeof option === 'string' ? option : option.label}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // چند گزینه‌ای
  if (question.options && question.multiple) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((option: any, index: number) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOptionClick(option.value)}
              disabled={isLoading}
              className={`text-right p-2 sm:p-3 border rounded-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base shadow-sm hover:shadow-md ${
                selectedOptions.includes(option.value)
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                  : 'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-gray-800'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
        {selectedOptions.length > 0 && (
          <button
            onClick={handleMultipleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            تأیید انتخاب ({selectedOptions.length} مورد)
          </button>
        )}
      </div>
    );
  }

  // ورودی متنی
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 sm:gap-3"
    >
      <div className="flex-1 relative">
        {question.type === 'textarea' ? (
          <motion.textarea
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="پاسخ خود را بنویسید..."
            className="w-full resize-none rounded-xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm focus:shadow-md transition-all duration-300 text-sm sm:text-base"
            rows={3}
            disabled={isLoading}
          />
        ) : (
          <motion.input
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            type={question.type || 'text'}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="پاسخ خود را بنویسید..."
            className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm focus:shadow-md transition-all duration-300 text-sm sm:text-base"
            disabled={isLoading}
          />
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTextSubmit}
        disabled={!textInput.trim() || isLoading}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>
    </motion.div>
  );
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
      content: 'سلام! من دستیار هوشمند فنلاند کیو هستم. برای راهنمایی در مورد مهاجرت، تحصیل و کار در فنلاند آماده‌ام.\n\n💡 **نکته:** اگر نیاز به مشاوره دارید، فقط کافیه بنویسید "مشاوره می‌خوام" و من خودکار فرم مشاوره را برایتان باز می‌کنم!\n\nچطور می‌تونم کمکتون کنم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInConsultationMode, setIsInConsultationMode] = useState(false);
  const [consultationStep, setConsultationStep] = useState(-1);
  const [consultationData, setConsultationData] = useState<Partial<ConsultationFormData>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // سوالات مشاوره
  const consultationQuestions = [
    {
      field: 'salutationtype',
      question: 'سلام! لطفاً جنسیت خود را انتخاب کنید:',
      type: 'select',
      options: ['آقا', 'خانم'],
      validation: { required: true, message: 'لطفاً جنسیت خود را انتخاب کنید' }
    },
    {
      field: 'first_name',
      question: 'نام شما چیست؟',
      type: 'text',
      validation: { required: true, message: 'لطفاً نام خود را وارد کنید' }
    },
    {
      field: 'last_name',
      question: 'نام خانوادگی شما چیست؟',
      type: 'text',
      validation: { required: true, message: 'لطفاً نام خانوادگی خود را وارد کنید' }
    },
    {
      field: 'age',
      question: 'سن شما چند سال است؟',
      type: 'number',
      validation: { required: true, message: 'لطفاً سن خود را وارد کنید' }
    },
    {
      field: 'email',
      question: 'ایمیل شما چیست؟',
      type: 'email',
      validation: { required: true, type: 'email', message: 'لطفاً ایمیل معتبر وارد کنید' }
    },
    {
      field: 'mobile',
      question: 'شماره موبایل شما چیست؟',
      type: 'tel',
      validation: { required: true, message: 'لطفاً شماره موبایل معتبر وارد کنید' }
    },
    {
      field: 'city',
      question: 'در کدام شهر زندگی می‌کنید؟',
      type: 'text',
      validation: { required: true, message: 'لطفاً شهر خود را وارد کنید' }
    },
    {
      field: 'acquainted',
      question: 'چطور با ما آشنا شدید؟',
      type: 'select',
      options: ['اینستاگرام', 'تلگرام', 'گوگل', 'دوست/آشنایان', 'سایر'],
      validation: { required: true, message: 'لطفاً منبع آشنایی را انتخاب کنید' }
    },
    {
      field: 'position',
      question: 'کدام گزینه‌ها برای شما مناسب است؟ (می‌توانید چند گزینه انتخاب کنید)',
      type: 'select',
      multiple: true,
      options: [
        { value: 'student', label: 'دانشجو' },
        { value: 'worker', label: 'کارمند' },
        { value: 'entrepreneur', label: 'کارآفرین' },
        { value: 'freelancer', label: 'فریلنسر' },
        { value: 'other', label: 'سایر' }
      ],
      validation: { required: true, message: 'لطفاً حداقل یک گزینه انتخاب کنید' }
    },
    {
      field: 'message',
      question: 'لطفاً توضیح دهید که چه نوع مشاوره‌ای نیاز دارید:',
      type: 'textarea',
      validation: { required: true, message: 'لطفاً توضیحات خود را وارد کنید' }
    }
  ];

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

  const validateAnswer = (question: any, answer: string | string[]): { isValid: boolean; errorMessage?: string } => {
    const validation = question.validation;
    if (!validation) return { isValid: true };

    // چک کردن required
    if (validation.required) {
      if (!answer || 
          (typeof answer === 'string' && answer.trim() === '') ||
          (Array.isArray(answer) && answer.length === 0)) {
        return { isValid: false, errorMessage: validation.message };
      }
    }

    // چک کردن email
    if (validation.type === 'email' && typeof answer === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer)) {
        return { isValid: false, errorMessage: 'فرمت ایمیل صحیح نیست' };
      }
    }

    // چک کردن شماره موبایل
    if (question.type === 'tel' && typeof answer === 'string') {
      const mobileRegex = /^09\d{9}$/;
      if (!mobileRegex.test(answer.replace(/\s/g, ''))) {
        return { isValid: false, errorMessage: 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد' };
      }
    }

    // چک کردن سن
    if (question.type === 'number' && typeof answer === 'string') {
      const age = parseInt(answer);
      if (isNaN(age) || age < 1 || age > 120) {
        return { isValid: false, errorMessage: 'سن باید عددی بین 1 تا 120 باشد' };
      }
    }

    return { isValid: true };
  };

  const handleConsultationAnswer = (answer: string | string[]) => {
    // اگر در مرحله تأیید هستیم (step -1)
    if (consultationStep === -1) {
      const answerText = (Array.isArray(answer) ? answer[0] : answer).toLowerCase();
      const confirmationWords = ['بله', 'آره', 'yes', 'اوکی', 'ok', 'okay', 'اوکه', 'باشه', 'حتماً', 'البته', 'آماده', 'ready', 'بزن بریم', 'شروع کن', 'موافقم', 'قبوله'];
      
      if (confirmationWords.some(word => answerText.includes(word))) {
        // کاربر تأیید کرد، شروع سوالات اصلی
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: Array.isArray(answer) ? answer.join(', ') : answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setTimeout(() => {
          const firstRealQuestion: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: consultationQuestions[0].question,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, firstRealQuestion]);
          setConsultationStep(0);
        }, 800);
        return;
      } else {
        // کاربر رد کرد یا جواب نامناسب داد
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: Array.isArray(answer) ? answer.join(', ') : answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setTimeout(() => {
          let clarificationContent = '';
          if (answerText.includes('خیر') || answerText.includes('نه') || answerText.includes('no')) {
            clarificationContent = 'مشکلی نیست! وقتی آماده شدید برای مشاوره، فقط "مشاوره می‌خوام" بگید 😊';
            // خروج از حالت مشاوره
            setIsInConsultationMode(false);
            setConsultationStep(-1);
            setConsultationData({});
          } else {
            clarificationContent = 'لطفاً "بله" یا "خیر" بگویید تا بتوانم بهتر راهنماییتان کنم 😊';
          }
          
          const clarificationMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: clarificationContent,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, clarificationMessage]);
        }, 800);
        return;
      }
    }

    // سوالات اصلی
    const currentQuestion = consultationQuestions[consultationStep];
    const validation = validateAnswer(currentQuestion, answer);
    
    if (!validation.isValid) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ ${validation.errorMessage}\n\nلطفاً دوباره پاسخ دهید:`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // ذخیره پاسخ
    const fieldName = currentQuestion.field as keyof ConsultationFormData;
    setConsultationData(prev => ({
      ...prev,
      [fieldName]: Array.isArray(answer) ? answer : answer
    }));

    // اضافه کردن پیام کاربر
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: Array.isArray(answer) ? answer.join(', ') : answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // بررسی اینکه آیا آخرین سوال بود
    if (consultationStep === consultationQuestions.length - 1) {
      // پایان سوالات
      setTimeout(() => {
        const completionMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: '✅ اطلاعات شما با موفقیت ثبت شد!\n\nکارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.\n\n📞 برای تماس مستقیم: 91691021\n\nممنون از اعتماد شما! 🙏',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
        
        // خروج از حالت مشاوره
        setIsInConsultationMode(false);
        setConsultationStep(-1);
        setConsultationData({});
      }, 800);
    } else {
      // سوال بعدی
      setTimeout(() => {
        const nextQuestion = consultationQuestions[consultationStep + 1];
        const nextQuestionMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: nextQuestion.question,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, nextQuestionMessage]);
        setConsultationStep(consultationStep + 1);
      }, 800);
    }
  };

  const startConsultation = () => {
    setIsInConsultationMode(true);
    setConsultationStep(-1);
    setConsultationData({});
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'برای شروع من چند تا اطلاعات شما نیاز دارم که بهتر بتونم راهنماییتون کنم. اوکی هستید؟',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
  };

  return (
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
                    فنلاند کیو
                  </h1>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
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

      {/* Enhanced Full Screen Chat */}
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Enhanced Chat Header */}
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
                  <Crown className="w-5 h-5  text-yellow-300" />
                  چت با دستیار فنلاند کیو
                </h2>
                <p className="text-sm opacity-90 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  آماده پاسخگویی به سوالات شما
                </p>
              </div>
            </div>
            
            {/* Enhanced Header Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={startConsultation}
                disabled={isInConsultationMode || isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 md:py-3 px-4 px-6 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 text-sm font-medium shadow-lg"
              >
                <Users className="w-4 h-4 hidden md:block" />
                {isInConsultationMode ? 'در حال مشاوره...' : 'درخواست مشاوره'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (confirm('آیا می‌خواهید مکالمه جدیدی شروع کنید؟')) {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.delete('session');
                    window.history.replaceState({}, '', newUrl.toString());
                    
                    setMessages([{
                      id: '1',
                      type: 'assistant',
                      content: 'سلام! من دستیار هوشمند فنلاند کیو هستم. برای راهنمایی در مورد مهاجرت، تحصیل و کار در فنلاند آماده‌ام.\n\n💡 **نکته:** اگر نیاز به مشاوره دارید، فقط کافیه بنویسید "مشاوره می‌خوام" و من خودکار فرم مشاوره را برایتان باز می‌کنم!\n\nچطور می‌تونم کمکتون کنم؟',
                      timestamp: new Date()
                    }]);
                    createNewSession();
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white py-2 md:py-3 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm backdrop-blur-sm border border-white/30"
              >
                <MessageCircle className="w-4 h-4 hidden md:block" />
                چت جدید
              </motion.button>

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
          </div>
        </motion.div>

        {/* Enhanced Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 via-blue-50/30 to-indigo-50/30 relative">
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
                  delay: index * 0.1
                }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`max-w-[85%] lg:max-w-[70%] ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl' 
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg border border-gray-200/50'
                  } rounded-3xl px-6 py-4 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="relative">
                  <p 
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                  ></p>
                    <div className={`flex items-center justify-between mt-3 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                      <div className="flex items-center gap-2">
                        {message.type === 'assistant' && (
                          <motion.div
                            // animate={{ rotate: [0, 360] }}
                            // transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-3 h-3" />
                          </motion.div>
                        )}
                        <span className="text-xs">
                    {message.timestamp.toLocaleTimeString('fa-IR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                        </span>
                      </div>
                      {message.type === 'user' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Enhanced Loading indicator */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-lg border border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-3 h-3 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                      className="w-3 h-3 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-3 h-3 bg-indigo-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">در حال تایپ...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Options for Consultation */}
        {isInConsultationMode && (
          <div className="border-t border-gray-100 p-4">
            {consultationStep === -1 ? (
              // مرحله تأیید - فقط گزینه‌های بله/خیر
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleConsultationAnswer('بله')}
                    disabled={isLoading}
                    className="text-right p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-lg transition-all duration-300 disabled:opacity-50 text-gray-800 text-sm sm:text-base shadow-sm hover:shadow-md"
                  >
                    بله، آماده‌ام ✅
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleConsultationAnswer('خیر')}
                    disabled={isLoading}
                    className="text-right p-2 sm:p-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 rounded-lg transition-all duration-300 disabled:opacity-50 text-gray-800 text-sm sm:text-base shadow-sm hover:shadow-md"
                  >
                    فعلاً نه ❌
                  </motion.button>
                </div>
              </div>
            ) : consultationStep >= 0 && consultationStep < consultationQuestions.length ? (
              // سوالات اصلی
              <QuickReplyOptions 
                question={consultationQuestions[consultationStep]}
                onSelect={handleConsultationAnswer}
                isLoading={isLoading}
              />
            ) : null}
          </div>
        )}

        {/* Enhanced Input Area */}
        {!isInConsultationMode && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="border-t  border-gray-200/50 p-4 md:p-6 bg-white/90 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3 max-w-[700px] mx-auto">
              {/* Textarea Container */}
              <div className="relative">
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    // Ctrl+Enter to send
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="سوال خود را بپرسید یا برای مشاوره بنویسید 'مشاوره می‌خوام'... (Ctrl+Enter برای ارسال)"
                  className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-md focus:shadow-lg transition-all duration-300 text-sm"
                  rows={3}
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-3">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                
                {/* Keyboard Shortcuts Help */}
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd>
                    +
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd>
                    برای ارسال
                  </span>
                </div>
              </div>
              
              {/* Send Button Row - Below textarea */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2 text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  ارسال پیام
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}