'use client'
{/* Componente: ContactForm
   Propósito: Formulario de contacto: crear/editar clientes, proveedores, empleados */}
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'

interface ContactFormProps {
  type: 'clients' | 'suppliers' | 'employees'
  contact?: any
  onSuccess: () => void
  onCancel: () => void
}

const apiMap = {
  clients: api.clients,
  suppliers: api.suppliers,
  employees: api.employees,
}

export function ContactForm({ type, contact, onSuccess, onCancel }: ContactFormProps) {
  const isEdit = !!contact
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isCompany = type === 'suppliers'
  const title = type === 'clients' ? 'Cliente' : type === 'suppliers' ? 'Proveedor' : 'Empleado'

  const [form, setForm] = useState({
    document_type: type === 'clients' ? 'NIT' : 'CC', document_number: '', dv: '',
    business_name: '', first_name: '', last_name: '',
    email: '', phone: '', address: '', city: '', department: '',
    tax_regime: '', credit_limit: 0, payment_term_days: 30,
    contact_name: '', position: '', department_name: '', salary: 0,
    salary_type: '', contract_type: '', eps: '', afp: '', ccf: '',
    risk_class: '',
  })

  useEffect(() => {
    if (contact) {
      setForm({
        document_type: contact.document_type || (type === 'clients' ? 'NIT' : 'CC'),
        document_number: contact.document_number || '',
        dv: contact.dv || '',
        business_name: contact.business_name || '',
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        city: contact.city || '',
        department: contact.department || '',
        tax_regime: contact.tax_regime || '',
        credit_limit: contact.credit_limit || 0,
        payment_term_days: contact.payment_term_days || 30,
        contact_name: contact.contact_name || '',
        position: contact.position || '',
        department_name: contact.department_name || '',
        salary: contact.salary || 0,
        salary_type: contact.salary_type || '',
        contract_type: contact.contract_type || '',
        eps: contact.eps || '',
        afp: contact.afp || '',
        ccf: contact.ccf || '',
        risk_class: contact.risk_class || '',
      })
    }
  }, [contact, type])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload: any = {
        document_type: form.document_type,
        document_number: form.document_number,
        dv: form.document_type === 'NIT' ? form.dv : undefined,
        business_name: form.business_name || undefined,
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        department: form.department || undefined,
        tax_regime: form.tax_regime || undefined,
        payment_term_days: form.payment_term_days,
      }
      if (type === 'clients') {
        payload.credit_limit = form.credit_limit
      }
      if (type === 'suppliers') {
        payload.contact_name = form.contact_name || undefined
      }
      if (type === 'employees') {
        payload.salary = form.salary
        payload.salary_type = form.salary_type || undefined
        payload.contract_type = form.contract_type || undefined
        payload.position = form.position || undefined
        payload.department_name = form.department_name || undefined
        payload.eps = form.eps || undefined
        payload.afp = form.afp || undefined
        payload.ccf = form.ccf || undefined
        payload.risk_class = form.risk_class || undefined
      }
      const svc = apiMap[type]
      if (isEdit) {
        await svc.update(contact.id, payload)
      } else {
        await svc.create(payload)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }, [form, isEdit, contact, type, onSuccess])

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo Doc. *</label>
          <select className="input-premium" value={form.document_type} onChange={(e) => update('document_type', e.target.value)}>
            <option value="NIT">NIT</option>
            <option value="CC">Cédula</option>
            <option value="CE">Cédula Extranjería</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Número *</label>
          <input className="input-premium" value={form.document_number} onChange={(e) => update('document_number', e.target.value)} placeholder="Ej: 900123456" required />
        </div>
        {form.document_type === 'NIT' && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">DV</label>
            <input className="input-premium w-20" value={form.dv} onChange={(e) => update('dv', e.target.value)} placeholder="0" maxLength={1} />
          </div>
        )}
      </div>

      {isCompany ? (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Razón Social *</label>
          <input className="input-premium" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} placeholder="Razón social completa" required />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Primer Nombre *</label>
            <input className="input-premium" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} placeholder="Nombres" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Apellidos *</label>
            <input className="input-premium" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} placeholder="Apellidos" required />
          </div>
        </div>
      )}

      {isCompany && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre Comercial</label>
            <input className="input-premium" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} placeholder="Nombre comercial" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Régimen Tributario</label>
            <select className="input-premium" value={form.tax_regime} onChange={(e) => update('tax_regime', e.target.value)}>
              <option value="">Seleccionar...</option>
              <option value="Común">Común</option>
              <option value="Simplificado">Simplificado</option>
              <option value="Gran Contribuyente">Gran Contribuyente</option>
            </select>
          </div>
        </div>
      )}

      {type === 'suppliers' && (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre de Contacto</label>
          <input className="input-premium" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder="Persona de contacto" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" className="input-premium" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="correo@ejemplo.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Teléfono</label>
          <input className="input-premium" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+57 300 123 4567" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dirección</label>
          <input className="input-premium" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Dirección física" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ciudad</label>
            <input className="input-premium" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Ciudad" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Depto</label>
            <input className="input-premium" value={form.department} onChange={(e) => update('department', e.target.value)} placeholder="Depto" />
          </div>
        </div>
      </div>

      {type === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Límite de Crédito</label>
            <input type="number" step="10000" className="input-premium" value={form.credit_limit} onChange={(e) => update('credit_limit', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Días de Pago</label>
            <input type="number" className="input-premium" value={form.payment_term_days} onChange={(e) => update('payment_term_days', parseInt(e.target.value) || 30)} />
          </div>
        </div>
      )}

      {type === 'employees' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cargo</label>
              <input className="input-premium" value={form.position} onChange={(e) => update('position', e.target.value)} placeholder="Ej: Contador Senior" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Departamento</label>
              <input className="input-premium" value={form.department_name} onChange={(e) => update('department_name', e.target.value)} placeholder="Ej: Contabilidad" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Salario</label>
              <input type="number" step="10000" className="input-premium" value={form.salary} onChange={(e) => update('salary', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo Salario</label>
              <select className="input-premium" value={form.salary_type} onChange={(e) => update('salary_type', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="Fijo">Fijo</option>
                <option value="Variable">Variable</option>
                <option value="Mixto">Mixto</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo Contrato</label>
              <select className="input-premium" value={form.contract_type} onChange={(e) => update('contract_type', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="Término Indefinido">Término Indefinido</option>
                <option value="Término Fijo">Término Fijo</option>
                <option value="Obra Labor">Obra o Labor</option>
                <option value="Prestación Servicios">Prestación de Servicios</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">EPS</label>
              <input className="input-premium" value={form.eps} onChange={(e) => update('eps', e.target.value)} placeholder="Ej: Sura" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">AFP</label>
              <input className="input-premium" value={form.afp} onChange={(e) => update('afp', e.target.value)} placeholder="Ej: Colpensiones" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">CCF</label>
              <input className="input-premium" value={form.ccf} onChange={(e) => update('ccf', e.target.value)} placeholder="Ej: Colsubsidio" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Clase de Riesgo</label>
            <select className="input-premium" value={form.risk_class} onChange={(e) => update('risk_class', e.target.value)}>
              <option value="">Seleccionar...</option>
              <option value="I">I - Mínimo</option>
              <option value="II">II - Bajo</option>
              <option value="III">III - Medio</option>
              <option value="IV">IV - Alto</option>
              <option value="V">V - Máximo</option>
            </select>
          </div>
        </>
      )}

      {type !== 'clients' && type !== 'employees' && (
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Días de Pago</label>
          <input type="number" className="input-premium" value={form.payment_term_days} onChange={(e) => update('payment_term_days', parseInt(e.target.value) || 30)} />
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="default" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          {isEdit ? `Actualizar ${title}` : `Crear ${title}`}
        </Button>
      </div>
    </form>
  )
}
