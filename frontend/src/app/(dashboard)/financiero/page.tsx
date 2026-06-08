'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DashboardChart } from '@/components/charts/DashboardChart'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, DollarSign, RefreshCw } from 'lucide-react'

export default function FinancieroPage() {
  const [indicators, setIndicators] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.financial.indicators(2026).then(setIndicators).catch(console.error).finally(() => setLoading(false))
  }, [])

  const indicatorCards = [
    { label: 'Liquidez Corriente', value: indicators?.liquidity?.value || 0, interpretation: indicators?.liquidity?.interpretation || '', icon: DollarSign },
    { label: 'Endeudamiento', value: indicators?.debt_ratio?.value || 0, suffix: '%', interpretation: indicators?.debt_ratio?.interpretation || '', icon: TrendingUp },
    { label: 'ROE', value: indicators?.roe?.value || 0, suffix: '%', interpretation: indicators?.roe?.interpretation || '', icon: BarChart3 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Módulo Financiero</h1>
          <p className="text-sm text-gray-500 mt-1">Indicadores, presupuestos y flujo de caja</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicatorCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold mt-1 text-primary-600">
                    {card.value}{card.suffix || ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{card.interpretation}</p>
                </div>
                <card.icon className="w-8 h-8 text-primary-200 dark:text-primary-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Estructura Financiera</h3>
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
            <h3 className="text-lg font-semibold">Indicadores Clave</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Total Activos', value: indicators?.total_assets || 0, color: 'text-primary-600' },
                { name: 'Total Pasivos', value: indicators?.total_liabilities || 0, color: 'text-warning' },
                { name: 'Patrimonio', value: indicators?.total_equity || 0, color: 'text-success' },
                { name: 'Ingresos', value: indicators?.total_income || 0, color: 'text-info' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className={`font-bold font-mono ${item.color}`}>{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
