import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Minimize2, Sparkles, MapPin, ChevronRight } from 'lucide-react';
import { sendMessageToSensei } from '../services/geminiService';
import { ChatMessage, ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LeanChatbotProps {
  activeView?: ViewState;
  contextData?: {
    checklist?: string[];
    gameContext?: string;
  };
}

const LeanChatbot: React.FC<LeanChatbotProps> = ({ activeView, contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { t } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t('chatbot.welcome'),
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Generate Context String for the AI
  const getContextString = () => {
    let ctx = "Navigating the App";
    if (activeView === ViewState.GAME_AUDIT) ctx = "Performing a 5S Audit";
    if (activeView === ViewState.GAME_LPA) ctx = "Conducting a Layered Process Audit (LPA)";
    if (activeView === ViewState.GAME_ISHIKAWA) ctx = "Analyzing a Problem using Fishbone Diagram";
    if (activeView === ViewState.TASKS) ctx = "Managing Corrective Actions";
    if (activeView === ViewState.FACTORY_MAP) ctx = "Viewing the Factory Digital Twin";
    
    if (contextData?.gameContext) {
        ctx += ` in location: ${contextData.gameContext}`;
    }
    return ctx;
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const currentContext = getContextString();
      const responseText = await sendMessageToSensei(textToSend, currentContext);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'model',
          text: "Connection interrupted. Please try again.",
          timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Smart Suggestions based on View
  const getSuggestions = () => {
    switch (activeView) {
        case ViewState.GAME_AUDIT:
            return ["What are common 5S violations here?", "Explain the 'Red Tag' criteria"];
        case ViewState.GAME_ISHIKAWA:
            return ["Give me examples of 'Method' causes", "How do I facilitate a 5 Whys session?"];
        case ViewState.TASKS:
            return ["How to prioritize safety tasks?", "What is a good due date for Kaizen?"];
        default:
            return ["What is the 8th Waste?", "Explain Kaizen philosophy"];
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-105 z-50 flex items-center justify-center group border-4 border-white/20 ring-1 ring-black/10"
      >
        <Bot className="w-8 h-8" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          {t('chatbot.title')}
        </span>
        {/* Notification dot if needed */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-red-600 rounded-full"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-[90vw] md:w-[400px] h-[600px] max-h-[75vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up ring-1 ring-black/5 font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-red-600 p-2 rounded-lg shadow-inner">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-wide">{t('chatbot.title')}</h3>
            <p className="text-[10px] text-green-400 flex items-center font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span> {t('chatbot.status')}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Context Badge */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-xs">
         <div className="flex items-center text-slate-500 font-medium truncate max-w-[250px]">
            <MapPin className="w-3 h-3 mr-1.5 text-red-500 shrink-0" />
            <span className="truncate">{getContextString()}</span>
         </div>
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context Active</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    msg.role === 'user' ? 'bg-slate-200 ml-2' : 'bg-red-100 mr-2'
                }`}>
                    {msg.role === 'user' ? <span className="text-xs font-bold text-slate-600">ME</span> : <Bot className="w-5 h-5 text-red-600" />}
                </div>

                {/* Bubble */}
                <div
                className={`rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
                >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 ml-10">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Suggestions (Quick Actions) */}
      {!isLoading && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="whitespace-nowrap bg-red-50 border border-red-100 text-red-700 text-xs px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center"
                  >
                    <Sparkles className="w-3 h-3 mr-1" /> {suggestion}
                  </button>
              ))}
          </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-300 transition-all">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chatbot.placeholder')}
            className="flex-1 bg-transparent border-0 px-3 py-2 text-sm focus:ring-0 outline-none text-slate-800 placeholder:text-slate-400"
            />
            <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-sm"
            >
            <Send className="w-4 h-4 ml-0.5" />
            </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[9px] text-slate-400">AI can make mistakes. Verify critical safety info.</p>
        </div>
      </div>
    </div>
  );
};

export default LeanChatbot;