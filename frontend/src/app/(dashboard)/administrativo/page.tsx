'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, UserPlus, RefreshCw } from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers' | 'employees'>('clients')
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await api.clients.list()
      setClients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'clients' as const, label: 'Clientes', icon: Users },
    { id: 'suppliers' as const, label: 'Proveedores', icon: Building2 },
    { id: 'employees' as const, label: 'Empleados', icon: UserPlus },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administrativo</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de clientes, proveedores y empleados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm">+ Nuevo</Button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id === 'clients') loadClients() }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize">{activeTab}</h3>
            <Button variant="ghost" size="sm" onClick={loadClients}>
              <RefreshCw className="w-4 h-4 mr-1" /> Cargar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === 'clients' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Documento</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre/Razón Social</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ciudad</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-mono text-xs">{client.document_number}</td>
                      <td className="px-4 py-3 font-medium">{client.business_name || `${client.first_name} ${client.last_name}`}</td>
                      <td className="px-4 py-3 text-gray-500">{client.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{client.phone || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{client.city || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          client.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {client.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        No hay clientes registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'suppliers' && (
            <div className="p-8 text-center text-gray-400">Módulo de proveedores próximamente</div>
          )}
          {activeTab === 'employees' && (
            <div className="p-8 text-center text-gray-400">Módulo de empleados próximamente</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
