'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle, Plus, RefreshCw } from 'lucide-react'

export default function InventarioPage() {
  const [products, setProducts] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
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
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de productos, kardex y existencias</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Nuevo Producto
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Alertas de Stock Mínimo</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {alerts.length} producto(s) están por debajo del stock mínimo
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Total Productos</div>
            <div className="text-2xl font-bold mt-1">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Valor Inventario</div>
            <div className="text-2xl font-bold mt-1 text-success">
              {formatCurrency(products.reduce((s, p) => s + p.cost_price * p.current_stock, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Alertas</div>
            <div className="text-2xl font-bold mt-1 text-warning">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-500">Total Unidades</div>
            <div className="text-2xl font-bold mt-1">
              {products.reduce((s, p) => s + p.current_stock, 0).toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Productos</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Costo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Precio Venta</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Min</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category || '-'}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.cost_price)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.sale_price)}</td>
                    <td className="px-4 py-3 text-right font-mono">{p.current_stock}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500">{p.min_stock}</td>
                    <td className="px-4 py-3 text-center">
                      {p.current_stock <= p.min_stock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
