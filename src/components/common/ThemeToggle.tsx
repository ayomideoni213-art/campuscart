import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented' | 'mobile';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Segmented control variant (e.g. for User Dashboard Settings or Mobile Menu)
  if (variant === 'segmented') {
    const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
      { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
      { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
      { mode: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> }
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Theme mode selector"
        className={`inline-flex items-center p-1 bg-stone-100 dark:bg-[#1a202c] border border-stone-200 dark:border-[#2b3545] rounded-xl text-xs ${className}`}
      >
        {options.map((opt) => {
          const isSelected = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isSelected
                  ? 'bg-white dark:bg-[#262e3d] text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span className={isSelected ? 'text-amber-500 dark:text-amber-400' : ''}>
                {opt.icon}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Mobile menu full-width row variant
  if (variant === 'mobile') {
    return (
      <div className={`pt-3 border-t border-stone-200 dark:border-[#262e3d] ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
            Appearance
          </span>
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 capitalize">
            {theme === 'system' ? `System (${resolvedTheme})` : `${theme} mode`}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
              theme === 'light'
                ? 'bg-amber-400/10 border-amber-500 text-stone-900 dark:text-stone-100 font-semibold'
                : 'bg-stone-50 dark:bg-[#161c26] border-stone-200 dark:border-[#262e3d] text-stone-600 dark:text-stone-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
              theme === 'dark'
                ? 'bg-amber-400/10 border-amber-500 text-stone-900 dark:text-stone-100 font-semibold'
                : 'bg-stone-50 dark:bg-[#161c26] border-stone-200 dark:border-[#262e3d] text-stone-600 dark:text-stone-400'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
              theme === 'system'
                ? 'bg-amber-400/10 border-amber-500 text-stone-900 dark:text-stone-100 font-semibold'
                : 'bg-stone-50 dark:bg-[#161c26] border-stone-200 dark:border-[#262e3d] text-stone-600 dark:text-stone-400'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-indigo-400" />
            <span>System</span>
          </button>
        </div>
      </div>
    );
  }

  // Header Icon variant (Clean 1-click toggle with dropdown support on right-click or hover/options)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => toggleTheme()}
        onContextMenu={(e) => {
          e.preventDefault();
          setDropdownOpen((prev) => !prev);
        }}
        className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        title={
          isDark
            ? 'Dark Mode active. Click to switch to Light (Right-click for options)'
            : 'Light Mode active. Click to switch to Dark (Right-click for options)'
        }
        aria-label={`Current theme: ${theme} mode. Toggle theme`}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-amber-300 transition-transform hover:-rotate-12" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500 transition-transform hover:rotate-45" />
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#171d27] border border-stone-200 dark:border-[#262e3d] rounded-xl shadow-xl py-1.5 z-50 text-xs">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">
            Theme
          </div>
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setDropdownOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1f2735] transition-colors ${
              theme === 'light'
                ? 'font-bold text-amber-600 dark:text-amber-400'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setDropdownOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1f2735] transition-colors ${
              theme === 'dark'
                ? 'font-bold text-amber-600 dark:text-amber-400'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setDropdownOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1f2735] transition-colors ${
              theme === 'system'
                ? 'font-bold text-amber-600 dark:text-amber-400'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5" />
              <span>System</span>
            </div>
            {theme === 'system' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
