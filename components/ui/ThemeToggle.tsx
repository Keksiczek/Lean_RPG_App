import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/themeColors';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'dropdown';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', showLabel = false }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        <span className="sr-only">Toggle theme</span>
        <div
          className={cn(
            "flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200",
            resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-slate-800" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          )}
        </div>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
        >
          {theme === 'light' && <Sun className="h-5 w-5 text-amber-500" />}
          {theme === 'dark' && <Moon className="h-5 w-5 text-indigo-400" />}
          {theme === 'system' && <Monitor className="h-5 w-5" />}
          {showLabel && <span className="text-sm font-medium uppercase tracking-wider">{theme}</span>}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-scale-in">
            <button
              onClick={() => { setTheme('light'); setIsDropdownOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                theme === 'light' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <Sun className="h-4 w-4" /> Light
            </button>
            <button
              onClick={() => { setTheme('dark'); setIsDropdownOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                theme === 'dark' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <Moon className="h-4 w-4" /> Dark
            </button>
            <button
              onClick={() => { setTheme('system'); setIsDropdownOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                theme === 'system' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <Monitor className="h-4 w-4" /> System
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all hover:scale-110 active:scale-95"
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {resolvedTheme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
