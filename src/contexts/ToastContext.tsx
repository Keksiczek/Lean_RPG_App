import React, { createContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'levelup' | 'badge';
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
  data?: {
    xp?: number;
    badgeName?: string;
    badgeRarity?: string;
    newLevel?: number;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  xpGained: (amount: number, reason?: string) => void;
  badgeUnlocked: (badgeName: string, rarity: string) => void;
  levelUp: (newLevel: number) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 5000;
const SPECIAL_DURATION = 8000;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || (['achievement', 'levelup', 'badge'].includes(toast.type) ? SPECIAL_DURATION : DEFAULT_DURATION);
    
    setToasts((prev) => {
      const next = [...prev, { ...toast, id, duration }];
      if (next.length > MAX_TOASTS) {
        return next.slice(1);
      }
      return next;
    });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const clearAll = useCallback(() => setToasts([]), []);

  const success = (title: string, message?: string) => addToast({ type: 'success', title, message });
  const error = (title: string, message?: string) => addToast({ type: 'error', title, message });
  const warning = (title: string, message?: string) => addToast({ type: 'warning', title, message });
  const info = (title: string, message?: string) => addToast({ type: 'info', title, message });
  
  const xpGained = (amount: number, reason?: string) => 
    addToast({ 
      type: 'success', 
      title: `+${amount} XP Gained`, 
      message: reason || 'Quest activity completed',
      data: { xp: amount } 
    });

  const badgeUnlocked = (badgeName: string, rarity: string) => 
    addToast({ 
      type: 'badge', 
      title: 'New Badge Unlocked!', 
      message: `You earned the ${badgeName} badge.`,
      data: { badgeName, badgeRarity: rarity } 
    });

  const levelUp = (newLevel: number) => 
    addToast({ 
      type: 'levelup', 
      title: 'LEVEL UP!', 
      message: `Congratulations! You reached Level ${newLevel}`,
      data: { newLevel } 
    });

  return (
    <ToastContext.Provider value={{ 
      toasts, addToast, removeToast, clearAll, 
      success, error, warning, info, 
      xpGained, badgeUnlocked, levelUp 
    }}>
      {children}
    </ToastContext.Provider>
  );
};
