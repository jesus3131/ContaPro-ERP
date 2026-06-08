'use client'
import { Search, Bell, Moon, Sun, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
  }, [])

  const toggleDark = () => {
    const newDark = !dark
    setDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 ml-20">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute ml-3" />
        <input
          type="text"
          placeholder="Buscar en ContaPro..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
            <p className="text-xs text-gray-500">admin@contapro.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
