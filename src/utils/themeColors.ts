export const themeColors = {
  background: 'bg-slate-50 dark:bg-slate-950',
  surface: 'bg-white dark:bg-slate-900',
  surfaceSecondary: 'bg-slate-100/80 dark:bg-slate-800/80',
  border: 'border-slate-300 dark:border-slate-800',
  text: 'text-slate-900 dark:text-slate-50',
  // Zvýšen kontrast: slate-600 ve světlém a slate-400 v tmavém režimu (původně 500)
  textSecondary: 'text-slate-600 dark:text-slate-400',
  textMuted: 'text-slate-500 dark:text-slate-500',
  // Sytější barvy pro lepší viditelnost na světlém i tmavém pozadí
  primary: 'bg-red-600 dark:bg-red-700',
  success: 'bg-emerald-600 dark:bg-emerald-500',
  successText: 'text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-600 dark:bg-amber-500',
  warningText: 'text-amber-700 dark:text-amber-400',
  error: 'bg-red-600 dark:bg-red-500',
  errorText: 'text-red-700 dark:text-red-400',
};

/**
 * Utility for joining tailwind classes.
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}