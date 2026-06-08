'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, RefreshCw, FileText, Download } from 'lucide-react'

export default function ContabilidadPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const loadData = async () => {
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
  }

  useEffect(() => { loadData() }, [])

  const handleSeedPuc = async () => {
    try {
      await api.accounting.seedPuc()
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contabilidad</h1>
          <p className="text-sm text-gray-500 mt-1">Plan Único de Cuentas y Comprobantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleSeedPuc}>
            <BookOpen className="w-4 h-4 mr-1" /> Cargar PUC
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nuevo Comprobante
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Total Cuentas</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{accounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Comprobantes</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{entries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Cuentas con Movimiento</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {accounts.filter(a => a.accepts_movements).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Plan de Cuentas (PUC)</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 font-mono text-xs">{acc.code}</td>
                      <td className="px-4 py-2.5 text-gray-900 dark:text-white" style={{ paddingLeft: `${12 + (acc.level - 1) * 16}px` }}>
                        {acc.name}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">
                        <span className={acc.current_balance >= 0 ? 'text-success' : 'text-danger'}>
                          {formatCurrency(acc.current_balance)}
                        </span>
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
            <h3 className="text-lg font-semibold">Últimos Comprobantes</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.entry_number}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{entry.description || entry.entry_type}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>Débitos: {formatCurrency(entry.details?.reduce((s: number, d: any) => s + d.debit, 0) || 0)}</span>
                    <span>Créditos: {formatCurrency(entry.details?.reduce((s: number, d: any) => s + d.credit, 0) || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
