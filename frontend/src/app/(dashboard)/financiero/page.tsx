'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DashboardChart } from '@/components/charts/DashboardChart'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { BarChart3, TrendingUp, DollarSign, RefreshCw, PieChart, Shield, Activity, BarChart, LineChart } from 'lucide-react'

export default function FinancieroPage() {
  const { toast } = useToast()
  const [indicators, setIndicators] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.financial.indicators(new Date().getFullYear()),
      api.dashboard.monthlyEvolution(new Date().getFullYear()).catch(() => []),
    ]).then(([ind, monthly]) => {
      setIndicators(ind)
      setMonthlyData(Array.isArray(monthly) ? monthly : [])
    }).catch((err) => {
      console.error(err)
      toast(err?.detail || 'Error al cargar indicadores financieros', 'error')
    }).finally(() => setLoading(false))
  }, [])

  const indicatorCards = [
    { label: 'Liquidez Corriente', value: indicators?.liquidity?.value ?? 0, format: (v: number) => `$${v.toFixed(2)}`, interpretation: indicators?.liquidity?.interpretation || 'Capacidad de pago a corto plazo', icon: Shield, color: '#3b82f6', ok: (indicators?.liquidity?.value ?? 0) >= 1 },
    { label: 'Endeudamiento', value: indicators?.debt_ratio?.value ?? 0, format: (v: number) => `${v.toFixed(1)}%`, interpretation: indicators?.debt_ratio?.interpretation || 'Nivel de apalancamiento', icon: TrendingUp, color: '#f59e0b', ok: (indicators?.debt_ratio?.value ?? 0) < 60 },
    { label: 'ROE', value: indicators?.roe?.value ?? 0, format: (v: number) => `${v.toFixed(1)}%`, interpretation: indicators?.roe?.interpretation || 'Rendimiento sobre patrimonio', icon: Activity, color: '#10b981', ok: (indicators?.roe?.value ?? 0) > 0 },
  ]

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header gradient-card-primary">
          <div className="page-header-decoration" /><div className="page-header-decoration-2" />
          <div className="page-header-content">
            <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-premium p-5 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-premium p-5 animate-pulse"><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" /></div>
          <div className="card-premium p-5 animate-pulse"><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" /></div>
        </div>
      </div>
    )
  }

  if (!indicators) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2">Error al cargar indicadores</h2>
          <p className="text-sm text-gray-500 mb-4">No se pudieron obtener los datos financieros. Verifica que el backend esté corriendo.</p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-card-primary">
        <div className="page-header-decoration" /><div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Módulo Financiero</h1>
                <p className="text-sm text-blue-200">Indicadores, estructura financiera y flujo de caja</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { window.location.reload() }} className="bg-white/10 text-white hover:bg-white/20 border-none">
              <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicatorCards.map((card, i) => (
          <div key={card.label} className={`card-premium p-5 animate-slide-up border-l-4 ${card.ok ? 'border-l-success' : 'border-l-danger'}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-3xl font-bold font-heading mt-1 ${card.ok ? 'text-gray-900 dark:text-white' : 'text-danger'}`}>
                  {card.format(card.value)}
                </p>
                <p className="text-xs text-gray-500 mt-2">{card.interpretation}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-6 h-6" style={{ color: card.ok ? card.color : '#ef4444' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Estructura Financiera</h3>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button onClick={() => setChartType('pie')} className={`p-1.5 rounded-md transition-all ${chartType === 'pie' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Gráfico circular">
                  <PieChart className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="Gráfico de barras">
                  <BarChart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardChart
              data={[
                { name: 'Activos', value: indicators?.total_assets || 0 },
                { name: 'Pasivos', value: indicators?.total_liabilities || 0 },
                { name: 'Patrimonio', value: indicators?.total_equity || 0 },
                { name: 'Ingresos', value: indicators?.total_income || 0 },
              ]}
              type={chartType}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Evolución Mensual</h3>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <DashboardChart data={monthlyData} type="area" xKey="month" series={[{ key: 'income', name: 'Ingresos', color: '#10b981' }, { key: 'expenses', name: 'Gastos', color: '#ef4444' }]} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No hay datos de evolución mensual</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Resumen de Cuentas</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Total Activos', value: indicators?.total_assets || 0, color: '#062B5B' },
                { name: 'Total Pasivos', value: indicators?.total_liabilities || 0, color: '#FBBF24' },
                { name: 'Patrimonio', value: indicators?.total_equity || 0, color: '#10b981' },
                { name: 'Ingresos', value: indicators?.total_income || 0, color: '#06b6d4' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-[#F5F7FA] dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-sm text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Flujo de Caja</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Total Ingresos', value: indicators?.total_income || 0, color: '#10b981' },
                { name: 'Total Activos', value: indicators?.total_assets || 0, color: '#3b82f6' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-[#F5F7FA] dark:bg-gray-800/50">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  <span className="font-bold font-mono text-sm" style={{ color: item.color }}>{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Razón de Liquidez</span>
                  <span className={`font-bold font-mono text-sm ${(indicators?.liquidity?.value ?? 0) >= 1 ? 'text-success' : 'text-danger'}`}>
                    {(indicators?.liquidity?.value ?? 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{indicatorCards[0].interpretation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
