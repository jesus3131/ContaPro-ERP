'use client'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { Receipt, Plus, Send, CheckCircle, XCircle, RefreshCw, FileText, DollarSign, Clock, Ban } from 'lucide-react'

export default function FacturacionPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.invoicing.list()
      setInvoices(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInvoices() }, [loadInvoices])

  const handleSendDian = async (id: number) => {
    try {
      await api.invoicing.sendDian(id)
      loadInvoices()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm('¿Anular esta factura?')) return
    try {
      await api.invoicing.cancel(id)
      loadInvoices()
    } catch (err) {
      console.error(err)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'badge badge-warning',
      Sent: 'badge badge-info',
      Validated: 'badge badge-success',
      Rejected: 'badge badge-danger',
      Cancelled: 'badge badge-danger',
    }
    return map[status] || 'badge badge-primary'
  }

  const dianStatusIcon = (status: string) => {
    if (status === 'Validated') return <CheckCircle className="w-5 h-5 text-success" />
    if (status === 'Rejected') return <XCircle className="w-5 h-5 text-danger" />
    return <span className="text-xs text-gray-400">{status || 'Pendiente'}</span>
  }

  const stats = [
    { label: 'Total Facturas', value: invoices.length, icon: FileText, color: '#3b82f6' },
    { label: 'Total Facturado', value: formatCurrency(invoices.reduce((s, i) => s + i.total, 0)), icon: DollarSign, color: '#10b981' },
    { label: 'Enviadas DIAN', value: invoices.filter(i => i.dian_status === 'Sent' || i.dian_status === 'Validated').length, icon: Send, color: '#06b6d4' },
    { label: 'Pendientes', value: invoices.filter(i => i.status === 'Draft').length, icon: Clock, color: '#FBBF24' },
  ]

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header gradient-card-info">
          <div className="page-header-decoration" /><div className="page-header-decoration-2" />
          <div className="page-header-content"><div className="h-8 w-56 bg-white/20 rounded-lg animate-pulse" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-premium p-5 animate-pulse">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-card-info">
        <div className="page-header-decoration" /><div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Facturación Electrónica</h1>
                <p className="text-sm text-cyan-200">Gestión de facturas y cumplimiento DIAN</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={loadInvoices} className="bg-white/10 text-white hover:bg-white/20 border-none">
                <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
              </Button>
              <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="bg-[#6EEB83] text-[#062B5B] hover:bg-[#5ce073] border-none">
                <Plus className="w-4 h-4 mr-1" /> Nueva Factura
              </Button>
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
          <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Listado de Facturas</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th># Factura</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th className="text-right">Total</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">DIAN</th>
                  <th className="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs font-semibold">{inv.prefix}-{inv.invoice_number}</td>
                    <td className="font-medium">{inv.client_name || 'N/A'}</td>
                    <td className="text-gray-500">{formatDate(inv.issue_date)}</td>
                    <td className="text-right font-bold font-mono">{formatCurrency(inv.total)}</td>
                    <td className="text-center">
                      <span className={statusBadge(inv.status)}>
                        {inv.status === 'Draft' ? 'Borrador' : inv.status === 'Cancelled' ? 'Anulada' : inv.status}
                      </span>
                    </td>
                    <td className="text-center">{dianStatusIcon(inv.dian_status)}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {inv.status === 'Draft' && (
                          <>
                            <button onClick={() => handleSendDian(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600" title="Enviar a DIAN">
                              <Send className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleCancel(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500" title="Anular">
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">No hay facturas creadas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Factura Electrónica" size="xl">
        <InvoiceForm onSuccess={() => { setModalOpen(false); loadInvoices() }} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
