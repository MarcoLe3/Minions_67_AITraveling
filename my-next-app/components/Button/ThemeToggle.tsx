'use client'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/Context/ThemeContext'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        flex items-center justify-center w-10 h-10 rounded-full
        bg-black/20 hover:bg-black/30 dark:bg-white/15 dark:hover:bg-white/25
        backdrop-blur-sm border border-white/25
        text-white transition-all duration-200 cursor-pointer
        ${className}
      `}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
