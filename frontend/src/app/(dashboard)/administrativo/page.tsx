'use client'
{/* Página: Administrativo
   Propósito: Gestión de clientes, proveedores y empleados con tabs, búsqueda, edición y eliminación
   Módulo: Administrativo */}
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { ContactForm } from '@/components/forms/ContactForm'
import { Building2, Users, UserPlus, RefreshCw, Briefcase, Search, Pencil, Trash2 } from 'lucide-react'

type TabType = 'clients' | 'suppliers' | 'employees'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('clients')
  const [clients, setClients] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadClients = useCallback(async () => {
    setLoading(true)
    try { setClients(await api.clients.list()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  const loadSuppliers = useCallback(async () => {
    setLoading(true)
    try { setSuppliers(await api.suppliers.list()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    try { setEmployees(await api.employees.list()) } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  const handleNew = () => { setEditingItem(null); setModalOpen(true) }

  const handleEdit = (item: any) => { setEditingItem(item); setModalOpen(true) }

  const handleSave = () => {
    setModalOpen(false)
    setEditingItem(null)
    if (activeTab === 'clients') loadClients()
    else if (activeTab === 'suppliers') loadSuppliers()
    else loadEmployees()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const { id, type } = deleteConfirm
      if (type === 'clients') await api.clients.delete(id)
      else if (type === 'suppliers') await api.suppliers.delete(id)
      else await api.employees.delete(id)
      setDeleteConfirm(null)
      handleSave()
    } catch (err) {
      console.error(err)
    }
  }

  const switchTab = (tab: TabType) => {
    setActiveTab(tab)
    setSearchTerm('')
    if (tab === 'clients') loadClients()
    else if (tab === 'suppliers') loadSuppliers()
    else loadEmployees()
  }

  const currentData = activeTab === 'clients' ? clients : activeTab === 'suppliers' ? suppliers : employees

  const filtered = currentData.filter((item: any) => {
    const name = item.business_name || `${item.first_name || ''} ${item.last_name || ''}` || ''
    const doc = item.document_number || ''
    const email = item.email || ''
    const q = searchTerm.toLowerCase()
    return name.toLowerCase().includes(q) || doc.includes(q) || email.toLowerCase().includes(q)
  })

  const tabs = [
    { id: 'clients' as TabType, label: 'Clientes', icon: Users, count: clients.length },
    { id: 'suppliers' as TabType, label: 'Proveedores', icon: Building2, count: suppliers.length },
    { id: 'employees' as TabType, label: 'Empleados', icon: Briefcase, count: employees.length },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-card-primary">
        <div className="page-header-decoration" /><div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-white">Administrativo</h1>
                <p className="text-sm text-blue-200">Gestión de clientes, proveedores y empleados</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleNew} className="bg-[#6EEB83] text-[#062B5B] hover:bg-[#5ce073] border-none">
                <UserPlus className="w-4 h-4 mr-1" /> + Nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-[#062B5B] dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input className="input-premium pl-9 py-1.5 text-xs w-48" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => switchTab(activeTab)}>
                <RefreshCw className="w-4 h-4 mr-1" /> Cargar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Nombre/Razón Social</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  {activeTab === 'employees' && <th>Cargo</th>}
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item: any) => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs text-gray-500">{item.document_number}</td>
                    <td className="font-medium">{item.business_name || `${item.first_name} ${item.last_name}`}</td>
                    <td className="text-gray-500">{item.email || '-'}</td>
                    <td className="text-gray-500">{item.phone || '-'}</td>
                    <td className="text-gray-500">{item.city || '-'}</td>
                    {activeTab === 'employees' && <td className="text-gray-500">{item.position || '-'}</td>}
                    <td className="text-center">
                      <span className={item.is_active !== false ? 'badge badge-success' : 'badge badge-danger'}>
                        {item.is_active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ id: item.id, type: activeTab })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'employees' ? 8 : 7} className="text-center py-10 text-gray-400">
                      No hay {activeTab === 'clients' ? 'clientes' : activeTab === 'suppliers' ? 'proveedores' : 'empleados'} registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null) }} title={editingItem ? `Editar ${tabs.find(t => t.id === activeTab)?.label.slice(0, -1) || ''}` : `Nuevo ${tabs.find(t => t.id === activeTab)?.label.slice(0, -1) || ''}`} size="lg">
        <ContactForm type={activeTab} contact={editingItem} onSuccess={handleSave} onCancel={() => { setModalOpen(false); setEditingItem(null) }} />
      </Modal>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full animate-scale-in">
            <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="default" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
