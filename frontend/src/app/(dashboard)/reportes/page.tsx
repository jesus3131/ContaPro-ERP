'use client'
{/* Página: Reportes
   Propósito: Generación y descarga de reportes financieros y contables con gráficos interactivos
   Módulo: Reportes */}
import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  FileSpreadsheet, FileText, Download,
  BarChart3, TrendingUp, DollarSign, Package, Wallet,
  Eye, EyeOff, AlertCircle, Calendar,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']
const TYPE_COLORS: Record<string, string> = {
  ACTIVO: '#3b82f6', PASIVO: '#f59e0b', PATRIMONIO: '#10b981',
  INGRESO: '#06b6d4', GASTO: '#ef4444', COSTO: '#8b5cf6',
}
const NEEDS_BOTH = ['income-statement', 'cash-flow', 'tax-report']
const NEEDS_END = ['balance-sheet', 'trial-balance']
const NEEDS_NONE = ['accounts-receivable', 'inventory-report', 'payroll-report']

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

function ReportChart({ reportId, chartData, chartLoading, chartError }: {
  reportId: string
  chartData: any[] | null
  chartLoading: boolean
  chartError: string
}) {
  if (chartLoading) return <div className="flex items-center justify-center h-64 text-gray-400"><div className="animate-spin w-6 h-6 border-2 border-[#062B5B] dark:border-[#6EEB83] border-t-transparent rounded-full mr-2" /> Cargando...</div>
  if (chartError) return <div className="flex items-center justify-center h-64 text-red-500 gap-2"><AlertCircle className="w-5 h-5" /> {chartError}</div>
  if (!chartData || chartData.length === 0) return <div className="flex items-center justify-center h-64 text-gray-400">Sin datos disponibles para este período</div>

  if (reportId === 'balance-sheet') {
    const byType = chartData.reduce((acc: any, item: any) => {
      const t = item.type || 'Otros'
      if (!acc[t]) acc[t] = 0
      acc[t] += Math.abs(item.balance || 0)
      return acc
    }, {})
    const pieData = Object.entries(byType).map(([name, value]) => ({ name, value }))
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Distribución por tipo</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {pieData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Detalle por cuenta</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} className="text-xs" />
              <YAxis type="category" dataKey="name" width={120} className="text-xs" tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="balance" name="Saldo" radius={[0, 4, 4, 0]}>
                {chartData.slice(0, 15).map((entry: any, i: number) => (
                  <Cell key={i} fill={TYPE_COLORS[entry.type] || CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (reportId === 'income-statement') {
    const byType = chartData.reduce((acc: any, item: any) => {
      const t = item.type || 'Otros'
      if (!acc[t]) acc[t] = 0
      acc[t] += Math.abs(item.balance || 0)
      return acc
    }, {})
    const barData = Object.entries(byType).map(([name, value]) => ({ name, value }))
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} className="text-xs" />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Monto" radius={[4, 4, 0, 0]}>
              {barData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={barData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
              {barData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (reportId === 'cash-flow') {
    const lineData = chartData.map((item: any, i: number) => ({ name: item.category || item.name || `Item ${i + 1}`, value: item.amount || item.balance || 0 }))
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={lineData}>
          <defs>
            <linearGradient id="cfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} className="text-xs" />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="value" name="Monto" stroke="#06b6d4" fill="url(#cfGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (reportId === 'trial-balance') {
    return (
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 text-xs font-semibold">Código</th>
              <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 text-xs font-semibold">Cuenta</th>
              <th className="text-right px-3 py-2 text-gray-600 dark:text-gray-400 text-xs font-semibold">Débito</th>
              <th className="text-right px-3 py-2 text-gray-600 dark:text-gray-400 text-xs font-semibold">Crédito</th>
              <th className="text-right px-3 py-2 text-gray-600 dark:text-gray-400 text-xs font-semibold">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item: any, i: number) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.code}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.name}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.debit || 0)}</td>
                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.credit || 0)}</td>
                <td className="px-3 py-2 text-right font-medium" style={{ color: (item.balance || 0) >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(item.balance || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (reportId === 'accounts-receivable') {
    const barData = chartData.slice(0, 10).map((item: any) => ({ name: item.name, value: item.credit_limit || 0 }))
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} className="text-xs" />
          <YAxis type="category" dataKey="name" width={140} className="text-xs" tick={{ fontSize: 10 }} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" name="Límite de crédito" fill="#FBBF24" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (reportId === 'inventory-report') {
    const barData = chartData.slice(0, 15).map((item: any) => ({ name: item.name, stock: item.stock || 0, value: (item.stock || 0) * (item.cost || 0) }))
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
          <YAxis className="text-xs" />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Bar dataKey="stock" name="Stock" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="value" name="Valor total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (reportId === 'payroll-report') {
    const barData = chartData.slice(0, 10).map((item: any) => ({ name: item.employee, gross: item.gross || 0, deductions: item.deductions || 0, net: item.net || 0 }))
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
          <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} className="text-xs" />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Bar dataKey="gross" name="Salario bruto" fill="#ec4899" radius={[4, 4, 0, 0]} />
          <Bar dataKey="deductions" name="Deducciones" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="net" name="Neto" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (reportId === 'tax-report') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} className="text-xs" />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar dataKey="debit" name="Débito" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="credit" name="Crédito" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData.map((item: any) => ({ name: item.code, value: Math.abs(item.balance || 0) }))}
              cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
              {chartData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}

export default function ReportesPage() {
  const { toast } = useToast()
  const now = new Date()
  const currentYear = now.getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[] | null>(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState('')
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [useAllYear, setUseAllYear] = useState(true)

  const startDate = `${year}-01-01`
  const endDate = useAllYear
    ? `${year}-12-31`
    : `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`
  const endDateOnly = `${year}-12-31`

  const needsDate = (id: string) => NEEDS_BOTH.includes(id) || NEEDS_END.includes(id)

  const handleDownload = async (reportId: string, format: string) => {
    const key = `${reportId}-${format}`
    setGenerating(key)
    try {
      const s = NEEDS_BOTH.includes(reportId) ? startDate : undefined
      const e = needsDate(reportId) ? (NEEDS_END.includes(reportId) ? endDateOnly : endDate) : undefined
      await api.reports.download(reportId, format, s, e)
      toast('Reporte descargado exitosamente', 'success')
    } catch (err: any) {
      console.error(err)
      toast(err.message || 'Error al descargar reporte', 'error')
    } finally {
      setGenerating(null)
    }
  }

  const handleViewChart = async (reportId: string) => {
    if (selectedReport === reportId) {
      setSelectedReport(null)
      setChartData(null)
      return
    }
    setSelectedReport(reportId)
    setChartLoading(true)
    setChartError('')
    try {
      const s = NEEDS_BOTH.includes(reportId) ? startDate : undefined
      const e = needsDate(reportId) ? (NEEDS_END.includes(reportId) ? endDateOnly : endDate) : undefined
      const data = await api.reports.data(reportId, s, e)
      setChartData(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error(err)
      setChartData(null)
      const msg = err?.detail || err?.message || 'Error al cargar datos del reporte'
      setChartError(msg)
      toast(msg, 'error')
    } finally {
      setChartLoading(false)
    }
  }

  const reports = [
    { id: 'balance-sheet', name: 'Balance General', description: 'Estado de situación financiera de la empresa', icon: BarChart3, color: '#3b82f6' },
    { id: 'income-statement', name: 'Estado de Resultados', description: 'Ingresos, gastos y utilidad del período', icon: TrendingUp, color: '#10b981' },
    { id: 'cash-flow', name: 'Flujo de Efectivo', description: 'Movimientos de efectivo del período', icon: DollarSign, color: '#06b6d4' },
    { id: 'trial-balance', name: 'Balance de Prueba', description: 'Saldos de todas las cuentas contables', icon: FileText, color: '#8b5cf6' },
    { id: 'accounts-receivable', name: 'Cartera', description: 'Cuentas por cobrar a clientes', icon: FileSpreadsheet, color: '#FBBF24' },
    { id: 'inventory-report', name: 'Inventario', description: 'Existencias y valoración de inventario', icon: Package, color: '#f59e0b' },
    { id: 'payroll-report', name: 'Nómina', description: 'Liquidación de nómina y prestaciones', icon: Wallet, color: '#ec4899' },
    { id: 'tax-report', name: 'Impuestos', description: 'IVA, Retención en la fuente e ICA', icon: FileText, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-card-primary">
        <div className="page-header-decoration" /><div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Reportes</h1>
                <p className="text-sm text-blue-200">Genera reportes financieros y contables</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex flex-col text-white text-xs">
                Año
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-white text-xs mt-5">
                <input type="checkbox" checked={useAllYear} onChange={(e) => setUseAllYear(e.target.checked)} className="rounded" />
                Todo el año
              </label>
              {!useAllYear && (
                <label className="flex flex-col text-white text-xs">
                  Mes
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="mt-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map((report, i) => (
          <div key={report.id} className="card-premium animate-slide-up hover:-translate-y-1" style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${report.color}15` }}>
                  <report.icon className="w-5 h-5" style={{ color: report.color }} />
                </div>
                {needsDate(report.id) && <Calendar className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-white mb-1">{report.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{report.description}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm" onClick={() => handleDownload(report.id, 'pdf')} disabled={generating === `${report.id}-pdf`} className="text-xs">
                  <FileText className="w-3 h-3 mr-1" /> PDF
                </Button>
                <Button variant="default" size="sm" onClick={() => handleDownload(report.id, 'excel')} disabled={generating === `${report.id}-excel`} className="text-xs">
                  <Download className="w-3 h-3 mr-1" /> Excel
                </Button>
                <Button variant="default" size="sm" onClick={() => handleDownload(report.id, 'csv')} disabled={generating === `${report.id}-csv`} className="text-xs">
                  CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleViewChart(report.id)} className="text-xs">
                  {selectedReport === report.id ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {selectedReport === report.id ? 'Ocultar' : 'Gráfico'}
                </Button>
              </div>
            </div>
            {selectedReport === report.id && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-5 animate-slide-up">
                <ReportChart reportId={report.id} chartData={chartData} chartLoading={chartLoading} chartError={chartError} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
