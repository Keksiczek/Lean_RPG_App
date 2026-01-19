import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronRight } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  title = "Something went wrong", 
  showDetails = true 
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">!</div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{title}</h2>
          <p className="text-slate-500 mt-2">
            The factory system encountered an unexpected error. Don't worry, your progress is safe.
          </p>
        </div>

        {showDetails && error && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-left overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Error Trace</p>
            <p className="text-xs font-mono text-red-600 break-all leading-relaxed">
              {error.name}: {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="w-4 h-4 group-active:animate-spin" />
              Zkusit znovu
            </button>
          )}
          <button 
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Hlavní stránka
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;