'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DashboardChart } from '@/components/charts/DashboardChart'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, DollarSign, RefreshCw, PieChart, Shield, Activity } from 'lucide-react'

export default function FinancieroPage() {
  const [indicators, setIndicators] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.financial.indicators(2026).then(setIndicators).catch(console.error).finally(() => setLoading(false))
  }, [])

  const indicatorCards = [
    { label: 'Liquidez Corriente', value: indicators?.liquidity?.value || 0, interpretation: indicators?.liquidity?.interpretation || 'Capacidad de pago a corto plazo', icon: Shield, color: '#3b82f6' },
    { label: 'Endeudamiento', value: indicators?.debt_ratio?.value || 0, suffix: '%', interpretation: indicators?.debt_ratio?.interpretation || 'Nivel de apalancamiento', icon: TrendingUp, color: '#f59e0b' },
    { label: 'ROE', value: indicators?.roe?.value || 0, suffix: '%', interpretation: indicators?.roe?.interpretation || 'Rendimiento sobre patrimonio', icon: Activity, color: '#10b981' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-card-primary">
        <div className="page-header-decoration" />
        <div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Módulo Financiero</h1>
                <p className="text-sm text-blue-200">Indicadores, presupuestos y flujo de caja</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="bg-white/10 text-white hover:bg-white/20 border-none">
              <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicatorCards.map((card, i) => (
          <div key={card.label} className="card-premium p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-3xl font-bold font-heading text-gray-900 dark:text-white mt-1">
                  {card.value}{card.suffix || ''}
                </p>
                <p className="text-xs text-gray-500 mt-2">{card.interpretation}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Estructura Financiera</h3>
          </CardHeader>
          <CardContent>
            <DashboardChart
              data={[
                { name: 'Activos', value: indicators?.total_assets || 0 },
                { name: 'Pasivos', value: indicators?.total_liabilities || 0 },
                { name: 'Patrimonio', value: indicators?.total_equity || 0 },
                { name: 'Ingresos', value: indicators?.total_income || 0 },
              ]}
              type="pie"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Resumen de Cuentas</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Total Activos', value: indicators?.total_assets || 0, color: '#062B5B', change: '+12.5%' },
                { name: 'Total Pasivos', value: indicators?.total_liabilities || 0, color: '#FBBF24', change: '-3.2%' },
                { name: 'Patrimonio', value: indicators?.total_equity || 0, color: '#10b981', change: '+8.1%' },
                { name: 'Ingresos', value: indicators?.total_income || 0, color: '#06b6d4', change: '+15.3%' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-[#F5F7FA] dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-sm text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-success ml-2">{item.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
