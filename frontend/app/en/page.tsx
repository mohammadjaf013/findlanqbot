'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Sparkles, Globe, Users, ArrowLeft, HelpCircle, Crown, Shield, CheckCircle, X, Plus, Menu, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

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

// Function to convert Persian numbers to English
const convertPersianToEnglishNumbers = (text: string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
};

// Function to format summary text with proper markdown list syntax
const formatSummaryText = (text: string): string => {
  // Split the text into lines
  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    // If line starts with •, convert it to proper markdown list item
    if (line.trim().startsWith('•')) {
      return line.replace('•', '-');
    }
    return line;
  });
  
  return formattedLines.join('\n');
};

// Function to clean up table formatting
const cleanTableFormat = (content: string): string => {
  // If content contains table-like structure, try to fix common issues
  if (content.includes('|')) {
    // Check if the table is all on one line (broken format)
    if (!content.includes('\n') && content.includes('|')) {
      // Split by | and reconstruct the table properly
      const parts = content.split('|').map(part => part.trim()).filter(part => part);
      
      console.log('Found parts:', parts.length, parts);
      
      // Try to detect the actual column structure by looking at the first few parts
      // Look for patterns that suggest headers
      let columnCount = 4; // default
      if (parts.length >= 4) {
        // Check if the first 4 parts look like headers (contain emojis or specific keywords)
        const firstFour = parts.slice(0, 4);
        const hasHeaders = firstFour.some(part => 
          part.includes('✨') || part.includes('💰') || part.includes('📝') || 
          part.includes('euro') || part.includes('cost') || part.includes('description')
        );
        
        if (hasHeaders) {
          columnCount = 4;
        } else {
          // Try to detect by looking at the structure
          columnCount = Math.min(4, Math.ceil(parts.length / 10)); // Estimate based on total parts
        }
      }
      
      console.log('Detected column count:', columnCount);
      
      // Group into rows based on detected column count
      const rows = [];
      for (let i = 0; i < parts.length; i += columnCount) {
        const row = parts.slice(i, i + columnCount);
        if (row.length > 0) {
          // Pad the row to exactly columnCount columns
          while (row.length < columnCount) {
            row.push('');
          }
          rows.push('| ' + row.join(' | ') + ' |');
        }
      }
      
      // Add a header separator line if it's a new table being formed
      if (rows.length > 0) {
        const headerSeparator = '| ' + ':---'.repeat(columnCount).split('').join(' | ') + ' |';
        rows.splice(1, 0, headerSeparator);
      }

      const result = rows.join('\n');
      console.log('Reconstructed table:', result);
      return result;
    }
    
    // If the table has newlines but is still malformed
    if (content.includes('\n') && content.includes('|')) {
      const lines = content.split('\n');
      const cleanedLines = lines.map(line => {
        // Remove extra spaces around pipes and ensure proper table format
        let cleaned = line.trim();
        if (cleaned.includes('|')) {
          // Ensure the line starts and ends with |
          if (!cleaned.startsWith('|')) {
            cleaned = '| ' + cleaned;
          }
          if (!cleaned.endsWith('|')) {
            cleaned = cleaned + ' |';
          }
          // Clean up spacing around pipes
          cleaned = cleaned.replace(/\s*\|\s*/g, ' | ');
        }
        return cleaned;
      });
      return cleanedLines.join('\n');
    }
  }
  return content;
};

