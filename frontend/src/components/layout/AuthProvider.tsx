'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { RefreshCw } from 'lucide-react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [checking, setChecking] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/login'

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
    const token = localStorage.getItem('token')
    if (!token && !isLogin) {
      router.replace('/login')
    } else {
      if (token && isLogin) router.replace('/')
      else setChecking(false)
    }
  }, [pathname])

  if (checking && !isLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#062B5B] dark:text-[#6EEB83] mx-auto mb-4" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (isLogin) return <>{children}</>

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className="flex-1 transition-all duration-300 flex flex-col"
        style={{
          marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        }}
      >
        <Header />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
