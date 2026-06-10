'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Calendar, Users, Calculator, DollarSign, TrendingUp, Clock, Briefcase } from 'lucide-react'

export default function NominaPage() {
  const [periodId, setPeriodId] = useState<number | null>(null)
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleCreatePeriod = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const res = await api.payroll.createPeriod(now.getFullYear(), now.getMonth() + 1)
      setPeriodId(res.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSettle = async () => {
    if (!periodId) return
    setLoading(true)
    try {
      await api.payroll.settle(periodId)
      const s = await api.payroll.getSettlements(periodId)
      setSettlements(s)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalNeto = settlements.reduce((s, x) => s + x.net_payment, 0)
  const totalPrestaciones = settlements.reduce((s, x) => s + x.severance + x.prima + x.vacation, 0)
  const totalDeducciones = settlements.reduce((s, x) => s + x.total_deductions, 0)
  const totalBruto = settlements.reduce((s, x) => s + x.gross_salary, 0)

  const stats = [
    { label: 'Empleados', value: settlements.length, icon: Users, color: '#3b82f6' },
    { label: 'Total Neto a Pagar', value: formatCurrency(totalNeto), icon: DollarSign, color: '#10b981' },
    { label: 'Prestaciones Sociales', value: formatCurrency(totalPrestaciones), icon: TrendingUp, color: '#FBBF24' },
    { label: 'Deducciones', value: formatCurrency(totalDeducciones), icon: Clock, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-card-success">
        <div className="page-header-decoration" />
        <div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Nómina Electrónica</h1>
                <p className="text-sm text-green-200">Liquidación automática y cumplimiento DIAN</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!periodId && (
                <Button variant="primary" size="sm" onClick={handleCreatePeriod} disabled={loading} className="bg-white text-[#062B5B] hover:bg-gray-100 border-none">
                  <Calendar className="w-4 h-4 mr-1" /> Crear Período
                </Button>
              )}
              {periodId && settlements.length === 0 && (
                <Button variant="primary" size="sm" onClick={handleSettle} disabled={loading} className="bg-white text-[#062B5B] hover:bg-gray-100 border-none">
                  <Calculator className="w-4 h-4 mr-1" /> Liquidar Nómina
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="card-premium p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Liquidaciones</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th className="text-right">Salario Bruto</th>
                  <th className="text-right">Deducciones</th>
                  <th className="text-right">Neto a Pagar</th>
                  <th className="text-right">Cesantías</th>
                  <th className="text-right">Prima</th>
                  <th className="text-right">Vacaciones</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.employee}</td>
                    <td className="text-right font-mono">{formatCurrency(s.gross_salary)}</td>
                    <td className="text-right font-mono text-danger">{formatCurrency(s.total_deductions)}</td>
                    <td className="text-right font-mono text-success font-bold">{formatCurrency(s.net_payment)}</td>
                    <td className="text-right font-mono">{formatCurrency(s.severance)}</td>
                    <td className="text-right font-mono">{formatCurrency(s.prima)}</td>
                    <td className="text-right font-mono">{formatCurrency(s.vacation)}</td>
                  </tr>
                ))}
                {settlements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      <div className="mb-2">No hay liquidaciones</div>
                      <p className="text-xs">Crea un período y liquida la nómina para ver resultados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