// Custom components for react-markdown
const MarkdownComponents = {
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-gray-300 text-left min-w-full" dir="ltr">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => <tr>{children}</tr>,
  th: ({ children }: any) => (
    <th className="px-3 py-2 border border-gray-300 font-semibold text-sm text-gray-700 whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 border border-gray-300 text-sm whitespace-nowrap">
      {children}
    </td>
  ),
  strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  p: ({ children }: any) => <p className="mb-2">{children}</p>,
  br: () => <br />,
  // List components for proper bullet point rendering
  ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 space-y-1 text-left" dir="ltr">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 space-y-1 text-left" dir="ltr">{children}</ol>,
  li: ({ children }: any) => <li className="text-left">{children}</li>,
  // Add fallback for any unrecognized elements
  code: ({ children }: any) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
  pre: ({ children }: any) => <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{children}</pre>,
  // Add fallback for any other elements
  div: ({ children }: any) => <div>{children}</div>,
  span: ({ children }: any) => <span>{children}</span>,
};

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

  // Single-choice
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

  // Multi-choice
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
            Confirm selection ({selectedOptions.length})
          </button>
        )}
      </div>
    );
  }

  // Text input
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
            placeholder="Type your answer..."
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
            onKeyDown={handleKeyPress}
            placeholder="Type your answer..."
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



// Ready prompts for quick access
const readyPrompts = [
  {
    id: 1,
    title: "Study Immigration",
    description: "Complete guidance for studying in Finland",
    prompt: "I want to apply to study in Finland. Please explain the steps and requirements."
  },
  {
    id: 2,
    title: "Finland Startup Visa",
    description: "Information about startup and entrepreneurship visa in Finland",
    prompt: "I want to apply for Finland's Startup Visa. Please provide the conditions and steps."
  },
  {
    id: 3,
    title: "Cost of Living in Finland",
    description: "Overview of living costs in Finland",
    prompt: "What is the cost of living in Finland? Including housing, food, and transportation."
  },
  {
    id: 4,
    title: "General Information about Finland",
    description: "General overview about Finland",
    prompt: "I want general information about Finland: culture, weather, people, etc."
  }
];

