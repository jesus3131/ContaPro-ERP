'use client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, BarChart3, Users, FileText,
  Package, Wallet, Brain, FileSpreadsheet, Settings, ChevronLeft,
  Building2, Receipt, PieChart, ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const menuItems: { section: string; items: { href: string; label: string; icon: any; color?: string }[] }[] = [
  { section: 'PRINCIPAL', items: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'GESTIÓN', items: [
    { href: '/contabilidad', label: 'Contabilidad', icon: BookOpen, color: '#3b82f6' },
    { href: '/financiero', label: 'Financiero', icon: BarChart3, color: '#8b5cf6' },
    { href: '/facturacion', label: 'Facturación', icon: Receipt, color: '#06b6d4' },
    { href: '/inventario', label: 'Inventario', icon: Package, color: '#f59e0b' },
    { href: '/nomina', label: 'Nómina', icon: Wallet, color: '#10b981' },
    { href: '/administrativo', label: 'Admin.', icon: Building2, color: '#ec4899' },
  ]},
  { section: 'ANALÍTICA', items: [
    { href: '/reportes', label: 'Reportes', icon: FileSpreadsheet, color: '#6366f1' },
    { href: '/ia', label: 'ContaPro AI', icon: Brain, color: '#6EEB83' },
  ]},
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full z-40 transition-all duration-300 flex flex-col',
      'bg-gradient-to-b from-[#062B5B] via-[#05244d] to-[#041d3e]',
      collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]'
    )}>
      <div className="flex items-center h-[var(--header-height)] px-4 border-b border-white/10">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#6EEB83] to-[#3ce057] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
            <span className="text-[#062B5B] font-extrabold text-sm font-heading">CP</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-heading font-bold text-sm text-white">ContaPro</h1>
              <p className="text-[10px] text-green-300 font-medium">ERP Colombia</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all',
            collapsed && 'absolute -right-3 top-5 bg-[#062B5B] border border-white/10 shadow-lg'
          )}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-6 space-y-8">
        {menuItems.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'text-white bg-white/10 shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                    title={collapsed ? item.label : undefined}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#6EEB83] rounded-r-full" />
                    )}
                    <div className={cn(
                      'relative flex items-center justify-center w-5 h-5',
                      isActive && item.color && 'drop-shadow-sm'
                    )}>
                      <item.icon
                        className="w-5 h-5"
                        style={{
                          color: isActive ? (item.color || '#6EEB83') : undefined,
                          filter: isActive ? 'brightness(1.2)' : undefined,
                        }}
                      />
                      {isActive && (
                        <span
                          className="absolute inset-0 animate-ping rounded-full opacity-20"
                          style={{ backgroundColor: item.color || '#6EEB83' }}
                        />
                      )}
                    </div>
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6EEB83] animate-pulse" />
                    )}
                    {!collapsed && !isActive && hoveredItem === item.href && (
                      <span className="ml-auto text-white/20 text-xs">{'→'}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/configuracion"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all',
            collapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Configuración</span>}
        </Link>
      </div>
    </aside>
  )
}
