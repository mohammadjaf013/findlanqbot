
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
        <div className={`grid ${gridCols} gap-2`}>
          {question.options.map((option: any) => (
            <button
              key={typeof option === 'string' ? option : option.value}
              onClick={() => handleOptionClick(typeof option === 'string' ? option : option.value)}
              disabled={isLoading}
              className="text-right p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {typeof option === 'string' ? option : option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // چند گزینه‌ای
  if (question.options && question.multiple) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {question.options.map((option: any) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              disabled={isLoading}
              className={`text-right p-3 border rounded-lg transition-colors disabled:opacity-50 ${
                selectedOptions.includes(option.value)
                  ? 'bg-[#4385f6] text-white border-[#4385f6]'
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
              }`}
            >
              {option.label}
            </button>
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
    <div className="flex gap-3">
      <div className="flex-1 relative">
        {question.type === 'textarea' ? (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="پاسخ خود را بنویسید..."
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />
        ) : (
          <input
            type={question.type || 'text'}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="پاسخ خود را بنویسید..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
            disabled={isLoading}
          />
        )}
      </div>
      <button
        onClick={handleTextSubmit}
        disabled={!textInput.trim() || isLoading}
        className="bg-gradient-to-r from-[#4385f6] to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شهر</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">موبایل</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
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
                  <span className="text-sm">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent resize-none"
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

export default function FinlandQPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'سلام! من دستیار هوشمند فنلاند کیو هستم. برای راهنمایی در مورد مهاجرت، تحصیل و کار در فنلاند آماده‌ام. چطور می‌تونم کمکتون کنم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://laughing-space-umbrella-q7xwqx9rpqcx9g9-3001.app.github.dev/api/rag/ask', {
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
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'خطا در دریافت پاسخ');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'متأسفم، خطایی رخ داده است. برای اطلاعات تکمیلی با پشتیبانی شماره 88888888 تماس بگیرید.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const [consultationStep, setConsultationStep] = useState(0);
  const [consultationData, setConsultationData] = useState<Partial<ConsultationFormData>>({});
  const [isInConsultationMode, setIsInConsultationMode] = useState(false);

  const consultationQuestions = [
    { 
      field: 'salutationtype', 
      question: 'لطفاً عنوان خود را انتخاب کنید:', 
      options: ['آقای', 'خانم', 'دکتر', 'استاد'],
      validation: { required: true, message: 'عنوان الزامی است' }
    },
    { 
      field: 'first_name', 
      question: 'نام شما چیست؟', 
      type: 'text',
      validation: { required: true, message: 'نام الزامی است' }
    },
    { 
      field: 'last_name', 
      question: 'نام خانوادگی شما چیست؟', 
      type: 'text',
      validation: { required: true, message: 'نام خانوادگی الزامی است' }
    },
    { 
      field: 'age', 
      question: 'سن شما چند سال است؟', 
      type: 'number',
      validation: { required: true, message: 'سن الزامی است' }
    },
    { 
      field: 'email', 
      question: 'آدرس ایمیل شما چیست؟', 
      type: 'email',
      validation: { required: true, type: 'email', message: 'ایمیل معتبر الزامی است' }
    },
    { 
      field: 'mobile', 
      question: 'شماره موبایل شما چیست؟', 
      type: 'tel',
      validation: { required: true, message: 'شماره موبایل الزامی است' }
    },
    { 
      field: 'city', 
      question: 'در کدام شهر زندگی می‌کنید؟', 
      type: 'text',
      validation: { required: true, message: 'شهر الزامی است' }
    },
    { 
      field: 'acquainted', 
      question: 'از کجا با فنلاند کیو آشنا شدید؟', 
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
      validation: { required: true, message: 'نحوه آشنایی الزامی است' }
    },
    { 
      field: 'position', 
      question: 'برای کدام موقعیت درخواست مشاوره دارید؟ (می‌توانید چند مورد انتخاب کنید)', 
      options: [
        { value: 'چهار فصل (آمیس)', label: 'چهار فصل (آمیس)' },
        { value: 'high-school', label: 'دبیرستان' },
        { value: 'university', label: 'کارشناسی' },
        { value: 'master', label: 'کارشناسی ارشد' },
        { value: 'startup', label: 'استارتاپ و سرمایه‌گذاری' }
      ], 
      multiple: true,
      validation: { required: true, message: 'موقعیت مورد نظر الزامی است' }
    },
    { 
      field: 'message', 
      question: 'توضیحات تکمیلی در مورد درخواست خود را بنویسید:', 
      type: 'textarea',
      validation: { required: false }
    }
  ];

  const startConsultation = () => {
    setIsInConsultationMode(true);
    setConsultationStep(0);
    setConsultationData({});
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'سلام! برای درخواست مشاوره رایگان، چند سوال از شما می‌پرسم. آماده‌اید؟\n\n' + consultationQuestions[0].question,
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
    setConsultationData(prev => ({
      ...prev,
      [currentQuestion.field]: currentQuestion.field === 'position' && !Array.isArray(answer) 
        ? [answer] 
        : answer
    }));

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
      }, 500);
    } else {
      // ارسال درخواست
      setTimeout(() => {
        const processingMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: 'ممنون از صبر شما! در حال ارسال درخواست مشاوره...',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, processingMessage]);
        submitConsultation();
      }, 500);
    }
  };

  const submitConsultation = async () => {
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
          message: consultationData.message || ''
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.code) {
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `🎉 ${consultationData.salutationtype} ${consultationData.first_name} ${consultationData.last_name} عزیز\n\n✅ درخواست شما با موفقیت ثبت شد.\n\nهمکاران ما 24 الی 48 ساعت آینده با شما تماس خواهند گرفت.\nبا تشکر از همراهی شما.\n\n📋 کد پیگیری شما:\n${result.data.code}\n\n📞 برای پیگیری: 88888888`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // اضافه کردن دکمه شروع مجدد
        setTimeout(() => {
          const restartMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: 'آیا می‌خواهید درخواست مشاوره جدیدی ثبت کنید؟',
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
        content: 'متأسفم، خطایی در ثبت درخواست رخ داده است. لطفاً مجدداً تلاش کنید یا با شماره 88888888 تماس بگیرید.',
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
              <div className="text-sm text-gray-600">پشتیبانی: 88888888</div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="space-y-6">
              
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
                    <span>برای مشاوره رایگان دکمه درخواست مشاوره را بزنید</span>
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
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 h-[70vh] flex flex-col overflow-hidden">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#4385f6] to-blue-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">چت با دستیار فنلاند کیو</h2>
                    <p className="text-xs opacity-90">آماده پاسخگویی به سوالات شما</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-[#4385f6] to-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      } rounded-2xl px-4 py-3 shadow-sm`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('fa-IR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#4385f6] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#4385f6] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-[#4385f6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">در حال تایپ...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Options for Consultation */}
              {isInConsultationMode && consultationStep < consultationQuestions.length && (
                <div className="border-t border-gray-100 p-4">
                  <QuickReplyOptions 
                    question={consultationQuestions[consultationStep]}
                    onSelect={handleConsultationAnswer}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Input */}
              {!isInConsultationMode && (
                <div className="border-t border-gray-100 p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="سوال خود را بپرسید..."
                        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#4385f6] focus:border-transparent"
                        rows={1}
                        disabled={isLoading}
                      />
                      <Sparkles className="absolute right-3 top-3 w-5 h-5 text-[#4385f6]" />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-[#4385f6] to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>


    </div>
  );
}