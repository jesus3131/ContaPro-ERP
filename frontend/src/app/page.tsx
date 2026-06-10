'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DashboardChart } from '@/components/charts/DashboardChart'
import {
  DollarSign, TrendingUp, TrendingDown, Users, FileText,
  Package, Wallet, BarChart3, Activity, RefreshCw,
  ArrowUpRight, ArrowDownRight, Sparkles, Lightbulb,
} from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [evolution, setEvolution] = useState<any[]>([])
  const [receivable, setReceivable] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const [summary, monthly, ar] = await Promise.all([
        api.dashboard.summary(now.getFullYear(), now.getMonth() + 1),
        api.dashboard.monthlyEvolution(now.getFullYear()),
        api.dashboard.accountsReceivable(),
      ])
      setData(summary)
      setEvolution(monthly)
      setReceivable(ar)
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#062B5B] dark:text-[#6EEB83] mx-auto mb-4" />
          <p className="text-sm text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(data?.invoice_total || 0),
      icon: DollarSign,
      gradient: 'gradient-card-primary',
      subtitle: 'Facturación total',
    },
    {
      title: 'Gastos del Mes',
      value: formatCurrency(data?.total_expenses || 0),
      icon: TrendingDown,
      gradient: 'gradient-card-danger',
      subtitle: 'Costos y gastos',
    },
    {
      title: 'Utilidad Neta',
      value: formatCurrency(data?.net_profit || 0),
      icon: TrendingUp,
      gradient: 'gradient-card-success',
      subtitle: `${data?.profit_margin || 0}% margen`,
    },
    {
      title: 'Clientes Activos',
      value: String(data?.total_clients || 0),
      icon: Users,
      gradient: 'gradient-card-info',
      subtitle: 'Total registrados',
    },
    {
      title: 'Cuentas por Cobrar',
      value: formatCurrency(receivable?.total_receivable || 0),
      icon: Wallet,
      gradient: 'gradient-card-warning',
      subtitle: `${receivable?.overdue_count || 0} vencidas`,
    },
    {
      title: 'Liquidez',
      value: String(data?.liquidity || 0) + 'x',
      icon: BarChart3,
      gradient: 'gradient-card-primary',
      subtitle: 'Capacidad de pago',
    },
  ]

  const indicators = [
    { label: 'Liquidez', value: data?.liquidity || 0, suffix: 'x', trend: 'up' as const },
    { label: 'Margen Utilidad', value: data?.profit_margin || 0, suffix: '%', trend: (data?.profit_margin || 0) > 0 ? 'up' as const : 'down' as const },
    { label: 'Endeudamiento', value: data?.total_liabilities && data?.total_assets ? ((data.total_liabilities / data.total_assets) * 100).toFixed(1) : 0, suffix: '%', trend: 'down' as const },
    { label: 'ROE', value: data?.total_income && data?.total_equity ? ((data.total_income / data.total_equity) * 100).toFixed(1) : 0, suffix: '%', trend: 'up' as const },
  ]

  const recentTransactions = evolution?.slice(-5)?.reverse() || []
  const aiInsights = [
    `Los ingresos del mes son ${formatCurrency(data?.invoice_total || 0)}, un ${data?.profit_margin > 0 ? 'crecimiento positivo' : 'margen por mejorar'} vs el período anterior.`,
    `Cuentas por cobrar: ${formatCurrency(receivable?.total_receivable || 0)} - ${receivable?.overdue_count || 0} facturas están vencidas.`,
    `La liquidez actual de ${data?.liquidity || 0}x indica ${(data?.liquidity || 0) > 1.5 ? 'sólida capacidad de pago' : 'necesidad de mejorar flujo de caja'}.`,
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Dashboard Ejecutivo</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen financiero y contable del período actual</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.title}
            className={`kpi-card ${kpi.gradient} rounded-xl p-4 text-white animate-slide-up stagger-${idx + 1}`}
          >
            <div className="flex items-start justify-between mb-3">
              <kpi.icon className="w-5 h-5 text-white/70" />
              <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Actual</span>
            </div>
            <p className="text-lg font-bold font-heading">{kpi.value}</p>
            <p className="text-xs text-white/80 mt-1 font-medium">{kpi.title}</p>
            <p className="text-[10px] text-white/50 mt-1">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-premium">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Evolución Mensual</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ingresos y gastos del año</p>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#062B5B]" />
                  Ingresos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6EEB83]" />
                  Gastos
                </span>
              </div>
            </div>
          </div>
          <div className="p-2">
            <DashboardChart
              data={evolution}
              type="area"
              xKey="month"
              series={[
                { key: 'total_credits', name: 'Ingresos', color: '#062B5B' },
                { key: 'total_debits', name: 'Gastos', color: '#6EEB83' },
              ]}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-premium">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6EEB83]" />
                <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">ContaPro AI</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {aiInsights.map((insight, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-[#F5F7FA] dark:bg-gray-800/50">
                  <Lightbulb className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Composición Financiera</h3>
            </div>
            <div className="p-2">
              <DashboardChart
                data={[
                  { name: 'Activos', value: data?.total_assets || 0 },
                  { name: 'Pasivos', value: data?.total_liabilities || 0 },
                  { name: 'Patrimonio', value: data?.total_equity || 0 },
                  { name: 'Ingresos', value: data?.total_income || 0 },
                  { name: 'Gastos', value: data?.total_expenses || 0 },
                ]}
                type="pie"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-premium">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Indicadores Financieros</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {indicators.map((indicator) => (
                <div key={indicator.label} className="text-center p-4 rounded-xl bg-[#F5F7FA] dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{indicator.label}</p>
                  <p className="text-2xl font-bold font-heading mt-1 text-[#062B5B] dark:text-white">
                    {indicator.value}{indicator.suffix}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {indicator.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3 text-success" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-danger" />
                    )}
                    <span className={`text-xs ${indicator.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                      {indicator.trend === 'up' ? 'Positivo' : 'Atención'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Últimos Movimientos</h3>
          </div>
          <div className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {recentTransactions.length > 0 ? recentTransactions.map((t: any, i: number) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-[#F5F7FA] dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.total_credits >= t.total_debits ? 'bg-success' : 'bg-warning'}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">Período {t.month}</p>
                      <p className="text-[10px] text-gray-500">{t.total_entries || 0} transacciones</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${t.total_credits >= t.total_debits ? 'text-success' : 'text-warning'}`}>
                    {formatCurrency(t.total_credits - t.total_debits)}
                  </span>
                </div>
              )) : (
                <div className="p-6 text-center text-sm text-gray-400">Sin movimientos recientes</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
