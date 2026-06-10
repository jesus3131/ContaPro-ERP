'use client'
{/* Componente: ProductForm
   Propósito: Formulario de producto: crear/editar productos del inventario */}
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Package, Save, Loader2 } from 'lucide-react'

interface ProductFormProps {
  product?: any
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '', barcode: '', name: '', description: '', category: '',
    unit_type: '', cost_price: 0, sale_price: 0, tax_rate: 0,
    tax_code: '', min_stock: 0, costing_method: 'Promedio', location: '',
    image_url: null as string | null,
  })

  useEffect(() => {
    if (product) {
      setForm({
        code: product.code || '',
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        unit_type: product.unit_type || '',
        cost_price: product.cost_price || 0,
        sale_price: product.sale_price || 0,
        tax_rate: product.tax_rate || 0,
        tax_code: product.tax_code || '',
        min_stock: product.min_stock || 0,
        costing_method: product.costing_method || 'Promedio',
        location: product.location || '',
        image_url: product.image_url || null,
      })
    }
  }, [product])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = { ...form }
      if (isEdit) {
        const clean: Record<string, any> = {}
        Object.entries(data).forEach(([k, v]) => { if (v !== '' && v !== null) clean[k] = v })
        await api.inventory.updateProduct(product.id, clean)
      } else {
        await api.inventory.createProduct(data)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }, [form, isEdit, product, onSuccess])

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      <ImageUploader value={form.image_url} onChange={(v) => update('image_url', v)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Código *</label>
          <input className="input-premium" value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="Ej: PROD-001" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Código de Barras</label>
          <input className="input-premium" value={form.barcode} onChange={(e) => update('barcode', e.target.value)} placeholder="Ej: 7701234567890" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre del Producto *</label>
        <input className="input-premium" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Nombre del producto o servicio" required />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción</label>
        <textarea className="input-premium min-h-[80px]" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Descripción detallada del producto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categoría</label>
          <select className="input-premium" value={form.category} onChange={(e) => update('category', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Productos">Productos</option>
            <option value="Servicios">Servicios</option>
            <option value="Materia Prima">Materia Prima</option>
            <option value="Insumos">Insumos</option>
            <option value="Equipos">Equipos</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unidad</label>
          <select className="input-premium" value={form.unit_type} onChange={(e) => update('unit_type', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Unidad">Unidad</option>
            <option value="Kilogramo">Kilogramo</option>
            <option value="Litro">Litro</option>
            <option value="Metro">Metro</option>
            <option value="Caja">Caja</option>
            <option value="Hora">Hora</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio de Costo</label>
          <input type="number" step="0.01" className="input-premium" value={form.cost_price} onChange={(e) => update('cost_price', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio de Venta</label>
          <input type="number" step="0.01" className="input-premium" value={form.sale_price} onChange={(e) => update('sale_price', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">% IVA</label>
          <select className="input-premium" value={form.tax_rate} onChange={(e) => update('tax_rate', parseFloat(e.target.value) || 0)}>
            <option value={0}>0% - Exento</option>
            <option value={5}>5%</option>
            <option value={19}>19%</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Mínimo</label>
          <input type="number" step="0.01" className="input-premium" value={form.min_stock} onChange={(e) => update('min_stock', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Método Costeo</label>
          <select className="input-premium" value={form.costing_method} onChange={(e) => update('costing_method', e.target.value)}>
            <option value="Promedio">Promedio Ponderado</option>
            <option value="PEPS">PEPS</option>
            <option value="UEPS">UEPS</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ubicación</label>
          <input className="input-premium" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Ej: Bodega A, Estante 3" />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="default" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
}
