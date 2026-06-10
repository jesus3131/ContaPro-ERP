'use client'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { EntryForm } from '@/components/forms/EntryForm'
import { BookOpen, Plus, RefreshCw, FileText, DollarSign, Layers, TrendingUp } from 'lucide-react'

export default function ContabilidadPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [accts, ents] = await Promise.all([
        api.accounting.getPuc(),
        api.accounting.getEntries(),
      ])
      setAccounts(accts)
      setEntries(ents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSeedPuc = async () => {
    try {
      await api.accounting.seedPuc()
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const stats = [
    { label: 'Cuentas Contables', value: accounts.length, icon: Layers, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Comprobantes', value: entries.length, icon: FileText, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Cuentas con Movimiento', value: accounts.filter(a => a.accepts_movements).length, icon: TrendingUp, color: '#10b981', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Débitos', value: formatCurrency(entries.reduce((s, e) => s + (e.details?.reduce((sd: number, d: any) => sd + d.debit, 0) || 0), 0)), icon: DollarSign, color: '#f59e0b', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-primary">
        <div className="page-header-decoration" /><div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Contabilidad</h1>
                <p className="text-sm text-blue-200">Plan Único de Cuentas y Comprobantes Contables</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSeedPuc} className="bg-white/10 text-white hover:bg-white/20 border-none">
                <BookOpen className="w-4 h-4 mr-1" /> Cargar PUC
              </Button>
              <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} className="bg-[#6EEB83] text-[#062B5B] hover:bg-[#5ce073] border-none">
                <Plus className="w-4 h-4 mr-1" /> Nuevo Comprobante
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
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Plan de Cuentas (PUC)</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th className="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id}>
                      <td className="font-mono text-xs text-gray-500">{acc.code}</td>
                      <td className="text-gray-900 dark:text-white" style={{ paddingLeft: `${16 + (acc.level - 1) * 16}px` }}>
                        {acc.name}
                      </td>
                      <td className={`text-right font-mono text-sm font-medium ${acc.current_balance >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(acc.current_balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Últimos Comprobantes</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {entries.slice(0, 8).map((entry) => (
                <div key={entry.id} className="px-5 py-3.5 hover:bg-[#F5F7FA] dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.entry_number}</span>
                    <span className="badge badge-primary">{entry.entry_type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{entry.description || 'Sin descripción'}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{formatDate(entry.date)}</span>
                    <div className="flex gap-4">
                      <span className="text-success font-medium">D: {formatCurrency(entry.details?.reduce((s: number, d: any) => s + d.debit, 0) || 0)}</span>
                      <span className="text-warning font-medium">C: {formatCurrency(entry.details?.reduce((s: number, d: any) => s + d.credit, 0) || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">No hay comprobantes registrados</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Comprobante Contable" size="xl">
        <EntryForm onSuccess={() => { setModalOpen(false); loadData() }} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
