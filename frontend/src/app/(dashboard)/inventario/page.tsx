'use client'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { ProductForm } from '@/components/forms/ProductForm'
import { Package, AlertTriangle, Plus, RefreshCw, Pencil, Trash2, DollarSign, Layers, Search } from 'lucide-react'

export default function InventarioPage() {
  const [products, setProducts] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, alts] = await Promise.all([
        api.inventory.getProducts(),
        api.inventory.stockAlerts(),
      ])
      setProducts(prods)
      setAlerts(alts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = () => {
    setModalOpen(false)
    setEditingProduct(null)
    loadData()
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleNew = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.inventory.deleteProduct(id)
      setDeleteConfirm(null)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalValue = products.reduce((s, p) => s + p.cost_price * p.current_stock, 0)
  const totalUnits = products.reduce((s, p) => s + p.current_stock, 0)

  const stats = [
    { label: 'Total Productos', value: products.length, icon: Package, color: '#3b82f6' },
    { label: 'Valor Inventario', value: formatCurrency(totalValue), icon: DollarSign, color: '#10b981' },
    { label: 'Alertas Stock', value: alerts.length, icon: AlertTriangle, color: '#FBBF24' },
    { label: 'Total Unidades', value: totalUnits.toFixed(0), icon: Layers, color: '#8b5cf6' },
  ]

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header gradient-card-warning">
          <div className="page-header-decoration" /><div className="page-header-decoration-2" />
          <div className="page-header-content"><div className="h-8 w-40 bg-white/20 rounded-lg animate-pulse" /></div>
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
      <div className="page-header gradient-card-warning">
        <div className="page-header-decoration" /><div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Inventario</h1>
                <p className="text-sm text-yellow-200">Gestión de productos, kardex y existencias</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={loadData} className="bg-white/10 text-white hover:bg-white/20 border-none">
                <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
              </Button>
              <Button variant="primary" size="sm" onClick={handleNew} className="bg-[#6EEB83] text-[#062B5B] hover:bg-[#5ce073] border-none">
                <Plus className="w-4 h-4 mr-1" /> Nuevo Producto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-slide-up">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-danger text-sm">Alertas de Stock Mínimo</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {alerts.length} producto(s) están por debajo del stock mínimo.
            </p>
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white">Productos</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className="input-premium pl-9 py-1.5 text-xs w-56" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th className="text-right">Costo</th>
                  <th className="text-right">Precio</th>
                  <th className="text-right">Stock</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="font-mono text-xs text-gray-500">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td className="text-gray-500">{p.category || '-'}</td>
                    <td className="text-right font-mono">{formatCurrency(p.cost_price)}</td>
                    <td className="text-right font-mono">{formatCurrency(p.sale_price)}</td>
                    <td className="text-right font-mono font-semibold">{p.current_stock}</td>
                    <td className="text-center">
                      {p.current_stock <= p.min_stock ? (
                        <span className="badge badge-danger">Bajo</span>
                      ) : (
                        <span className="badge badge-success">OK</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">No hay productos {searchTerm ? 'que coincidan con la búsqueda' : 'registrados'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingProduct(null) }} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
        <ProductForm product={editingProduct} onSuccess={handleSave} onCancel={() => { setModalOpen(false); setEditingProduct(null) }} />
      </Modal>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full animate-scale-in">
            <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="default" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
