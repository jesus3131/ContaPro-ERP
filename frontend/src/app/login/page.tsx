'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Eye, EyeOff, Briefcase } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.auth.login({ username, password })
      localStorage.setItem('token', res.access_token)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-5xl flex items-center gap-12">
        <div className="hidden lg:flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ContaPro ERP</h1>
              <p className="text-sm text-gray-500">Colombia</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Software Contable y Administrativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Gestión financiera, contabilidad NIIF, facturación electrónica DIAN,
            nómina electrónica, inventarios y más. Todo en una plataforma moderna e inteligente.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {['Cumplimiento DIAN', 'NIIF & Pymes', 'IA Integrada', 'Multiempresa'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <Card className="flex-1 max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <BookOpen className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h2>
              <p className="text-sm text-gray-500 mt-1">Ingresa a tu empresa</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-4">
                <a href="#" className="text-primary-600 hover:text-primary-500">¿Olvidaste tu contraseña?</a>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-400">
                © 2026 ContaPro ERP Colombia. Todos los derechos reservados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
