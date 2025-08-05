'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles, Globe, Users, ArrowLeft, HelpCircle, Crown, Shield, CheckCircle, X, Plus, Menu, Settings, User } from 'lucide-react';
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

// Ready prompts for quick access
const readyPrompts = [
  {
    id: 1,
    title: "مهاجرت تحصیلی",
    description: "راهنمایی کامل برای تحصیل در فنلاند",
    prompt: "می‌خوام برای تحصیل در فنلاند اقدام کنم. لطفاً مراحل و شرایط رو توضیح بدید."
  },
  {
    id: 2,
    title: "مهاجرت کاری",
    description: "اطلاعات کار و ویزای کاری فنلاند",
    prompt: "می‌خوام برای کار در فنلاند اقدام کنم. شرایط و مراحل رو بگید."
  },
  {
    id: 3,
    title: "هزینه‌های زندگی",
    description: "بررسی هزینه‌های زندگی در فنلاند",
    prompt: "هزینه‌های زندگی در فنلاند چقدره؟ شامل مسکن، غذا، حمل و نقل."
  },
  {
    id: 4,
    title: "استارتاپ فنلاند",
    description: "راهنمایی برای راه‌اندازی استارتاپ",
    prompt: "می‌خوام استارتاپم رو در فنلاند راه‌اندازی کنم. چطور می‌تونم شروع کنم؟"
  }
];

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
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInConsultationMode, setIsInConsultationMode] = useState(false);
  const [consultationStep, setConsultationStep] = useState(-1);
  const [consultationData, setConsultationData] = useState<Partial<ConsultationFormData>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // سوالات مشاوره
  const consultationQuestions = [
    { 
      field: 'salutationtype', 
      question: 'سلام! خوشحالم که برای مشاوره با من در تماس هستید 😊\n\nابتدا بگید ترجیح دارید چطور با شما صحبت کنم؟', 
      options: ['آقای', 'خانم', 'دکتر', 'استاد'],
      validation: { required: true, message: 'لطفاً نحوه خطاب را انتخاب کنید' },
      responseTemplates: [
        'باشه، {value}! 👋',
        'عالی {value}! 😊',
        'خوشحالم {value}! ✨',
        'خیلی خوب {value}! 🎯'
      ]
    },
    { 
      field: 'first_name', 
      question: 'اسم شما چیه؟ 🤔', 
      type: 'text',
      validation: { required: true, message: 'لطفاً اسمتون رو بگید' },
      responseTemplates: [
        'ممنونم {value}! اسم قشنگی دارید 😊',
        'واو {value}! اسم زیبایی انتخاب کردید 🌟',
        'چه اسم دوست‌داشتنی‌ای {value}! 💫',
        'خوشحالم آشناتون شدم {value}! 🎉',
        '{value}! اسم خوشگلی دارید 🌺'
      ]
    },
    { 
      field: 'last_name', 
      question: 'اسم فامیلتون هم لطف می‌کنید؟', 
      type: 'text',
      validation: { required: true, message: 'اسم فامیل هم مهمه برای من' },
      responseTemplates: [
        'عالی {salutationtype} {first_name} {value}! 👏',
        'خیلی خوب! حالا اسم کاملتون رو دارم {salutationtype} {first_name} {value} 🎯',
        'پرفکت! {salutationtype} {first_name} {value} عزیز ✨',
        'ممنونم! {salutationtype} {first_name} {value} خوشحال شدم 😊'
      ]
    },
    { 
      field: 'age', 
      question: 'چند سالتونه اگه اجازه باشه؟ (برای بهتر راهنماییتون مهمه)', 
      type: 'number',
      validation: { required: true, message: 'سن مهمه تا بتونم بهتر کمکتون کنم' },
      responseTemplates: [
        'باشه، {value} سال! سن خوبیه برای شروع یه برنامه جدید 🚀',
        '{value} سالگی؟ عالیه! یه سن مناسب برای تغییر 💪',
        'پرفکت! {value} سال سن مناسبی برای قدم‌های جدید 🌟',
        'خوب! {value} سالگی بهترین زمان برای چالش‌های جدیده 🎯'
      ]
    },
    { 
      field: 'email', 
      question: 'ایمیلتون رو بدید تا بتونم جزئیات مشاوره رو براتون ایمیل کنم:', 
      type: 'email',
      validation: { required: true, type: 'email', message: 'یه ایمیل درست بدید لطفاً' },
      responseTemplates: [
        'ایمیلتون رو یادداشت کردم 📧',
        'پرفکت! ایمیل ذخیره شد ✅',
        'عالی، ایمیلتون رو دارم 📩',
        'ممنونم، ایمیل ثبت شد 💌'
      ]
    },
    { 
      field: 'mobile', 
      question: 'شماره موبایلتون رو هم بدید تا در صورت نیاز تماس بگیرم:', 
      type: 'tel',
      validation: { required: true, message: 'شماره موبایل ضروریه برای تماس' },
      responseTemplates: [
        'شمارتون رو ذخیره کردم 📱',
        'عالی! شماره تماس ثبت شد ☎️',
        'پرفکت، شمارتون رو دارم 📞',
        'ممنونم، شماره موبایل ذخیره شد 📲'
      ]
    },
    { 
      field: 'city', 
      question: 'تو کدوم شهر زندگی می‌کنید؟', 
      type: 'text',
      validation: { required: true, message: 'شهرتون رو بگید تا بهتر راهنماییتون کنم' },
      responseTemplates: [
        '{value}! شهر خوبیه 🏙️',
        'واو {value}! شهر قشنگی انتخاب کردید 🌆',
        '{value}؟ عالیه! اونجا فرصت‌های خوبی هست 🏘️',
        'پرفکت! {value} شهر مناسبیه 🌇'
      ]
    },
    { 
      field: 'acquainted', 
      question: 'راستی چطور ما رو پیدا کردید؟ کجا ازمون شنیدید؟', 
      options: [
        { value: 'search', label: 'جستجو' },
        { value: 'friend', label: 'معرفی دوستان و آشنایان' },
        { value: 'instagram', label: 'اینستاگرام' },
        { value: 'telegram', label: 'تلگرام' },
        { value: 'twitter', label: 'توئیتر' },
        { value: 'youtube', label: 'یوتیوب فنلاندکیو' },
        { value: 'ad', label: 'تبلیغات' },
        { value: 'چت آنلاین یا وبینار', label: 'چت آنلاین یا وبینار' },
        { value: 'فیسبوک', label: 'فیسبوک' },
        { value: 'لینکدین', label: 'لینکدین' },
        { value: 'بازاریابی تلفنی', label: 'بازاریابی تلفنی' },
        { value: 'سایر', label: 'سایر' }
      ],
      validation: { required: true, message: 'این اطلاعات خیلی مهمه برای ما' },
      responseTemplates: [
        'آها، از {value}! خوبه 👍',
        'جالبه، {value}! ممنونم 🤝',
        'عالی! از {value} پیدامون کردید 💫',
        'خوب، {value}! مرسی از اطلاع 🙏'
      ]
    },
    { 
      field: 'position', 
      question: 'عالی! حالا می‌خوام بدونم از کدام محصولات ما استفاده می‌کنید یا قصد دارید استفاده کنید؟ (می‌تونید چند مورد انتخاب کنید)', 
      options: [
        { value: 'چهار فصل (آمیس)', label: 'چهار فصل (آمیس)' },
        { value: 'high-school', label: 'دبیرستان' },
        { value: 'university', label: 'کارشناسی' },
        { value: 'master', label: 'کارشناسی ارشد' },
        { value: 'startup', label: 'استارتاپ و سرمایه‌گذاری' }
      ], 
      multiple: true,
      validation: { required: true, message: 'این اطلاعات برای ارائه بهترین خدمات ضروریه' },
      responseTemplates: [
        'عالی! پس به {value} علاقه‌مندید. می‌تونم کاملاً راهنماییتون کنم 🎯',
        'پرفکت! {value} انتخاب فوق‌العاده‌ای بوده. بهترین مشاوره رو براتون آماده می‌کنم 💪',
        'خیلی خوب! {value} گزینه‌های عالی‌ن. فرصت‌های فوق‌العاده‌ای پیش رویتونه 🌟',
        'عالیه! {value} درست انتخاب کردید. این محصولات آینده درخشانی براتون رقم می‌زنه 🚀'
      ]
    },
    { 
      field: 'message', 
      question: 'آخرین سوال: اگه چیز خاصی هست که می‌خواید بگید یا سوال خاصی دارید، اینجا بنویسید (اختیاری):', 
      type: 'textarea',
      validation: { required: false },
      responseTemplates: [
        'ممنونم که وقت گذاشتید و کاملش کردید! 🙏',
        'عالی! حالا همه اطلاعات رو دارم 🎉',
        'پرفکت! همه چی آماده شد ✨',
        'خیلی ممنونم! اطلاعات کامل شد 💯'
      ]
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

  // Check if response contains consultation request
  const checkForConsultationRequest = (response: string) => {
    const consultationKeywords = [
      '[COPILOT_ACTION:CONSULTATION_REQUEST]',
      'مشاوره می‌خوام',

    ];
    
    return consultationKeywords.some(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Send message
  const sendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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

        // Check if response suggests consultation
        if (checkForConsultationRequest(data.answer)) {
          setTimeout(() => {
            // اگر پاسخ شامل درخواست مشاوره است، فرم مشاوره را باز کن
            if (!isInConsultationMode) {
              startConsultation();
            }
          }, 1000);
        }
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
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'user',
          content: Array.isArray(answer) ? answer.join(', ') : answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setTimeout(() => {
          const firstRealQuestion: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: `❌ ${validation.errorMessage}\n\nلطفاً دوباره پاسخ دهید:`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // ذخیره پاسخ
    const fieldName = currentQuestion.field as keyof ConsultationFormData;
    const newConsultationData = {
      ...consultationData,
      [fieldName]: Array.isArray(answer) ? answer : answer
    };
    setConsultationData(newConsultationData);

    // اضافه کردن پیام کاربر
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: Array.isArray(answer) ? answer.join(', ') : answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // بررسی اینکه آیا آخرین سوال بود
    if (consultationStep === consultationQuestions.length - 1) {
      // ارسال درخواست
      setTimeout(() => {
        // تولید خلاصه گفتگو و تحلیل فروش
        const conversationSummary = generateConversationSummary();
        const salesAnalysis = generateSalesAnalysis();
        
        // ذخیره تحلیل‌ها در consultationData
        setConsultationData(prev => ({
          ...prev,
          conversation_summary: conversationSummary,
          sales_analysis: salesAnalysis,
          source:"chat"
        }));
        
        // ایجاد خلاصه اطلاعات
        const summaryText = `عالی! همه اطلاعات رو گرفتم. این اطلاعات هم بده که برای همکارم بفرستم که با شما تماس بگیره:\n\n📝 **خلاصه اطلاعات شما:**\n• نام: ${newConsultationData.salutationtype} ${newConsultationData.first_name} ${newConsultationData.last_name}\n• سن: ${newConsultationData.age} سال\n• شهر: ${newConsultationData.city}\n• ایمیل: ${newConsultationData.email}\n• موبایل: ${newConsultationData.mobile}\n• آشنایی: ${newConsultationData.acquainted}\n• محصولات مورد علاقه: ${Array.isArray(newConsultationData.position) ? newConsultationData.position.join(', ') : newConsultationData.position}\n${newConsultationData.message ? `• پیام اضافی: ${newConsultationData.message}` : ''}\n\nدر حال ارسال درخواست مشاوره...`;
        
        const processingMessage: Message = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: summaryText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, processingMessage]);
        
        // کمی صبر کنیم تا consultationData آپدیت شود
        setTimeout(() => {
          submitConsultation(conversationSummary, salesAnalysis);
        }, 100);
      }, 1000);
    } else {
      // سوال بعدی با پاسخ شخصی‌سازی شده
      setTimeout(() => {
        const nextQuestion = consultationQuestions[consultationStep + 1];
        
        // تولید پاسخ شخصی‌سازی شده
        let personalizedResponse = '';
        if (currentQuestion.responseTemplates && currentQuestion.responseTemplates.length > 0) {
          const randomTemplate = currentQuestion.responseTemplates[Math.floor(Math.random() * currentQuestion.responseTemplates.length)];
          
          // جایگزینی متغیرها در template
          personalizedResponse = randomTemplate
            .replace('{value}', Array.isArray(answer) ? answer.join(', ') : answer)
            .replace('{salutationtype}', newConsultationData.salutationtype || '')
            .replace('{first_name}', newConsultationData.first_name || '')
            .replace('{last_name}', newConsultationData.last_name || '');
        }

        // اضافه کردن پاسخ شخصی‌سازی شده
        if (personalizedResponse) {
          const responseMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: personalizedResponse,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, responseMessage]);
        }

        // اضافه کردن سوال بعدی
        setTimeout(() => {
          const nextQuestionMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: nextQuestion.question,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextQuestionMessage]);
          setConsultationStep(consultationStep + 1);
        }, 1000);
      }, 800);
    }
  };

  // تولید خلاصه گفتگو
  const generateConversationSummary = () => {
    const userMessages = messages.filter(m => m.type === 'user');
    const keywords = extractKeywords(userMessages.map(m => m.content).join(' '));
    
    let summary = '🎯 **خلاصه گفتگو:**\n';
    
    // تحلیل موضوعات اصلی
    const topics = analyzeTopics(userMessages);
    if (topics.length > 0) {
      summary += `• موضوعات پرسیده شده: ${topics.join(', ')}\n`;
    }
    
    // تحلیل نیازها
    const needs = analyzeNeeds(userMessages);
    if (needs.length > 0) {
      summary += `• نیازهای کاربر: ${needs.join(', ')}\n`;
    }
    
    // کلمات کلیدی مهم
    if (keywords.length > 0) {
      summary += `• کلمات کلیدی: ${keywords.slice(0, 5).join(', ')}\n`;
    }
    
    return summary;
  };

  // تولید تحلیل فروش
  const generateSalesAnalysis = () => {
    const userMessages = messages.filter(m => m.type === 'user');
    const allUserText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    let analysis = '📊 **تحلیل فروش برای تیم مارکتینگ:**\n';
    
    // تحلیل سطح علاقه
    const interestLevel = calculateInterestLevel(allUserText);
    analysis += `• سطح علاقه: ${interestLevel}\n`;
    
    // تحلیل عجله خرید
    const urgency = calculateUrgency(allUserText);
    analysis += `• فوریت خرید: ${urgency}\n`;
    
    // نقاط قوت برای فروش
    const salesPoints = identifySalesPoints();
    if (salesPoints.length > 0) {
      analysis += `• نقاط قوت فروش: ${salesPoints.join(', ')}\n`;
    }
    
    // پیشنهادات مارکتینگ
    const marketingTips = generateMarketingTips();
    if (marketingTips.length > 0) {
      analysis += `• پیشنهادات: ${marketingTips.join(', ')}\n`;
    }
    
    return analysis;
  };

  // توابع کمکی
  const extractKeywords = (text: string) => {
    const keywords = ['مهاجرت', 'تحصیل', 'کار', 'فنلاند', 'ویزا', 'دانشگاه', 'زندگی', 'اقامت', 'سرمایه', 'استارتاپ'];
    return keywords.filter(keyword => text.toLowerCase().includes(keyword));
  };

  const analyzeTopics = (userMessages: Message[]) => {
    const topics = [];
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('تحصیل') || allText.includes('دانشگاه') || allText.includes('مدرک')) topics.push('تحصیل');
    if (allText.includes('کار') || allText.includes('شغل') || allText.includes('استخدام')) topics.push('کاریابی');
    if (allText.includes('مهاجرت') || allText.includes('اقامت') || allText.includes('ویزا')) topics.push('مهاجرت');
    if (allText.includes('سرمایه') || allText.includes('استارتاپ') || allText.includes('کسب‌وکار')) topics.push('سرمایه‌گذاری');
    
    return topics;
  };

  const analyzeNeeds = (userMessages: Message[]) => {
    const needs = [];
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('راهنمایی') || allText.includes('کمک') || allText.includes('مشاوره')) needs.push('راهنمایی تخصصی');
    if (allText.includes('سریع') || allText.includes('فوری') || allText.includes('زود')) needs.push('خدمات سریع');
    if (allText.includes('ارزان') || allText.includes('قیمت') || allText.includes('هزینه')) needs.push('قیمت مناسب');
    
    return needs;
  };

  const calculateInterestLevel = (text: string) => {
    let score = 0;
    if (text.includes('خیلی علاقه') || text.includes('حتماً می‌خوام')) score += 3;
    if (text.includes('علاقه‌مند') || text.includes('مشاوره می‌خوام')) score += 2;
    if (text.includes('سوال دارم') || text.includes('بگید')) score += 1;
    
    if (score >= 3) return 'بسیار بالا 🔥';
    if (score >= 2) return 'بالا ⭐';
    return 'متوسط 📝';
  };

  const calculateUrgency = (text: string) => {
    if (text.includes('فوری') || text.includes('سریع') || text.includes('امسال')) return 'فوری ⚡';
    if (text.includes('زودتر') || text.includes('سال آینده')) return 'متوسط ⏰';
    return 'بلندمدت 📅';
  };

  const identifySalesPoints = () => {
    const points = [];
    const data = consultationData;
    
    if (data.age && parseInt(data.age) < 30) points.push('سن مناسب برای مهاجرت');
    const positions = Array.isArray(data.position) ? data.position : (data.position ? [data.position] : []);
    const positionStr = positions.join(',');
    if (positionStr.includes('master') || positionStr.includes('startup')) {
      points.push('هدف‌گذاری بلندپروازانه');
    }
    if (positionStr.includes('چهار فصل (آمیس)')) {
      points.push('علاقه‌مند به برنامه پرطرفدار');
    }
    if (positionStr.includes('university') || positionStr.includes('high-school')) {
      points.push('تمرکز روی تحصیل');
    }
    if (data.city === 'تهران' || data.city === 'اصفهان') points.push('شهر بزرگ - دسترسی آسان');
    if (data.acquainted === 'instagram' || data.acquainted === 'telegram') points.push('فعال در شبکه‌های اجتماعی');
    
    return points;
  };

  const generateMarketingTips = () => {
    const tips = [];
    const data = consultationData;
    
    if (data.age && parseInt(data.age) < 25) tips.push('تأکید روی فرصت‌های تحصیلی');
    if (data.age && parseInt(data.age) > 30) tips.push('تأکید روی فرصت‌های کاری');
    if (data.acquainted === 'instagram') tips.push('ارسال محتوای visual');
    const positions = Array.isArray(data.position) ? data.position : (data.position ? [data.position] : []);
    const positionStr = positions.join(',');
    if (positionStr.includes('high-school')) {
      tips.push('معرفی دوره‌های آمادگی');
    }
    if (positionStr.includes('startup')) {
      tips.push('تأکید روی فرصت‌های کارآفرینی');
    }
    if (positionStr.includes('چهار فصل')) {
      tips.push('ارسال اطلاعات کامل برنامه آمیس');
    }
    
    return tips;
  };

  const submitConsultation = async (conversationSummary?: string, salesAnalysis?: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://requestapi.finlandq.com/api/request/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salutationtype: consultationData.salutationtype || '',
          first_name: consultationData.first_name || '',
          last_name: consultationData.last_name || '',
          age: consultationData.age || '',
          email: consultationData.email || '',
          mobile: consultationData.mobile || '',
          city: consultationData.city || '',
          acquainted: consultationData.acquainted || '',
          position: Array.isArray(consultationData.position) ? consultationData.position : [consultationData.position].filter(Boolean),
          message: consultationData.message || '',
          conversation_summary: conversationSummary || consultationData.conversation_summary || '',
          sales_analysis: salesAnalysis || consultationData.sales_analysis || '',
          source: consultationData.source || 'chat'
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.code) {
        const successMessage: Message = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assistant',
          content: `🎉 واای عالی ${consultationData.salutationtype} ${consultationData.first_name}!\n\n✅ درخواستتون با موفقیت ثبت شد و همین الان به تیم ما رسید!\n\nدوستان ما تا 24 ساعت آینده باهاتون تماس می‌گیرن و مشاوره کاملتون رو می‌دن. نگران نباشید، حتماً بهتون زنگ می‌زنیم! 😊\n\n📋 کد پیگیری شما: ${result.data.code}\n\n📞 اگه عجله دارید: 91691021\n\nممنونم که به ما اعتماد کردید! 🙏`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // اضافه کردن دکمه شروع مجدد
        setTimeout(() => {
          const restartMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: 'راستی اگه دوست یا آشنایی دارید که نیاز به مشاوره داره، خوشحال میشم کمکش کنم! فقط "مشاوره می‌خوام" بگید تا دوباره شروع کنیم 😊',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, restartMessage]);
        }, 2000);
      } else {
        throw new Error('خطا در ثبت درخواست');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: 'اوه نه! 😔 یه مشکل فنی پیش اومده و نتونستم درخواستتون رو ثبت کنم.\n\nلطفاً دوباره تلاش کنید یا مستقیماً با شماره 91691021 تماس بگیرید تا دوستان ما راهنماییتون کنن.\n\nمعذرت می‌خوام بابت این مشکل! 🙏',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsInConsultationMode(false);
      setConsultationStep(0);
      setConsultationData({});
    }
  };

  const startConsultation = () => {
    setIsInConsultationMode(true);
    setConsultationStep(-1);
    setConsultationData({});
    
    const welcomeMessage: Message = {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'assistant',
      content: '🎯 درخواست مشاوره شما دریافت شد!\n\nبرای شروع من چند تا اطلاعات شما نیاز دارم که بهتر بتونم راهنماییتون کنم. اوکی هستید؟',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
  };

  const startNewChat = () => {
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
  };

  const showHelp = () => {
    const helpMessage: Message = {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'assistant',
      content: `🎯 **راهنمای استفاده از فنلاند کیو:**\n\n💬 **چت عادی:**\n• هر سوالی در مورد مهاجرت، تحصیل یا کار در فنلاند دارید بپرسید\n• من با اطلاعات به‌روز و دقیق کمکتون می‌کنم\n\n📋 **درخواست مشاوره:**\n• فقط بنویسید "مشاوره می‌خوام"\n• فرم کامل مشاوره برایتان باز می‌شود\n• کارشناسان ما تا 24 ساعت با شما تماس می‌گیرند\n\n🔍 **موضوعات پوشش داده شده:**\n• مهاجرت به فنلاند\n• تحصیل در دانشگاه‌های فنلاند\n• کار و اشتغال\n• ویزا و اقامت\n• زندگی در فنلاند\n• سرمایه‌گذاری و استارتاپ\n\n📞 **تماس مستقیم:** 91691021\n\nآماده‌ام کمکتون کنم! 😊`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, helpMessage]);
  };

  const requestConsultation = () => {
    startConsultation();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50" dir="rtl">
            {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src="/q.png" alt="FinlandQ" className="w-8 h-8" />
              <h2 className="text-lg font-semibold text-gray-900">فنلاند کیو</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" color='black' />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* New Chat Button */}
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              <span>چت جدید</span>
            </button>

            {/* Navigation Buttons */}
            <div className="space-y-2 mb-6">
              <button
                onClick={showHelp}
                className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span>راهنما</span>
              </button>
              
              <button
                onClick={requestConsultation}
                className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>درخواست مشاوره</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>کاربر</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" color='black' />
            </button>
            
            <div className="flex items-center gap-3">
              <img src="/q.png" alt="FinlandQ" className="w-8 h-8" />
              <h1 className="text-lg font-semibold text-gray-900">فنلاند کیو</h1>
            </div>

            {/* Desktop Navigation Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={startNewChat}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>چت جدید</span>
              </button>
              
              <button
                onClick={showHelp}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                <span>راهنما</span>
              </button>
              
              <button
                onClick={requestConsultation}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Users className="w-4 h-4" />
                <span>درخواست مشاوره</span>
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                آنلاین
              </div>
            </div>

            {/* Mobile Status */}
            <div className="md:hidden flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                آنلاین
              </div>
            </div>
          </div>
        </div>

        {/* Ready Prompts */}
        {messages.length === 1 && (
          <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">پرامپت‌های آماده</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyPrompts.map((prompt) => (
                <motion.button
                  key={prompt.id}
                  onClick={() => sendMessage(prompt.prompt)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 text-right border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{prompt.title}</h4>
                  <p className="text-sm text-gray-600">{prompt.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages - Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  } rounded-2xl px-4 py-3 shadow-sm`}>
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                    />
                    <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString('fa-IR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-600">در حال تایپ...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Reply Options for Consultation */}
        {isInConsultationMode && (
          <div className="border-t border-gray-100 p-4 bg-white">
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

        {/* Chat Input - Fixed at Bottom */}
        {!isInConsultationMode && (
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="پیام خود را بنویسید..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm focus:shadow-md transition-all duration-300 text-sm"
                    rows={1}
                    style={{
                      direction: 'rtl',
                      textAlign: 'right'
                    }}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-3">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Enter برای ارسال • Shift+Enter برای خط جدید
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 