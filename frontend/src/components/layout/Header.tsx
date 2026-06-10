'use client'
{/* Componente: Header
   Propósito: Header superior: breadcrumb, selector de empresa, tema, perfil, cerrar sesión */}
import { Search, Bell, Moon, Sun, User, LogOut, ChevronDown, Sparkles, Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard Ejecutivo',
  '/contabilidad': 'Contabilidad',
  '/financiero': 'Módulo Financiero',
  '/facturacion': 'Facturación Electrónica',
  '/inventario': 'Inventario',
  '/nomina': 'Nómina Electrónica',
  '/administrativo': 'Administrativo',
  '/reportes': 'Reportes',
  '/ia': 'ContaPro AI',
  '/configuracion': 'Configuración',
}

export function Header() {
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const pageTitle = pageTitles[pathname] || 'ContaPro ERP'

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleDark = () => {
    const newDark = !dark
    setDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <header className={cn(
      'h-[var(--header-height)] glass border-b border-[var(--border)] flex items-center justify-between px-6',
      'sticky top-0 z-30'
    )}>
      <div className="flex items-center gap-6 flex-1">
        <div>
          <h1 className="text-lg font-heading font-bold text-[#062B5B] dark:text-white">
            {pageTitle}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pathname === '/' ? 'Resumen financiero y contable' : 'Módulo de gestión empresarial'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en ContaPro..."
            className="w-64 pl-10 pr-4 py-2 bg-[var(--surface)] dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#062B5B]/20 dark:focus:ring-[#6EEB83]/20 border border-[var(--border)] text-gray-900 dark:text-white placeholder-gray-400 transition-all"
          />
        </div>

        <button
          onClick={toggleDark}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white dark:ring-gray-900" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
              </div>
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No hay notificaciones nuevas
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#062B5B] to-[#0a3d7a] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500">admin@contapro.com</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
                <p className="text-xs text-gray-500">admin@contapro.com</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); router.push('/configuracion') }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Configuración
              </button>
              <hr className="border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
