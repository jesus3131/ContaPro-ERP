'use client'
{/* Componente: InvoiceForm
   Propósito: Formulario de factura: crear/editar facturas con items */}
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Receipt, Save, Loader2, Plus, Trash2 } from 'lucide-react'

interface InvoiceFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  discount: number
  tax_percentage: number
}

export function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [form, setForm] = useState({
    client_id: 0, invoice_type: 'FVE', prefix: 'FVE',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '', payment_method: '', payment_form: '', notes: '',
  })
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID?.() || Math.random().toString(), description: '', quantity: 1, unit_price: 0, discount: 0, tax_percentage: 19 },
  ])

  useEffect(() => {
    api.clients.list().then(setClients).catch(() => {})
  }, [])

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price - it.discount, 0)
  const tax = items.reduce((s, it) => s + (it.quantity * it.unit_price - it.discount) * it.tax_percentage / 100, 0)
  const total = subtotal + tax

  const addItem = () => setItems(prev => [...prev, {
    id: crypto.randomUUID?.() || Math.random().toString(), description: '', quantity: 1, unit_price: 0, discount: 0, tax_percentage: 19,
  }])

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const updateItem = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id) { setError('Selecciona un cliente'); return }
    if (items.some(i => !i.description)) { setError('Todas las líneas deben tener descripción'); return }
    setSaving(true)
    setError('')
    try {
      await api.invoicing.create({
        ...form,
        issue_date: form.issue_date,
        due_date: form.due_date || undefined,
        items: items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount,
          tax_percentage: i.tax_percentage,
        })),
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear factura')
    } finally {
      setSaving(false)
    }
  }, [form, items, onSuccess])

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cliente *</label>
          <select className="input-premium" value={form.client_id} onChange={(e) => update('client_id', parseInt(e.target.value))} required>
            <option value={0}>Seleccionar cliente...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.business_name || `${c.first_name} ${c.last_name}`} - {c.document_number}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</label>
            <select className="input-premium" value={form.invoice_type} onChange={(e) => update('invoice_type', e.target.value)}>
              <option value="FVE">Factura Venta Electrónica</option>
              <option value="NC">Nota Crédito</option>
              <option value="ND">Nota Débito</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prefijo</label>
            <input className="input-premium" value={form.prefix} onChange={(e) => update('prefix', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha Emisión *</label>
          <input type="date" className="input-premium" value={form.issue_date} onChange={(e) => update('issue_date', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha Vencimiento</label>
          <input type="date" className="input-premium" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Método Pago</label>
          <select className="input-premium" value={form.payment_method} onChange={(e) => update('payment_method', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Cheque">Cheque</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notas</label>
        <textarea className="input-premium min-h-[60px]" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Notas adicionales para la factura" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Productos/Servicios</label>
          <Button type="button" variant="ghost" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" /> Agregar Línea
          </Button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-start p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <div className="flex-1 space-y-1.5">
                <input className="input-premium text-sm py-1.5" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Descripción del producto/servicio" />
              </div>
              <div className="w-20 space-y-1.5">
                <input type="number" step="0.01" className="input-premium text-sm py-1.5 text-center" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Cant" />
              </div>
              <div className="w-24 space-y-1.5">
                <input type="number" step="0.01" className="input-premium text-sm py-1.5 text-right" value={item.unit_price} onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)} placeholder="Precio" />
              </div>
              <div className="w-16 space-y-1.5">
                <select className="input-premium text-sm py-1.5" value={item.tax_percentage} onChange={(e) => updateItem(item.id, 'tax_percentage', parseFloat(e.target.value))}>
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={19}>19%</option>
                </select>
              </div>
              <div className="w-24 pt-5 text-right text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.quantity * item.unit_price - item.discount)}
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(item.id)} className="pt-5 text-gray-400 hover:text-danger transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
        <div className="text-center">
          <p className="text-xs text-gray-500">Subtotal</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">IVA</p>
          <p className="text-lg font-bold text-warning">{formatCurrency(tax)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold text-success">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="default" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Receipt className="w-4 h-4 mr-1" />}
          Crear Factura
        </Button>
      </div>
    </form>
  )
}
