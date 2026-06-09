'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText, FileDown, Printer } from 'lucide-react'

const reports = [
  { id: 'balance-sheet', name: 'Balance General', description: 'Estado de situación financiera de la empresa' },
  { id: 'income-statement', name: 'Estado de Resultados', description: 'Ingresos, gastos y utilidad del período' },
  { id: 'cash-flow', name: 'Flujo de Efectivo', description: 'Movimientos de efectivo del período' },
  { id: 'trial-balance', name: 'Balance de Prueba', description: 'Saldos de todas las cuentas contables' },
  { id: 'accounts-receivable', name: 'Cartera', description: 'Cuentas por cobrar a clientes' },
  { id: 'inventory-report', name: 'Inventario', description: 'Existencias y valoración de inventario' },
  { id: 'payroll-report', name: 'Nómina', description: 'Liquidación de nómina y prestaciones' },
  { id: 'tax-report', name: 'Impuestos', description: 'IVA, Retención en la fuente e ICA' },
]

export default function ReportesPage() {
  const [generating, setGenerating] = useState<string | null>(null)

  const handleDownload = async (reportId: string, format: string) => {
    setGenerating(`${reportId}-${format}`)
    try {
      const params = new URLSearchParams({
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        format,
      })
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api/v1'}/reports/${reportId}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportId}.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">Genera reportes financieros y contables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{report.name}</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{report.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(report.id, 'pdf')}
                  disabled={generating === `${report.id}-pdf`}
                >
                  <FileText className="w-4 h-4 mr-1" /> PDF
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(report.id, 'excel')}
                  disabled={generating === `${report.id}-excel`}
                >
                  <FileDown className="w-4 h-4 mr-1" /> Excel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(report.id, 'csv')}
                  disabled={generating === `${report.id}-csv`}
                >
                  CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
