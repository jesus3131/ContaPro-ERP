'use client'
{/* Página: Login / Registro
   Propósito: Autenticación de usuarios con formularios de inicio de sesión y registro de empresa
   Módulo: Autenticación */}
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Sparkles, Shield, Zap, BarChart3 } from 'lucide-react'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
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
      localStorage.removeItem('companyId')
      localStorage.setItem('token', res.access_token)
      router.push('/select-company')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.auth.register({
        username,
        email,
        full_name: fullName,
        password,
      })
      localStorage.removeItem('companyId')
      localStorage.setItem('token', res.access_token)
      router.push('/select-company')
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="hidden lg:flex flex-1 gradient-primary relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#6EEB83]/5" />
          <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-[#6EEB83]/30 animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-[#6EEB83]/20 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-[#6EEB83] to-[#3ce057] rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30">
              <span className="text-[#062B5B] font-extrabold text-xl font-heading">CP</span>
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">ContaPro ERP</h1>
              <p className="text-green-300 text-sm font-medium">Colombia</p>
            </div>
          </div>
          <h2 className="text-4xl font-heading font-bold text-white mb-6 leading-tight">
            El ERP inteligente para <br />
            <span className="text-[#6EEB83]">tu empresa colombiana</span>
          </h2>
          <p className="text-blue-200 mb-12 leading-relaxed text-lg">
            Contabilidad NIIF, facturación electrónica DIAN, nómina, inventarios e IA integrada.
            Todo en una plataforma moderna, segura y multiempresa.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, text: 'Cumplimiento DIAN' },
              { icon: Zap, text: 'NIIF & Pymes' },
              { icon: Sparkles, text: 'IA Integrada' },
              { icon: BarChart3, text: 'Multiempresa' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <Icon className="w-5 h-5 text-[#6EEB83]" />
                <span className="text-sm text-blue-100">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-[#062B5B] to-[#0a3d7a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-extrabold text-xl font-heading">CP</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">ContaPro ERP</h2>
            <p className="text-sm text-gray-500 mt-1">Ingresa a tu empresa</p>
          </div>

          <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => { setTab('login'); setError('') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setTab('register'); setError('') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                {error}
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-premium"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-premium"
                placeholder={tab === 'login' ? 'usuario@ejemplo.com' : 'usuario'}
                required
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-10"
                  placeholder="••••••••"
                  minLength={tab === 'register' ? 6 : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full h-11" disabled={loading}>
              {loading ? 'Procesando...' : tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-xs text-gray-400">
              {tab === 'login' ? (
                <>¿Primera vez?{' '}
                  <button onClick={() => { setTab('register'); setError('') }} className="text-[#062B5B] dark:text-[#6EEB83] hover:underline font-medium">
                    Registra tu empresa
                  </button>
                </>
              ) : (
                <>¿Ya tienes cuenta?{' '}
                  <button onClick={() => { setTab('login'); setError('') }} className="text-[#062B5B] dark:text-[#6EEB83] hover:underline font-medium">
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
