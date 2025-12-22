export const themeColors = {
  background: 'bg-gray-100 dark:bg-slate-950',
  surface: 'bg-white dark:bg-slate-900',
  surfaceSecondary: 'bg-gray-50 dark:bg-slate-800',
  border: 'border-gray-200 dark:border-slate-800',
  text: 'text-gray-900 dark:text-slate-100',
  textSecondary: 'text-gray-500 dark:text-slate-400',
  primary: 'bg-red-600 dark:bg-red-700',
  success: 'bg-emerald-500 dark:bg-emerald-600',
  warning: 'bg-amber-500 dark:bg-amber-600',
  error: 'bg-red-500 dark:bg-red-600',
};

/**
 * Utility for joining tailwind classes.
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
