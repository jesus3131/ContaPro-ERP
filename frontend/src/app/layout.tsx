'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/login'

  useEffect(() => {
    setMounted(true)
    const theme = localStorage.getItem('theme')
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
    const token = localStorage.getItem('token')
    if (!token && !isLogin) {
      router.push('/login')
    }
  }, [])

  if (!mounted) return null

  if (isLogin) {
    return (
      <html lang="es">
        <body className="antialiased">
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="es">
      <body className="antialiased bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
          <div className={cn(
            'flex-1 transition-all duration-300',
            collapsed ? 'ml-20' : 'ml-64'
          )}>
            <Header />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