export default function FinlandQ4Page() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I am Q, your smart assistant at FinlandQ. 🇫🇮\n\nCount on me to help you find the best paths for immigration, study, and work in Finland. Ask me anything!\n\n💡 Tip: If you need professional guidance to start, just type "I want consultation" and I will open the free consultation form for you.\n\nI am ready to help. Where shall we start?',
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

  // Consultation questions
  const consultationQuestions = [
    { 
      field: 'salutationtype', 
      question: 'Hello! I am glad you are here for consultation 😊\n\nFirst, how would you like me to address you?', 
      options: [
        { value: 'آقای', label: 'Mr.' },
        { value: 'خانم', label: 'Ms.' }
      ],
      validation: { required: true, message: 'Please select how I should address you' },
      responseTemplates: [
        'Thank you 👋',
        // 'عالی {value}! 😊',
        // 'خوشحالم {value}! ✨',
        // 'خیلی خوب {value}! 🎯'
      ]
    },
    { 
      field: 'first_name', 
      question: 'What is your first name? 🤔', 
      type: 'text',
      validation: { required: true, message: 'Please enter your first name' },
      responseTemplates: [
        'Thanks {value}! That’s a lovely name 😊',
        'Nice to meet you, {value}! 🎉',
      ]
    },
    { 
      field: 'last_name', 
      question: '{first_name}, may I have your last name as well?', 
      type: 'text',
      validation: { required: true, message: 'Last name is required' },
      responseTemplates: [
        'Great, {first_name} {value}! 👏',
        'Perfect! Now I have your full name {first_name} {value} 🎯',
      ]
    },
    { 
      field: 'age', 
      question: 'How old are you? (This helps me guide you better)', 
      type: 'number',
      validation: { required: true, message: 'Age is required to better assist you' },
      responseTemplates: [
        'Got it, {value} years old! 🚀',
        'Perfect! {value} is a great age for new steps 🌟',
      ]
    },
    { 
      field: 'email', 
      question: 'Please share your email so I can send consultation details:', 
      type: 'email',
      validation: { required: true, type: 'email', message: 'Please enter a valid email' },
      responseTemplates: [
        'Email noted 📧',
        'Perfect! Email saved ✅',
      ]
    },
    { 
      field: 'mobile', 
      question: 'Please share your mobile number so we can contact you if needed:', 
      type: 'tel',
      validation: { required: true, message: 'Mobile number is required' },
      responseTemplates: [
        'Saved your number 📱',
        'Great! Phone number saved ☎️',
      ]
    },
    { 
      field: 'city', 
      question: 'Which city do you live in?', 
      type: 'text',
      validation: { required: true, message: 'City is required to guide you better' },
      responseTemplates: [
        '{value}! Nice city 🏙️',
      ]
    },
    { 
      field: 'acquainted', 
      question: 'How did you find us?', 
      options: [
        { value: 'search', label: 'Search' },
        { value: 'friend', label: 'Friends/Referrals' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'telegram', label: 'Telegram' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'youtube', label: 'YouTube FinlandQ' },
        { value: 'ad', label: 'Ads' },
        { value: 'چت آنلاین یا وبینار', label: 'Online chat or webinar' },
        { value: 'فیسبوک', label: 'Facebook' },
        { value: 'لینکدین', label: 'LinkedIn' },
        { value: 'بازاریابی تلفنی', label: 'Phone marketing' },
        { value: 'سایر', label: 'Other' }
      ],
      validation: { required: true, message: 'This information helps us a lot' },
      responseTemplates: [
        'Oh, from {value}! Nice 👍',
      ]
    },
    { 
      field: 'position', 
      question: 'Great! Which of our products are you interested in? (You can choose multiple)', 
      options: [
        { value: 'چهار فصل (آمیس)', label: 'Ammis (Vocational)' },
        { value: 'high-school', label: 'High School' },
        { value: 'university', label: 'Bachelor' },
        { value: 'master', label: 'Master' },
        { value: 'startup', label: 'Startup & Investment' }
      ], 
      multiple: true,
      validation: { required: true, message: 'This helps us provide the best service' },
      responseTemplates: [
        'Great! You are interested in {value}. I can fully guide you 🎯',
      ]
    },
    { 
      field: 'message', 
      question: 'Final question: If you have any specific notes or questions, write them here (optional):', 
      type: 'textarea',
      validation: { required: false },
      responseTemplates: [
        'Thanks for your time! 🙏',
        'Great! I have all the info now 🎉',
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
      console.error('Error loading conversation history:', error);
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
      console.error('Error creating session:', error);
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
    // Check for exact copilot action command
    const hasCopilotAction = response.includes('[COPILOT_ACTION:CONSULTATION_REQUEST]');
    
    // Check for direct consultation requests
    const directRequests = [
      'open consultation form',
      'i suggest the consultation form',
    ];
    
    const hasDirectRequest = directRequests.some(phrase =>
      response.toLowerCase().includes(phrase.toLowerCase())
    );
    
    // Check for consultation-related phrases that suggest consultation
    const consultationPhrases = [
      'consultation form',
      'request a consultation'
    ];
    
    const hasConsultationPhrases = consultationPhrases.some(phrase =>
      response.toLowerCase().includes(phrase.toLowerCase())
    );
    
    console.log('Checking consultation request:', {
      response: response.substring(0, 100) + '...',
      hasCopilotAction,
      hasDirectRequest,
      hasConsultationPhrases,
      directRequests,
      consultationPhrases
    });
    
    return hasCopilotAction || hasDirectRequest || hasConsultationPhrases;
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

        // Check if response suggests consultation (only if not already in consultation mode)
        const hasConsultationRequest = !isInConsultationMode && (
          checkForConsultationRequest(data.answer)
        );
        
        // || 
        // (data.copilotActions && data.copilotActions.some((action: any) => 
          // action.type === 'consultation_request'
        // ))
        console.log('Consultation check result:', {
          hasConsultationRequest,
          copilotActions: data.copilotActions,
          answer: data.answer.substring(0, 200) + '...',
          answerLength: data.answer.length,
          hasCopilotActions: !!data.copilotActions,
          copilotActionsLength: data.copilotActions ? data.copilotActions.length : 0
        });
        
        if (hasConsultationRequest && !isInConsultationMode) {
          console.log('🎯 Consultation request detected! Asking for confirmation...');
          console.log('🔍 Current state before confirmation:', {
            isInConsultationMode,
            consultationStep,
            hasConsultationRequest
          });
          setTimeout(() => {
            // If response suggests consultation, ask for confirmation first
            console.log('📝 Setting up confirmation step...');
            // ابتدا پیام تأیید ارسال کن
            const confirmationMessage: Message = {
              id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'assistant',
              content: 'Would you like me to open the consultation form? Please choose "Yes" or "No".',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, confirmationMessage]);
            
            // حالت مشاوره را فعال کن اما در مرحله تأیید
            setIsInConsultationMode(true);
            setConsultationStep(-1);
            setConsultationData({});
            console.log('✅ Confirmation step setup complete');
          }, 1000);
        }
      } else {
        throw new Error(data.error || 'Error receiving response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: 'Sorry, an error occurred. ',
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
        return { isValid: false, errorMessage: 'Invalid email format' };
      }
    }

    // چک کردن شماره موبایل
    if (question.type === 'tel' && typeof answer === 'string') {
      const mobileRegex = /^09\d{9}$/;
      if (!mobileRegex.test(answer.replace(/\s/g, ''))) {
        return { isValid: false, errorMessage: 'Mobile number must start with 09 and be 11 digits' };
      }
    }

    // چک کردن سن
    if (question.type === 'number' && typeof answer === 'string') {
      // Convert Persian numbers to English first
      const convertedAnswer = convertPersianToEnglishNumbers(answer);
      const age = parseInt(convertedAnswer);
      if (isNaN(age) || age < 1 || age > 120) {
        return { isValid: false, errorMessage: 'Age must be a number between 1 and 120' };
      }
    }

    return { isValid: true };
  };

  const handleConsultationAnswer = (answer: string | string[]) => {
    console.log('🔍 handleConsultationAnswer called with:', {
      answer,
      consultationStep,
      isInConsultationMode,
      answerType: typeof answer,
      isArray: Array.isArray(answer),
      stackTrace: new Error().stack,
      timestamp: new Date().toISOString()
    });

    // اگر در مرحله تأیید هستیم (step -1)
    if (consultationStep === -1) {
      console.log('🎯 Processing confirmation step with answer:', answer);
      const answerText = (Array.isArray(answer) ? answer[0] : answer).toLowerCase();
      const confirmationWords = ['yes', 'ok', 'okay', 'ready', 'sure', 'go ahead'];
      const rejectionWords = ['no', 'not now', 'later'];
      
      console.log('🔍 Checking answer against confirmation/rejection words:', {
        answerText,
        hasConfirmationWord: confirmationWords.some(word => answerText.includes(word)),
        hasRejectionWord: rejectionWords.some(word => answerText.includes(word))
      });
      
      if (confirmationWords.some(word => answerText.includes(word))) {
        console.log('✅ User confirmed - proceeding to consultation questions');
        // User confirmed - start main questions
        const userMessage: Message = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'user',
          content: Array.isArray(answer) ? answer.join(', ') : answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Add a bit more delay for clarity
        setTimeout(() => {
          const welcomeMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: '🎯 Great! To begin, I need some info to guide you better. Are you ready?',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, welcomeMessage]);
          
          setTimeout(() => {
            console.log('📝 Setting consultationStep to 0 and showing first question');
            setConsultationStep(0);
            
            setTimeout(() => {
              const firstRealQuestion: Message = {
                id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'assistant',
                content: consultationQuestions[0].question,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, firstRealQuestion]);
              console.log('📝 First question displayed - consultation form now active');
            }, 500);
          }, 1000);
        }, 800);
        return;
      } else if (rejectionWords.some(word => answerText.includes(word))) {
        console.log('❌ User rejected - exiting consultation mode');
        const userMessage: Message = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'user',
          content: Array.isArray(answer) ? answer.join(', ') : answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setTimeout(() => {
          const rejectionMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: 'No problem! When you are ready for consultation, just say "I want consultation" 😊',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, rejectionMessage]);
          
          // خروج از حالت مشاوره
          setIsInConsultationMode(false);
          setConsultationStep(-1);
          setConsultationData({});
          console.log('🚪 Exited consultation mode');
        }, 800);
        return;
      } else {
        console.log('❓ User gave unclear answer - asking for clarification');
        const userMessage: Message = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'user',
          content: Array.isArray(answer) ? answer.join(', ') : answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        setTimeout(() => {
          const clarificationMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: 'Please say "Yes" or "No" so I can assist you better 😊',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, clarificationMessage]);
        }, 800);
        return;
      }
    }
    
    console.log('📋 Processing regular consultation question:', consultationStep);
    // Main questions
    const currentQuestion = consultationQuestions[consultationStep];
    const validation = validateAnswer(currentQuestion, answer);
    
    if (!validation.isValid) {
      const errorMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: `❌ ${validation.errorMessage}\n\nPlease answer again:`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Save answer
    const fieldName = currentQuestion.field as keyof ConsultationFormData;
    
    // Convert Persian numbers to English for age field
    let processedAnswer = Array.isArray(answer) ? answer : answer;
    if (fieldName === 'age' && typeof processedAnswer === 'string') {
      processedAnswer = convertPersianToEnglishNumbers(processedAnswer);
    }
    
    const newConsultationData = {
      ...consultationData,
      [fieldName]: processedAnswer
    };
    setConsultationData(newConsultationData);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: Array.isArray(answer) ? answer.join(', ') : answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Check if it was the last question
    if (consultationStep === consultationQuestions.length - 1) {
      // ارسال درخواست
      setTimeout(() => {
        // Generate conversation summary and sales analysis
        const conversationSummary = generateConversationSummary();
        const salesAnalysis = generateSalesAnalysis();
        
        // Save analyses in consultationData
        setConsultationData(prev => ({
          ...prev,
          conversation_summary: conversationSummary,
          sales_analysis: salesAnalysis,
          source:"chat"
        }));
        
        // Build English summary text
        const rawSummaryText = `Great! I have received all your information. Please review before we submit:\n\n📝 **Your Summary:**\n• Name:  ${newConsultationData.first_name} ${newConsultationData.last_name}\n• Age: ${newConsultationData.age}\n• City: ${newConsultationData.city}\n• Email: ${newConsultationData.email}\n• Mobile: ${newConsultationData.mobile}\n• Source: ${newConsultationData.acquainted}\n• Interested Products: ${Array.isArray(newConsultationData.position) ? newConsultationData.position.join(', ') : newConsultationData.position}\n${newConsultationData.message ? `• Additional message: ${newConsultationData.message}` : ''}\n\nSubmitting your request...`;
        const summaryText = formatSummaryText(rawSummaryText);
        
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
      // Next question with personalized response
      setTimeout(() => {
        const nextQuestion = consultationQuestions[consultationStep + 1];
        
        // Generate personalized response
        let personalizedResponse = '';
        if (currentQuestion.responseTemplates && currentQuestion.responseTemplates.length > 0) {
          const randomTemplate = currentQuestion.responseTemplates[Math.floor(Math.random() * currentQuestion.responseTemplates.length)];
          
          // Replace variables in template
          let valueToShow = Array.isArray(answer) ? answer.join(', ') : answer;
          if (fieldName === 'age' && typeof valueToShow === 'string') {
            valueToShow = convertPersianToEnglishNumbers(valueToShow);
          }
          
          personalizedResponse = randomTemplate
            .replace('{value}', valueToShow)
            .replace('{salutationtype}', newConsultationData.salutationtype || '')
            .replace('{first_name}', newConsultationData.first_name || '')
            .replace('{last_name}', newConsultationData.last_name || '');
        }

        // Add personalized response
        if (personalizedResponse) {
          const responseMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: personalizedResponse,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, responseMessage]);
        }

        // Add next question
        setTimeout(() => {
          // Replace variables in question
          let processedQuestion = nextQuestion.question;
          processedQuestion = processedQuestion
            .replace('{first_name}', newConsultationData.first_name || '')
            .replace('{last_name}', newConsultationData.last_name || '')
            .replace('{salutationtype}', newConsultationData.salutationtype || '');
          
          const nextQuestionMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: processedQuestion,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextQuestionMessage]);
          setConsultationStep(consultationStep + 1);
        }, 1000);
      }, 800);
    }
  };

  // Generate conversation summary
  const generateConversationSummary = () => {
    const userMessages = messages.filter(m => m.type === 'user');
    const keywords = extractKeywords(userMessages.map(m => m.content).join(' '));
    
    let summary = '🎯 **Conversation Summary:**\n';
    
    // تحلیل موضوعات اصلی
    const topics = analyzeTopics(userMessages);
    if (topics.length > 0) {
      summary += `• Topics discussed: ${topics.join(', ')}\n`;
    }
    
    // تحلیل نیازها
    const needs = analyzeNeeds(userMessages);
    if (needs.length > 0) {
      summary += `• User needs: ${needs.join(', ')}\n`;
    }
    
    // کلمات کلیدی مهم
    if (keywords.length > 0) {
      summary += `• Keywords: ${keywords.slice(0, 5).join(', ')}\n`;
    }
    
    return summary;
  };

  // Generate sales analysis
  const generateSalesAnalysis = () => {
    const userMessages = messages.filter(m => m.type === 'user');
    const allUserText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    let analysis = '📊 **Sales analysis for the marketing team:**\n';
    
    // تحلیل سطح علاقه
    const interestLevel = calculateInterestLevel(allUserText);
    analysis += `• Interest level: ${interestLevel}\n`;
    
    // تحلیل عجله خرید
    const urgency = calculateUrgency(allUserText);
    analysis += `• Purchase urgency: ${urgency}\n`;
    
    // نقاط قوت برای فروش
    const salesPoints = identifySalesPoints();
    if (salesPoints.length > 0) {
      analysis += `• Sales points: ${salesPoints.join(', ')}\n`;
    }
    
    // پیشنهادات مارکتینگ
    const marketingTips = generateMarketingTips();
    if (marketingTips.length > 0) {
      analysis += `• Suggestions: ${marketingTips.join(', ')}\n`;
    }
    
    return analysis;
  };

  // Helper functions
  const extractKeywords = (text: string) => {
    const keywords = ['immigration', 'study', 'work', 'finland', 'visa', 'university', 'life', 'residence', 'investment', 'startup'];
    return keywords.filter(keyword => text.toLowerCase().includes(keyword));
  };

  const analyzeTopics = (userMessages: Message[]) => {
    const topics = [];
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('study') || allText.includes('university') || allText.includes('degree')) topics.push('study');
    if (allText.includes('work') || allText.includes('job') || allText.includes('hire')) topics.push('employment');
    if (allText.includes('immigration') || allText.includes('residence') || allText.includes('visa')) topics.push('immigration');
    if (allText.includes('investment') || allText.includes('startup') || allText.includes('business')) topics.push('investment');
    
    return topics;
  };

  const analyzeNeeds = (userMessages: Message[]) => {
    const needs = [];
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('guide') || allText.includes('help') || allText.includes('consultation')) needs.push('professional guidance');
    if (allText.includes('fast') || allText.includes('urgent') || allText.includes('soon')) needs.push('fast service');
    if (allText.includes('cheap') || allText.includes('price') || allText.includes('cost')) needs.push('affordable price');
    
    return needs;
  };

  const calculateInterestLevel = (text: string) => {
    let score = 0;
    if (text.includes('very interested') || text.includes('definitely want')) score += 3;
    if (text.includes('interested') || text.includes('i want consultation')) score += 2;
    if (text.includes('i have a question') || text.includes('tell me')) score += 1;
    
    if (score >= 3) return 'Very high 🔥';
    if (score >= 2) return 'High ⭐';
    return 'Medium 📝';
  };

  const calculateUrgency = (text: string) => {
    if (text.includes('urgent') || text.includes('fast') || text.includes('this year')) return 'Urgent ⚡';
    if (text.includes('sooner') || text.includes('next year')) return 'Medium ⏰';
    return 'Long-term 📅';
  };

  const identifySalesPoints = () => {
    const points = [];
    const data = consultationData;
    
    if (data.age && parseInt(data.age) < 30) points.push('Good age for immigration');
    const positions = Array.isArray(data.position) ? data.position : (data.position ? [data.position] : []);
    const positionStr = positions.join(',');
    if (positionStr.includes('master') || positionStr.includes('startup')) {
      points.push('Ambitious goals');
    }
    if (positionStr.includes('چهار فصل (آمیس)')) {
      points.push('Interested in a popular program');
    }
    if (positionStr.includes('university') || positionStr.includes('high-school')) {
      points.push('Focus on education');
    }
    if (data.acquainted === 'instagram' || data.acquainted === 'telegram') points.push('Active on social media');
    
    return points;
  };

  const generateMarketingTips = () => {
    const tips = [];
    const data = consultationData;
    
    if (data.age && parseInt(data.age) < 25) tips.push('Emphasize study opportunities');
    if (data.age && parseInt(data.age) > 30) tips.push('Emphasize work opportunities');
    if (data.acquainted === 'instagram') tips.push('Send visual content');
    const positions = Array.isArray(data.position) ? data.position : (data.position ? [data.position] : []);
    const positionStr = positions.join(',');
    if (positionStr.includes('high-school')) {
      tips.push('Introduce preparatory courses');
    }
    if (positionStr.includes('startup')) {
      tips.push('Emphasize entrepreneurship opportunities');
    }
    if (positionStr.includes('چهار فصل')) {
      tips.push('Send full information about Ammis program');
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
          sessionId: sessionId,
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
          content: `🎉 Great, ${consultationData.first_name}!\n\n✅ Your request has been successfully submitted and received by our team.\n\nOur team will contact you within 24 hours for a full consultation. Don’t worry, we will definitely call you 😊\n\n📋 Your tracking code: ${result.data.code}\n\nThank you for your trust! 🙏`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // اضافه کردن دکمه شروع مجدد
        setTimeout(() => {
          const restartMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'assistant',
            content: 'If you have a friend who needs consultation, I’d be happy to help! Just say "I want consultation" to start again 😊',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, restartMessage]);
        }, 2000);
      } else {
        throw new Error('Error submitting the request');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: 'Oh no! 😔 A technical issue occurred and I couldn’t submit your request.\n\nPlease try again.\n\nSorry for the inconvenience! 🙏',
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
      content: 'Would you like me to open the consultation form?',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
  };

  const startNewChat = () => {
    if (confirm('Do you want to start a new chat?')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('session');
      window.history.replaceState({}, '', newUrl.toString());
      
      setMessages([{
        id: '1',
        type: 'assistant',
        content: 'Hello! I am Q, your smart assistant at FinlandQ. 🇫🇮\n\nCount on me to help you find the best paths for immigration, study, and work in Finland. Ask me anything!\n\n💡 Tip: If you need professional guidance to start, just type "I want consultation" and I will open the free consultation form for you.\n\nI am ready to help. Where shall we start?',
        timestamp: new Date()
      }]);
      
      // Reset consultation form state
      setIsInConsultationMode(false);
      setConsultationStep(-1);
      setConsultationData({});
      
      createNewSession();
    }
  };

  const showHelp = () => {
    const helpMessage: Message = {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'assistant',
        content: `🎯 **How to use QChat:**\n\n💬 **Regular chat:**\n• Ask anything about immigration, study, or work in Finland\n• I will help you with up-to-date and accurate information\n\n📋 **Consultation request:**\n• Just type "I want consultation"\n• The full consultation form will open for you\n• Our experts will contact you within 24 hours\n\n🔍 **Topics covered:**\n• Immigration to Finland\n• Studying at Finnish universities\n• Jobs and employment\n• Visa and residence\n• Life in Finland\n• Investment and startup\n\nI’m ready to help! 😊`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, helpMessage]);
  };

  const requestConsultation = () => {
    startConsultation();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50" dir="ltr">
            {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src="/qchat.png" alt="FinlandQ" className="w-8 h-8" />
              <h2 className="text-lg font-semibold text-gray-900">QChat</h2>
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
              <span>New chat</span>
            </button>

            {/* Navigation Buttons */}
            <div className="space-y-2 mb-6">
              <button
                onClick={showHelp}
                className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </button>
              
              <button
                onClick={requestConsultation}
                className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>Request consultation</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>User</span>
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
              <img src="/qchat.png" alt="FinlandQ" className="w-8 h-8" />
              <h1 className="text-lg font-semibold text-gray-900">QChat</h1>
            </div>

            {/* Desktop Navigation Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={startNewChat}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New chat</span>
              </button>
              
              <button
                onClick={showHelp}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </button>
              
              <button
                onClick={requestConsultation}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Users className="w-4 h-4" />
                <span>Request consultation</span>
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </div>
            </div>

            {/* Mobile Status */}
            <div className="md:hidden flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Ready Prompts */}
        {messages.length === 1 && (
          <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Where shall we start?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyPrompts.map((prompt) => (
                <motion.button
                  key={prompt.id}
                  onClick={() => sendMessage(prompt.prompt)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
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
                  className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  } rounded-2xl px-4 py-3 shadow-sm`}>
                    <div className="text-sm leading-relaxed">
                      {/* Debug: Log content for tables */}
                      {message.content.includes('|') && (() => { 
                        console.log('Original table content:', message.content);
                        const cleaned = cleanTableFormat(message.content);
                        console.log('Cleaned table content:', cleaned);
                        console.log('Table parts count:', message.content.split('|').length);
                        return null; 
                      })()}
                      <ReactMarkdown components={MarkdownComponents}>
                        {cleanTableFormat(message.content)}
                      </ReactMarkdown>
                    </div>
                    <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString('en-US', { 
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
                    <span className="text-sm text-gray-600">Typing...</span>
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
              // Confirmation step - Yes/No options only
              <div className="space-y-2">
                <div className="text-center mb-2 text-sm text-gray-600">
                  Confirmation step - please choose:
                </div>
                <div className="text-center mb-3 text-xs text-gray-500">
                  The consultation form will only open after your confirmation
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log('🔘 User clicked Yes button');
                      handleConsultationAnswer('yes');
                    }}
                    disabled={isLoading}
                    className="text-right p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-lg transition-all duration-300 disabled:opacity-50 text-gray-800 text-sm sm:text-base shadow-sm hover:shadow-md"
                  >
                    Yes, I am ready ✅
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log('🔘 User clicked No button');
                      handleConsultationAnswer('no');
                    }}
                    disabled={isLoading}
                    className="text-right p-2 sm:p-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 rounded-lg transition-all duration-300 disabled:opacity-50 text-gray-800 text-sm sm:text-base shadow-sm hover:shadow-md"
                  >
                    Not now ❌
                  </motion.button>
                </div>
              </div>
            ) : consultationStep >= 0 && consultationStep < consultationQuestions.length ? (
              // Main questions
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
                    placeholder="Type your message..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm focus:shadow-md transition-all duration-300 text-sm"
                    rows={1}
                    style={{
                      direction: 'ltr',
                      textAlign: 'left'
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
                Press Enter to send • Shift+Enter for a new line
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 