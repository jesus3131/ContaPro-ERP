'use client'
{/* Página: Selección de empresa para multiempresa
   Propósito: Permite elegir la empresa activa después del login y antes de acceder al dashboard */}
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Building, ArrowRightCircle, RefreshCw } from 'lucide-react'

export default function SelectCompanyPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const loadCompanies = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.auth.companies()
      setCompanies(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'No se pudo obtener las empresas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCompanies() }, [])

  const handleSelect = (companyId: number) => {
    api.auth.selectCompany(companyId)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-[#062B5B] dark:text-[#6EEB83] mx-auto mb-4" />
          <p className="text-sm text-gray-500">Cargando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-8 py-8 text-center bg-gradient-to-r from-[#062B5B] to-[#6EEB83] text-white">
          <Building className="w-10 h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold">Selecciona tu empresa</h1>
          <p className="text-sm text-white/80 mt-2">Elige la empresa con la que deseas trabajar hoy.</p>
        </div>

        <div className="p-6 space-y-6">
          {error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-xl">
              {error}
            </div>
          ) : null}

          {companies.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No se encontraron empresas asociadas a este usuario.
            </div>
          ) : (
            <div className="grid gap-4">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSelect(company.id)}
                  className="rounded-3xl border border-gray-200 dark:border-gray-700 p-5 text-left transition hover:border-[#062B5B] dark:hover:border-[#6EEB83] bg-gray-50 dark:bg-gray-950"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{company.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">NIT: {company.nit}</p>
                    </div>
                    <ArrowRightCircle className="w-6 h-6 text-[#062B5B] dark:text-[#6EEB83]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
