
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, MessageSquare, Minimize2, Sparkles, MapPin, ChevronRight, Zap } from 'lucide-react';
import { sendMessageToSensei } from '../services/geminiService';
import { ChatMessage, ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/themeColors';

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
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const getContextString = () => {
    let ctx = "Global Hub";
    if (activeView === ViewState.GAME_AUDIT) ctx = "5S Audit Chamber";
    if (activeView === ViewState.GAME_LPA) ctx = "LPA Standard Work Verification";
    if (activeView === ViewState.GAME_ISHIKAWA) ctx = "Fishbone Root Cause Analysis";
    if (activeView === ViewState.TASKS) ctx = "Action Item Management";
    if (activeView === ViewState.FACTORY_MAP) ctx = "Digital Twin Navigation";
    
    if (contextData?.gameContext) {
        ctx += ` - Gemba: ${contextData.gameContext}`;
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
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "Sensei is momentarily unavailable. Reconnecting...",
          timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = () => {
    switch (activeView) {
        case ViewState.GAME_AUDIT:
            return ["Detect waste in this scene", "Explain Seiketsu principle"];
        case ViewState.GAME_ISHIKAWA:
            return ["Identify 'Machine' causes", "Guide me through 5 Whys"];
        case ViewState.TASKS:
            return ["Prioritize safety findings", "How to close a Red Tag?"];
        default:
            return ["Explain the 8th Waste", "What is Kaizen?"];
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 bg-red-600 hover:bg-red-700 text-white p-5 rounded-3xl shadow-[0_20px_40px_rgba(220,38,38,0.4)] transition-all transform hover:scale-110 active:scale-95 z-50 flex items-center justify-center group border-4 border-white/20 ring-1 ring-black/5"
      >
        <div className="relative">
           <Bot className="w-8 h-8" />
           <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-red-600 rounded-full animate-pulse shadow-sm"></span>
        </div>
        <span className="absolute right-full mr-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none">
          Consult Lean Sensei
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-[90vw] md:w-[420px] h-[650px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col z-50 overflow-hidden animate-slide-up ring-1 ring-black/5 font-sans border border-slate-200 dark:border-slate-800">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-white/10 group-hover:scale-105 transition-transform">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight">{t('chatbot.title')}</h3>
            <p className="text-[10px] text-emerald-400 flex items-center font-black uppercase tracking-[0.2em] mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> {t('chatbot.status')}
            </p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/50 hover:text-white">
          <Minimize2 className="w-6 h-6" />
        </button>
      </div>

      {/* Connection Context */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-[9px]">
         <div className="flex items-center text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest truncate max-w-[280px]">
            <MapPin className="w-3.5 h-3.5 mr-2 text-red-500 shrink-0" />
            <span className="truncate">{getContextString()}</span>
         </div>
         <span className="font-black text-red-500 animate-pulse">Sync Active</span>
      </div>

      {/* Chat Space */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-950 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex animate-fade-in", msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div className={cn("flex max-w-[88%]", msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                {/* Avatar */}
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm border border-black/5",
                  msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 ml-3' : 'bg-red-50 dark:bg-red-900/20 mr-3'
                )}>
                    {msg.role === 'user' ? <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">CI</span> : <Bot className="w-6 h-6 text-red-600" />}
                </div>

                {/* Bubble */}
                <div
                className={cn(
                    "rounded-[1.75rem] p-4 text-sm shadow-sm leading-relaxed border",
                    msg.role === 'user'
                    ? 'bg-red-600 text-white border-red-500 rounded-tr-none font-medium'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800 rounded-tl-none font-medium'
                )}
                >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={cn("text-[9px] mt-2 font-black uppercase tracking-widest opacity-40", msg.role === 'user' ? 'text-white' : 'text-slate-400')}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center gap-2 ml-14 bg-slate-50 dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-300"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sensei Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Strategy Suggestions */}
      {!isLoading && (
          <div className="px-6 pb-3 pt-4 flex gap-3 overflow-x-auto scrollbar-hide bg-white dark:bg-slate-950 border-t dark:border-slate-800">
              {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="whitespace-nowrap bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all flex items-center shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 mr-2 text-amber-500 fill-current" /> {suggestion}
                  </button>
              ))}
          </div>
      )}

      {/* Command Input */}
      <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl px-3 py-2 focus-within:ring-4 focus-within:ring-red-500/10 transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for guidance..."
              className="flex-1 bg-transparent border-0 px-4 py-3 text-sm focus:ring-0 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 transition-all shadow-xl shadow-red-600/20 active:scale-95"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 text-center mt-5">Verified Gemini 3 Flash Core Engine</p>
      </div>
    </div>
  );
};

export default LeanChatbot;
