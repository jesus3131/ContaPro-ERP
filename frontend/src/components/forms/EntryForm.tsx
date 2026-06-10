'use client'
{/* Componente: EntryForm
   Propósito: Formulario de asiento contable: crear/editar asientos contables */}
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BookOpen, Save, Loader2, Plus, Trash2 } from 'lucide-react'

interface EntryFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface DetailLine {
  id: string
  account_id: number
  nature: 'Debito' | 'Credito'
  debit: number
  credit: number
  description: string
}

export function EntryForm({ onSuccess, onCancel }: EntryFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [form, setForm] = useState({
    entry_type: 'Comprobante Diario',
    date: new Date().toISOString().split('T')[0],
    description: '',
    document_type: '',
    document_number: '',
  })
  const [details, setDetails] = useState<DetailLine[]>([
    { id: crypto.randomUUID?.() || Math.random().toString(), account_id: 0, nature: 'Debito', debit: 0, credit: 0, description: '' },
    { id: crypto.randomUUID?.() || Math.random().toString(), account_id: 0, nature: 'Credito', debit: 0, credit: 0, description: '' },
  ])

  useEffect(() => {
    api.accounting.getPuc().then(setAccounts).catch(() => {})
  }, [])

  const totalDebit = details.reduce((s, d) => s + d.debit, 0)
  const totalCredit = details.reduce((s, d) => s + d.credit, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const addDetail = () => setDetails(prev => [...prev, {
    id: crypto.randomUUID?.() || Math.random().toString(), account_id: 0, nature: 'Debito', debit: 0, credit: 0, description: '',
  }])

  const removeDetail = (id: string) => {
    if (details.length <= 2) return
    setDetails(prev => prev.filter(d => d.id !== id))
  }

  const updateDetail = (id: string, field: string, value: any) => {
    setDetails(prev => prev.map(d => {
      if (d.id !== id) return d
      const updated = { ...d, [field]: value }
      if (field === 'nature') {
        updated.debit = value === 'Debito' ? (updated.debit || 0) : 0
        updated.credit = value === 'Credito' ? (updated.credit || 0) : 0
      }
      return updated
    }))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isBalanced) { setError('El comprobante no está balanceado (Débitos ≠ Créditos)'); return }
    if (details.some(d => !d.account_id)) { setError('Selecciona una cuenta para cada línea'); return }
    setSaving(true)
    setError('')
    try {
      await api.accounting.createEntry({
        ...form,
        details: details.map(d => ({
          account_id: d.account_id,
          nature: d.nature,
          debit: d.debit,
          credit: d.credit,
          description: d.description || undefined,
        })),
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear comprobante')
    } finally {
      setSaving(false)
    }
  }, [form, details, isBalanced, onSuccess])

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo *</label>
          <select className="input-premium" value={form.entry_type} onChange={(e) => update('entry_type', e.target.value)}>
            <option value="Comprobante Diario">Comprobante Diario</option>
            <option value="Comprobante de Ingreso">Comprobante de Ingreso</option>
            <option value="Comprobante de Egreso">Comprobante de Egreso</option>
            <option value="Comprobante de Apertura">Comprobante de Apertura</option>
            <option value="Comprobante de Cierre">Comprobante de Cierre</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha *</label>
          <input type="date" className="input-premium" value={form.date} onChange={(e) => update('date', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Documento</label>
          <input className="input-premium" value={form.document_number} onChange={(e) => update('document_number', e.target.value)} placeholder="Ej: FAC-001" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción *</label>
        <textarea className="input-premium min-h-[60px]" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Descripción del comprobante" required />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Detalle (Débitos / Créditos)</label>
          <Button type="button" variant="ghost" size="sm" onClick={addDetail}>
            <Plus className="w-4 h-4 mr-1" /> Agregar Línea
          </Button>
        </div>
        <div className="text-xs text-gray-500 mb-2 flex gap-2">
          <span className={`font-semibold ${isBalanced ? 'text-success' : 'text-danger'}`}>
            Débitos: {formatCurrency(totalDebit)}
          </span>
          <span className="text-gray-300">|</span>
          <span className={`font-semibold ${isBalanced ? 'text-success' : 'text-danger'}`}>
            Créditos: {formatCurrency(totalCredit)}
          </span>
          {!isBalanced && <span className="text-danger font-semibold">✗ No balanceado</span>}
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
          {details.map((det) => (
            <div key={det.id} className="flex gap-2 items-start p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="w-32 space-y-1.5">
                <select className="input-premium text-sm py-1.5" value={det.account_id} onChange={(e) => updateDetail(det.id, 'account_id', parseInt(e.target.value))}>
                  <option value={0}>Cuenta...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div className="w-24 space-y-1.5">
                <select className="input-premium text-sm py-1.5" value={det.nature} onChange={(e) => updateDetail(det.id, 'nature', e.target.value)}>
                  <option value="Debito">Débito</option>
                  <option value="Credito">Crédito</option>
                </select>
              </div>
              <div className="w-28 space-y-1.5">
                <input type="number" step="0.01" className="input-premium text-sm py-1.5 text-right" value={det.nature === 'Debito' ? det.debit : det.credit} onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  updateDetail(det.id, det.nature === 'Debito' ? 'debit' : 'credit', val)
                }} placeholder="Valor" />
              </div>
              <div className="flex-1 space-y-1.5">
                <input className="input-premium text-sm py-1.5" value={det.description} onChange={(e) => updateDetail(det.id, 'description', e.target.value)} placeholder="Descripción (opcional)" />
              </div>
              {details.length > 2 && (
                <button type="button" onClick={() => removeDetail(det.id)} className="pt-1 text-gray-400 hover:text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="default" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving || !isBalanced}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <BookOpen className="w-4 h-4 mr-1" />}
          Crear Comprobante
        </Button>
      </div>
    </form>
  )
}
