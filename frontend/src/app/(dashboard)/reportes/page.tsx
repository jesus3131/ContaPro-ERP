'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText, FileDown, Printer, Download, Eye, BarChart3, TrendingUp, DollarSign, Package, Wallet } from 'lucide-react'

export default function ReportesPage() {
  const [generating, setGenerating] = useState<string | null>(null)

  const handleDownload = async (reportId: string, format: string) => {
    const key = `${reportId}-${format}`
    setGenerating(key)
    try {
      await api.reports.download(reportId, format, '2026-01-01', '2026-12-31')
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(null)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Reportes</h1>
                <p className="text-sm text-blue-200">Genera reportes financieros y contables</p>
              </div>
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
              </div>
              <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-white mb-1">{report.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{report.description}</p>
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={() => handleDownload(report.id, 'pdf')} disabled={generating === `${report.id}-pdf`} className="text-xs">
                  <FileText className="w-3 h-3 mr-1" /> PDF
                </Button>
                <Button variant="default" size="sm" onClick={() => handleDownload(report.id, 'excel')} disabled={generating === `${report.id}-excel`} className="text-xs">
                  <Download className="w-3 h-3 mr-1" /> Excel
                </Button>
                <Button variant="default" size="sm" onClick={() => handleDownload(report.id, 'csv')} disabled={generating === `${report.id}-csv`} className="text-xs">
                  CSV
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
