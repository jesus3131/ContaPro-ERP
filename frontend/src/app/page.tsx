'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, StatCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardChart } from '@/components/charts/DashboardChart'
import {
  DollarSign, TrendingUp, TrendingDown, Users, FileText,
  Package, Wallet, BarChart3, Activity, RefreshCw,
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
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Ejecutivo</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen financiero y contable</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Activos Totales"
          value={formatCurrency(data?.total_assets || 0)}
          icon={<DollarSign className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          title="Pasivos Totales"
          value={formatCurrency(data?.total_liabilities || 0)}
          icon={<TrendingDown className="w-5 h-5 text-warning" />}
          variant="warning"
        />
        <StatCard
          title="Patrimonio"
          value={formatCurrency(data?.total_equity || 0)}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          variant="success"
        />
        <StatCard
          title="Utilidad Neta"
          value={formatCurrency(data?.net_profit || 0)}
          icon={<Activity className="w-5 h-5 text-info" />}
          trend={data?.profit_margin > 0 ? { value: `${data.profit_margin}% margen`, positive: true } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Facturación del Mes"
          value={formatCurrency(data?.invoice_total || 0)}
          icon={<FileText className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          title="Clientes"
          value={String(data?.total_clients || 0)}
          icon={<Users className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          title="Liquidez"
          value={String(data?.liquidity || 0)}
          icon={<BarChart3 className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          title="Ctas por Cobrar"
          value={formatCurrency(receivable?.total_receivable || 0)}
          icon={<Wallet className="w-5 h-5 text-danger" />}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evolución Mensual</h3>
          </CardHeader>
          <CardContent>
            <DashboardChart
              data={evolution}
              type="area"
              xKey="month"
              series={[
                { key: 'total_debits', name: 'Débitos', color: '#3b82f6' },
                { key: 'total_credits', name: 'Créditos', color: '#10b981' },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Composición Financiera</h3>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Indicadores Financieros</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Liquidez', value: data?.liquidity || 0, suffix: 'x', color: 'text-primary-600' },
              { label: 'Margen de Utilidad', value: data?.profit_margin || 0, suffix: '%', color: 'text-success' },
              { label: 'Endeudamiento', value: data?.total_liabilities && data?.total_assets ? ((data.total_liabilities / data.total_assets) * 100).toFixed(1) : 0, suffix: '%', color: 'text-warning' },
              { label: 'ROE', value: data?.total_income && data?.total_equity ? ((data.total_income / data.total_equity) * 100).toFixed(1) : 0, suffix: '%', color: 'text-info' },
            ].map((indicator) => (
              <div key={indicator.label} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{indicator.label}</p>
                <p className={`text-2xl font-bold mt-1 ${indicator.color}`}>
                  {indicator.value}{indicator.suffix}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
