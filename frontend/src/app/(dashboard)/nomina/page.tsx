'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Calendar, Users, Calculator } from 'lucide-react'

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nómina Electrónica</h1>
          <p className="text-sm text-gray-500 mt-1">Liquidación automática y cumplimiento DIAN</p>
        </div>
        <div className="flex gap-2">
          {!periodId && (
            <Button variant="primary" size="sm" onClick={handleCreatePeriod} disabled={loading}>
              <Calendar className="w-4 h-4 mr-1" /> Crear Período
            </Button>
          )}
          {periodId && settlements.length === 0 && (
            <Button variant="primary" size="sm" onClick={handleSettle} disabled={loading}>
              <Calculator className="w-4 h-4 mr-1" /> Liquidar Nómina
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Empleados</div>
            <div className="text-2xl font-bold mt-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              {settlements.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Total Neto a Pagar</div>
            <div className="text-2xl font-bold mt-1 text-success">{formatCurrency(totalNeto)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Prestaciones Sociales</div>
            <div className="text-2xl font-bold mt-1 text-warning">{formatCurrency(totalPrestaciones)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Parafiscales</div>
            <div className="text-2xl font-bold mt-1 text-info">
              {formatCurrency(settlements.reduce((s, x) => s + (x.severance || 0) * 0.12, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Liquidaciones</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Empleado</th>
                  <th className="text-right px-4 py-3">Salario Bruto</th>
                  <th className="text-right px-4 py-3">Deducciones</th>
                  <th className="text-right px-4 py-3">Neto a Pagar</th>
                  <th className="text-right px-4 py-3">Cesantías</th>
                  <th className="text-right px-4 py-3">Prima</th>
                  <th className="text-right px-4 py-3">Vacaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium">{s.employee}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.gross_salary)}</td>
                    <td className="px-4 py-3 text-right font-mono text-danger">{formatCurrency(s.total_deductions)}</td>
                    <td className="px-4 py-3 text-right font-mono text-success font-bold">{formatCurrency(s.net_payment)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.severance)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.prima)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.vacation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
