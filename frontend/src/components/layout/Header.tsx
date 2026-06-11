'use client'
{/* Componente: Header
   Propósito: Header superior: breadcrumb, selector de empresa, tema, perfil, cerrar sesión */}
import { Search, Bell, Moon, Sun, User, LogOut, ChevronDown, Sparkles, Settings, Building, Check, RefreshCw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

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
  const [companyOpen, setCompanyOpen] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [currentCompany, setCurrentCompany] = useState<any>(null)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const companyRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const pageTitle = pageTitles[pathname] || 'ContaPro ERP'

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
  }, [])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await api.auth.companies()
        setCompanies(data)
        const storedId = localStorage.getItem('companyId')
        const active = data.find((c: any) => String(c.id) === storedId) || data[0]
        setCurrentCompany(active)
      } catch {
        // ignore
      } finally {
        setLoadingCompanies(false)
      }
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const switchCompany = (company: any) => {
    api.auth.selectCompany(company.id)
    setCurrentCompany(company)
    setCompanyOpen(false)
    router.refresh()
  }

  const toggleDark = () => {
    const newDark = !dark
    setDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('companyId')
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

        <div className="relative hidden md:block" ref={companyRef}>
          <button
            onClick={() => setCompanyOpen(!companyOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface)] dark:bg-gray-800 border border-[var(--border)] text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {loadingCompanies ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                <div className="w-20 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <Building className="w-3.5 h-3.5 text-[#062B5B] dark:text-[#6EEB83]" />
                <div className="min-w-0 max-w-[200px]">
                  <div className="text-gray-700 dark:text-gray-300 truncate text-sm leading-tight">
                    {currentCompany?.name || 'Seleccionar empresa'}
                  </div>
                  {currentCompany?.document_number && (
                    <div className="text-xs text-gray-400 truncate leading-tight">
                      NIT {currentCompany.document_number}{currentCompany.dv ? `-${currentCompany.dv}` : ''}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </>
            )}
          </button>
          {companyOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Empresas</h3>
              </div>
              {companies.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No hay empresas disponibles
                </div>
              ) : (
                companies.map((company) => {
                  const nit = company.document_number || company.nit || ''
                  const dv = company.dv || ''
                  return (
                    <button
                      key={company.id}
                      onClick={() => switchCompany(company)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{company.name}</div>
                          {nit && <div className="text-xs text-gray-400 truncate">NIT {nit}{dv ? `-${dv}` : ''}</div>}
                        </div>
                      </div>
                      {currentCompany?.id === company.id && (
                        <Check className="w-4 h-4 text-[#6EEB83] shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
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
