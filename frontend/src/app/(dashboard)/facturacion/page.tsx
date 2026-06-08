'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Receipt, Plus, Send, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function FacturacionPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const data = await api.invoicing.list()
      setInvoices(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInvoices() }, [])

  const handleSendDian = async (id: number) => {
    try {
      await api.invoicing.sendDian(id)
      loadInvoices()
    } catch (err) {
      console.error(err)
    }
  }

  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700',
    Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Validated: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturación Electrónica</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de facturas y cumplimiento DIAN</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadInvoices}>
            <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Nueva Factura
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Total Facturas</div>
            <div className="text-2xl font-bold mt-1">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Total Facturado</div>
            <div className="text-2xl font-bold mt-1 text-success">
              {formatCurrency(invoices.reduce((s, i) => s + i.total, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Enviadas DIAN</div>
            <div className="text-2xl font-bold mt-1 text-primary-600">
              {invoices.filter(i => i.dian_status === 'Sent' || i.dian_status === 'Validated').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Pendientes</div>
            <div className="text-2xl font-bold mt-1 text-warning">
              {invoices.filter(i => i.status === 'Draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Listado de Facturas</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"># Factura</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">DIAN</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-mono text-xs">{inv.prefix}-{inv.invoice_number}</td>
                    <td className="px-4 py-3">{inv.client_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.issue_date)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status] || 'bg-gray-100'}`}>
                        {inv.status === 'Draft' ? 'Borrador' : inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {inv.dian_status === 'Validated' ? (
                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                      ) : inv.dian_status === 'Rejected' ? (
                        <XCircle className="w-5 h-5 text-danger mx-auto" />
                      ) : (
                        <span className="text-xs text-gray-400">{inv.dian_status || 'Pendiente'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {inv.status === 'Draft' && (
                        <Button variant="ghost" size="sm" onClick={() => handleSendDian(inv.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No hay facturas creadas
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
