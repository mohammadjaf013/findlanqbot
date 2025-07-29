
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles, Globe, Users, Star, ArrowLeft } from 'lucide-react';
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
    const optionsCount = question.options.length;
    const gridCols = question.field === 'salutationtype' ? 'grid-cols-2' : 
                     optionsCount <= 4 ? 'grid-cols-2' : 
                     optionsCount <= 6 ? 'grid-cols-2' : 'grid-cols-1';
    
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
                  ? 'bg-gradient-to-r from-[#4385f6] to-blue-600 text-white border-[#4385f6] shadow-lg'
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
            className="w-full bg-gradient-to-r from-[#4385f6] to-blue-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
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
            className="w-full resize-none rounded-xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white shadow-sm focus:shadow-md transition-all duration-300 text-sm sm:text-base"
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
            className="w-full rounded-xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white shadow-sm focus:shadow-md transition-all duration-300 text-sm sm:text-base"
            disabled={isLoading}
          />
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTextSubmit}
        disabled={!textInput.trim() || isLoading}
        className="bg-gradient-to-r from-[#4385f6] to-blue-600 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>
    </motion.div>
  );
}

// Consultation Form Component
function ConsultationFormContent({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: ConsultationFormData) => void }) {
  const [formData, setFormData] = useState<ConsultationFormData>({
    salutationtype: '',
    first_name: '',
    last_name: '',
    age: '',
    email: '',
    mobile: '',
    city: '',
    acquainted: '',
    position: [],
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ConsultationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePositionChange = (position: string) => {
    setFormData(prev => ({
      ...prev,
      position: prev.position.includes(position)
        ? prev.position.filter(p => p !== position)
        : [...prev.position, position]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const salutationOptions = ['آقای', 'خانم', 'دکتر', 'مهندس'];
  const acquaintedOptions = ['instagram', 'telegram', 'website', 'friends', 'google', 'other'];
  const positionOptions = ['university', 'work', 'startup', 'investment', 'family'];

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4385f6] to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">درخواست مشاوره</h2>
              <p className="text-sm opacity-90">اطلاعات خود را برای دریافت مشاوره تکمیل کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* نام و عنوان */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
              <select
                value={formData.salutationtype}
                onChange={(e) => handleInputChange('salutationtype', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
                required
              >
                <option value="">انتخاب کنید</option>
                {salutationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
                required
              />
            </div>
          </div>

          {/* سن و شهر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سن</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شهر</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
                required
              />
            </div>
          </div>

          {/* ایمیل و موبایل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">موبایل</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
                required
              />
            </div>
          </div>

          {/* نحوه آشنایی */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">از کجا با ما آشنا شدید؟</label>
            <select
              value={formData.acquainted}
              onChange={(e) => handleInputChange('acquainted', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white"
              required
            >
              <option value="">انتخاب کنید</option>
              {acquaintedOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'instagram' ? 'اینستاگرام' :
                   option === 'telegram' ? 'تلگرام' :
                   option === 'website' ? 'وبسایت' :
                   option === 'friends' ? 'دوستان' :
                   option === 'google' ? 'گوگل' : 'سایر'}
                </option>
              ))}
            </select>
          </div>

          {/* موقعیت */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">موقعیت مورد نظر (می‌توانید چند مورد انتخاب کنید)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {positionOptions.map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.position.includes(option)}
                    onChange={() => handlePositionChange(option)}
                    className="w-4 h-4 text-[#4385f6] border-gray-300 rounded focus:ring-[#4385f6]"
                  />
                  <span className="text-sm text-gray-700">
                    {option === 'university' ? 'تحصیل' :
                     option === 'work' ? 'کار' :
                     option === 'startup' ? 'استارتاپ' :
                     option === 'investment' ? 'سرمایه‌گذاری' : 'خانواده'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* پیام */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">پیام شما</label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent resize-none bg-white"
              placeholder="توضیحات تکمیلی در مورد درخواست خود..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#4385f6] to-blue-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ارسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  ارسال درخواست
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// تابع برای تبدیل markdown ساده به HTML
const parseMarkdown = (text: string) => {
  let result = text;
  
  // تبدیل **متن** به <strong>متن</strong>
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // تبدیل *متن* به <em>متن</em>
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // تبدیل \n به <br>
  result = result.replace(/\n/g, '<br>');
  
  // تبدیل لینک‌ها [متن](url) به <a href="url">متن</a>
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
  
  return result;
};

export default function FinlandQPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'سلام! من دستیار هوشمند فنلاند کیو هستم. برای راهنمایی در مورد مهاجرت، تحصیل و کار در فنلاند آماده‌ام.\n\n💡 **نکته:** اگر نیاز به مشاوره دارید، فقط کافیه بنویسید "مشاوره می‌خوام" یا "نیاز به راهنمایی دارم" و من خودکار فرم مشاوره را برایتان باز می‌کنم!\n\nچطور می‌تونم کمکتون کنم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to detect consultation request
  const isConsultationRequest = (message: string): boolean => {
    const consultationKeywords = [
      // Persian consultation terms
      'مشاوره', 'مشورت', 'راهنمایی', 'کمک', 'مساعدت', 'یاری',
      'مشاور', 'متخصص', 'expert', 'استاد', 'معلم', 'استادکار',
      'consultation', 'consult', 'advice', 'help', 'guidance', 'assist',
      
      // Contact and meeting terms
      'تماس', 'call', 'صحبت', 'گفتگو', 'ملاقات', 'meeting', 'جلسه',
      'برقراری تماس', 'در ارتباط', 'ارتباط',
      
      // Request patterns
      'درخواست مشاوره', 'نیاز به مشاوره', 'می‌خوام مشاوره', 'میخوام مشاوره',
      'مشاوره میخوام', 'مشاوره می‌خوام', 'نیاز دارم', 'احتیاج دارم',
      'کمک کنید', 'کمکم کنید', 'یاری کنید', 'راهنماییم کنید',
      
      // Question patterns that indicate consultation need
      'چطور', 'چگونه', 'how to', 'how can', 'what should',
      'باید چکار', 'چه کاری', 'چه کنم', 'چکار کنم',
      
      // Personal consultation indicators
      'مشکل دارم', 'سوال دارم', 'مسئله دارم', 'معضل دارم',
      'نمیدونم', 'نمی‌دانم', 'confused', 'stuck'
    ];
    
    const lowerMessage = message.toLowerCase().trim();
    
    // Direct keyword matching
    const hasKeyword = consultationKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    // Pattern matching for consultation requests
    const consultationPatterns = [
      /می.*خوا.*مشاوره/,
      /نیاز.*مشاوره/,
      /درخواست.*مشاوره/,
      /مشاوره.*می.*خوا/,
      /کمک.*می.*خوا/,
      /راهنمایی.*می.*خوا/,
      /چطور.*باید/,
      /چه.*کنم/,
      /چکار.*کنم/
    ];
    
    const hasPattern = consultationPatterns.some(pattern => 
      pattern.test(lowerMessage)
    );
    
    return hasKeyword || hasPattern;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Check if user is requesting consultation
    if (isConsultationRequest(currentInput)) {
      setIsLoading(false);
      
      // شروع streaming برای پیام مشاوره
      simulateStreaming('🎯 درخواست مشاوره شما دریافت شد! من الان فرم مشاوره را برای شما باز می‌کنم تا بتوانیم بهترین خدمات را ارائه دهیم.');
      
      // Start consultation mode automatically
      setTimeout(() => {
        setIsInConsultationMode(true);
        setConsultationStep(-1);
        setConsultationData({});
        
        setTimeout(() => {
          simulateStreaming('برای شروع من چند تا اطلاعات شما نیاز دارم که بهتر بتونم راهنماییتون کنم. اوکی هستید؟');
        }, 1500);
      }, 2000);
      
      return;
    }

    try {
      const response = await fetch('https://bot-api.finlandq.com/api/rag/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // استفاده از streaming به جای نمایش مستقیم
        setIsLoading(false);
        simulateStreaming(data.answer);
      } else {
        throw new Error(data.error || 'خطا در دریافت پاسخ');
      }
    } catch (error) {
      setIsLoading(false);
      simulateStreaming('متأسفم، خطایی رخ داده است. برای اطلاعات تکمیلی با پشتیبانی شماره 91691021 تماس بگیرید.');
    }
  };



  // تابع شبیه‌سازی streaming (تایپ کردن تدریجی)
  const simulateStreaming = (text: string) => {
    setIsStreaming(true);
    setStreamingMessage('');
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setStreamingMessage(prev => prev + text[index]);
        index++;
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        
        // اضافه کردن پیام نهایی به لیست
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: text,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setStreamingMessage('');
      }
    }, 30); // سرعت تایپ (30ms بین هر کاراکتر)
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };



  const [consultationStep, setConsultationStep] = useState(-1);
  const [consultationData, setConsultationData] = useState<Partial<ConsultationFormData>>({});
  const [isInConsultationMode, setIsInConsultationMode] = useState(false);

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
            clarificationContent = 'متوجه شدم! اگر آماده هستید که سوالات رو جواب بدید، فقط "بله" یا "آماده‌ام" بگید تا شروع کنیم 😊';
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
    
    const currentQuestion = consultationQuestions[consultationStep];
    
    // اعتبارسنجی پاسخ
    const validation = validateAnswer(currentQuestion, answer);
    if (!validation.isValid) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ ${validation.errorMessage}\n\nلطفاً مجدداً پاسخ دهید:\n${currentQuestion.question}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // ذخیره پاسخ کاربر
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: Array.isArray(answer) ? answer.join(', ') : answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // ذخیره در دیتا
    const newData = {
      ...consultationData,
      [currentQuestion.field]: currentQuestion.field === 'position' && !Array.isArray(answer) 
        ? [answer] 
        : answer
    };
    setConsultationData(newData);

    // ایجاد پاسخ دوستانه
    setTimeout(() => {
      if (currentQuestion.responseTemplates && currentQuestion.responseTemplates.length > 0) {
        // انتخاب رندوم از template ها
        const randomIndex = Math.floor(Math.random() * currentQuestion.responseTemplates.length);
        let responseText = currentQuestion.responseTemplates[randomIndex];
        
        // جایگزینی متغیرها در template
        // ابتدا جایگزین کردن {value} با پاسخ فعلی
        responseText = responseText.replace(
          /\{value\}/g, 
          Array.isArray(answer) ? answer.join(', ') : String(answer)
        );
        
        // سپس جایگزین کردن بقیه متغیرها
        Object.keys(newData).forEach(key => {
          const value = newData[key as keyof typeof newData];
          if (value) {
            responseText = responseText.replace(
              new RegExp(`\\{${key}\\}`, 'g'), 
              Array.isArray(value) ? value.join(', ') : String(value)
            );
          }
        });
        
        const responseMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMessage]);
      }

      // سوال بعدی یا ارسال
      if (consultationStep < consultationQuestions.length - 1) {
        setTimeout(() => {
          const nextQuestion = consultationQuestions[consultationStep + 1];
          const nextMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: nextQuestion.question,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextMessage]);
          setConsultationStep(prev => prev + 1);
        }, 1000);
      } else {
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
          const summaryText = `عالی! همه اطلاعات رو گرفتم. این اطلاعات هم بده که برای همکارم بفرستم که با شما تماس بگیره:\n\n📝 **خلاصه اطلاعات شما:**\n• نام: ${newData.salutationtype} ${newData.first_name} ${newData.last_name}\n• سن: ${newData.age} سال\n• شهر: ${newData.city}\n• ایمیل: ${newData.email}\n• موبایل: ${newData.mobile}\n• آشنایی: ${newData.acquainted}\n• محصولات مورد علاقه: ${Array.isArray(newData.position) ? newData.position.join(', ') : newData.position}\n${newData.message ? `• پیام اضافی: ${newData.message}` : ''}\n\nدر حال ارسال درخواست مشاوره...`;
          
          const processingMessage: Message = {
            id: Date.now().toString(),
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
      }
    }, 800);
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
          id: Date.now().toString(),
          type: 'assistant',
          content: `🎉 واای عالی ${consultationData.salutationtype} ${consultationData.first_name}!\n\n✅ درخواستتون با موفقیت ثبت شد و همین الان به تیم ما رسید!\n\nدوستان ما تا 24 ساعت آینده باهاتون تماس می‌گیرن و مشاوره کاملتون رو می‌دن. نگران نباشید، حتماً بهتون زنگ می‌زنیم! 😊\n\n📋 کد پیگیری شما: ${result.data.code}\n\n📞 اگه عجله دارید: 91691021\n\nممنونم که به ما اعتماد کردید! 🙏`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // اضافه کردن دکمه شروع مجدد
        setTimeout(() => {
          const restartMessage: Message = {
            id: Date.now().toString(),
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
        id: Date.now().toString(),
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

  const handleConsultationSubmit = async (data: ConsultationFormData) => {
    // برای فرم modal (اگر نیاز باشد)
    console.log('Form Data:', data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir="rtl">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-[#4385f6] to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6 text-white" />
                  
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4385f6] to-blue-600 bg-clip-text text-transparent">
                    فنلاند کیو
                  </h1>
                  <p className="text-sm text-gray-600">دستیار هوشمند مهاجرت به فنلاند</p>
                </div>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">آنلاین</span>
              </div>
              <div className="text-sm text-gray-600">پشتیبانی: 91691021</div>
              <Link 
                href="/" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4385f6] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                برگشت
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1 order-2 lg:order-1"
          >
            <div className="space-y-4 lg:space-y-6">
              
              {/* Consultation Request */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#4385f6]" />
                  درخواست مشاوره
                </h3>
                <button
                  onClick={startConsultation}
                  disabled={isInConsultationMode || isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  {isInConsultationMode ? 'در حال مشاوره...' : 'درخواست مشاوره رایگان'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  مشاوره تخصصی برای مهاجرت به فنلاند
                </p>
                {!isInConsultationMode && (
                  <button
                    onClick={() => {
                      setMessages(prev => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          type: 'user',
                          content: 'بله، درخواست مشاوره جدید',
                          timestamp: new Date()
                        }
                      ]);
                      setTimeout(() => startConsultation(), 500);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
                  >
                    شروع مشاوره جدید
                  </button>
                )}
              </div>



              {/* Info Card */}
              <div className="bg-gradient-to-r from-[#4385f6] to-blue-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  راهنمای استفاده
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>برای سوالات عمومی از چت استفاده کنید</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>برای مشاوره فقط بنویسید "مشاوره می‌خوام" یا روی دکمه کلیک کنید</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>سیستم هوشمند درخواست‌های مشاوره را تشخیص می‌دهد</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/20">
                    <span>تعداد پیام‌ها:</span>
                    <span className="font-bold">{messages.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>وضعیت:</span>
                    <span className="font-bold text-green-200">آنلاین</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 order-1 lg:order-2"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-blue-100 h-[60vh] sm:h-[70vh] flex flex-col overflow-hidden">
              
              {/* Chat Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-[#4385f6] to-blue-600 p-3 sm:p-4 text-white"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div 
                    // animate={{ rotate: 360 }}
                    // transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 sm:w-10 sm:h-10 bg-white/60 rounded-full flex items-center justify-center"
                  >
                    {/* <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /> */}

                    <img src="q.png" className='w-full h-full object-contain text-white' />

                  </motion.div>
                  <div>
                    <h2 className="font-semibold text-sm sm:text-base">چت با دستیار فنلاند کیو</h2>
                    <p className="text-xs opacity-90 hidden sm:block">آماده پاسخگویی به سوالات شما</p>
                  </div>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[85%] sm:max-w-[80%] ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-[#4385f6] to-blue-600 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 shadow-md'
                        } rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300`}
                      >
                        <p 
                          className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                        ></p>
                        <p className={`text-xs mt-1 sm:mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('fa-IR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </motion.div>
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
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#4385f6] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#4385f6] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-[#4385f6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">در حال تایپ...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Streaming message */}
                {isStreaming && streamingMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex justify-start"
                  >
                    <motion.div className="max-w-[85%] sm:max-w-[80%] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 shadow-md rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300">
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        <span dangerouslySetInnerHTML={{ __html: parseMarkdown(streamingMessage) }}></span>
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-2 h-4 bg-[#4385f6] ml-1"
                        >
                          |
                        </motion.span>
                      </p>
                    </motion.div>
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

              {/* Input */}
              {!isInConsultationMode && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="border-t border-gray-100 p-2 sm:p-4"
                >
                  <div className="flex gap-2 sm:gap-3">
                    <div className="flex-1 relative">
                      <motion.textarea
                        whileFocus={{ scale: 1.02 }}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="سوال خود را بپرسید..."
                        className="w-full resize-none rounded-xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent bg-white shadow-sm focus:shadow-md transition-all duration-300 text-sm sm:text-base"
                        rows={1}
                        disabled={isLoading}
                      />
                      <Sparkles className="absolute right-2 sm:right-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-[#4385f6]" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-[#4385f6] to-blue-600 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>


    </div>
  );
}