import React from 'react';
import { 
  WifiOff, 
  Lock, 
  Search, 
  Server, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';

interface ApiErrorProps {
  error: string | null;
  onRetry?: () => void;
  compact?: boolean;
}

const ApiError: React.FC<ApiErrorProps> = ({ error, onRetry, compact = false }) => {
  const getErrorInfo = () => {
    const err = error?.toLowerCase() || '';
    if (err.includes('network') || err.includes('failed to fetch')) {
      return { icon: WifiOff, title: 'Network Error', message: 'Please check your internet connection.' };
    }
    if (err.includes('401') || err.includes('unauthorized') || err.includes('403')) {
      return { icon: Lock, title: 'Access Denied', message: 'Your session may have expired.' };
    }
    if (err.includes('404')) {
      return { icon: Search, title: 'Not Found', message: 'Requested resource does not exist.' };
    }
    if (err.includes('500') || err.includes('server')) {
      return { icon: Server, title: 'Server Error', message: 'The factory server is under maintenance.' };
    }
    return { icon: AlertTriangle, title: 'Data Error', message: error || 'Failed to load information.' };
  };

  const { icon: Icon, title, message } = getErrorInfo();

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg animate-fade-in">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-xs font-bold text-red-700 truncate max-w-[200px]">{message}</span>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-600"
            title="Retry"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center animate-fade-in">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Zkusit znovu
        </button>
      )}
    </div>
  );
};

export default ApiError;