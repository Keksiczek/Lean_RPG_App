import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
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

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
    { id: 'dark', label: 'Dark', icon: Moon, color: 'text-indigo-400' },
    { id: 'system', label: 'System', icon: Monitor, color: 'text-slate-400' }
  ] as const;

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 dark:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        aria-label="Toggle visual theme"
      >
        <div
          className={cn(
            "flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200",
            resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-indigo-600" />
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
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
        >
          {theme === 'light' && <Sun className="h-5 w-5 text-amber-500" />}
          {theme === 'dark' && <Moon className="h-5 w-5 text-indigo-400" />}
          {theme === 'system' && <Monitor className="h-5 w-5 text-slate-400" />}
          {showLabel && <span className="text-sm font-bold uppercase tracking-wider">{theme}</span>}
          <ChevronDown className={cn("h-4 w-4 transition-transform text-slate-400", isDropdownOpen && "rotate-180")} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-scale-in">
            <div className="p-1">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setTheme(opt.id); setIsDropdownOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg transition-colors group",
                    theme === opt.id 
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <opt.icon className={cn("h-4 w-4", opt.color)} />
                  <span className="flex-1 text-left">{opt.label}</span>
                  {theme === opt.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
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