'use client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, BarChart3, Users, FileText,
  Package, Wallet, Brain, FileSpreadsheet, Settings, ChevronLeft,
  Building2, Receipt, PieChart,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { section: 'Principal', items: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'Gestión', items: [
    { href: '/contabilidad', label: 'Contabilidad', icon: BookOpen },
    { href: '/financiero', label: 'Financiero', icon: BarChart3 },
    { href: '/facturacion', label: 'Facturación', icon: Receipt },
    { href: '/inventario', label: 'Inventario', icon: Package },
    { href: '/nomina', label: 'Nómina', icon: Wallet },
    { href: '/administrativo', label: 'Admin.', icon: Building2 },
  ]},
  { section: 'Reportes', items: [
    { href: '/reportes', label: 'Reportes', icon: FileSpreadsheet },
    { href: '/ia', label: 'IA Asistente', icon: Brain },
  ]},
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 flex flex-col',
      collapsed ? 'w-20' : 'w-64'
    )}>
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <div>
              <h1 className="font-bold text-sm text-gray-900 dark:text-white">ContaPro</h1>
              <p className="text-[10px] text-gray-500">ERP Colombia</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.section}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                      collapsed && 'justify-center',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <Link
          href="/configuracion"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 transition-all',
            collapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Configuración</span>}
        </Link>
      </div>
    </aside>
  )
}
