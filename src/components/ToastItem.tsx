import React, { useEffect, useState } from 'react';
import { Toast } from '../contexts/ToastContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Trophy, 
  ChevronUp, 
  Award, 
  X,
  Zap
} from 'lucide-react';

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);
  const startTime = Date.now();

  useEffect(() => {
    const duration = toast.duration || 5000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success': return { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-100', icon: CheckCircle, iconColor: 'text-emerald-500' };
      case 'error': return { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-100', icon: XCircle, iconColor: 'text-red-500' };
      case 'warning': return { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-100', icon: AlertTriangle, iconColor: 'text-amber-500' };
      case 'info': return { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-100', icon: Info, iconColor: 'text-blue-500' };
      case 'achievement': return { bg: 'bg-purple-600 dark:bg-purple-700', border: 'border-purple-400 dark:border-purple-500', text: 'text-white', icon: Trophy, iconColor: 'text-white' };
      case 'levelup': return { bg: 'bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700', border: 'border-amber-300 dark:border-amber-600', text: 'text-white', icon: ChevronUp, iconColor: 'text-white' };
      case 'badge': return { bg: 'bg-slate-900 dark:bg-slate-800', border: 'border-slate-700 dark:border-slate-600', text: 'text-white', icon: Award, iconColor: 'text-amber-400' };
      default: return { bg: 'bg-white dark:bg-slate-900', border: 'border-gray-200 dark:border-slate-800', text: 'text-gray-800 dark:text-slate-100', icon: Info, iconColor: 'text-gray-400' };
    }
  };

  const { bg, border, text, icon: Icon, iconColor } = getStyles();
  const isSpecial = ['achievement', 'levelup', 'badge'].includes(toast.type);

  return (
    <div 
      className={`relative w-80 md:w-96 rounded-xl border-2 shadow-2xl overflow-hidden animate-slide-in-right mb-3 transition-all ${bg} ${border} ${isSpecial ? 'scale-105' : ''}`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`shrink-0 p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-black text-sm uppercase tracking-tight ${text}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`text-xs mt-1 leading-relaxed opacity-90 ${text}`}>
              {toast.message}
            </p>
          )}
          
          {toast.type === 'levelup' && toast.data?.newLevel && (
             <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-black text-white">LVL {toast.data.newLevel}</span>
                <Zap className="w-5 h-5 text-amber-200 animate-pulse" />
             </div>
          )}

          {toast.type === 'badge' && toast.data?.badgeName && (
             <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 text-[10px] font-black uppercase tracking-widest text-amber-400">
                {toast.data.badgeRarity} Rarity
             </div>
          )}
        </div>

        <button 
          onClick={() => onClose(toast.id)}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors shrink-0"
        >
          <X className={`w-4 h-4 ${text}`} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/10 dark:bg-white/10 w-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-75 ease-linear ${isSpecial ? 'bg-white/40' : 'bg-current opacity-20'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ToastItem;