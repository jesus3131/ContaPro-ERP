{/* Archivo: index.ts
   Propósito: Tipos compartidos TypeScript — interfaces para todos los modelos del sistema */}
export interface Company {
  id: number
  name: string
  business_name?: string
  nit: string
  dv?: string
  address?: string
  city?: string
  department?: string
  phone?: string
  email?: string
  is_active: boolean
}

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
}

export interface Account {
  id: number
  code: string
  name: string
  account_type: string
  nature: string
  account_class: string
  level: number
  parent_id?: number
  accepts_movements: boolean
  current_balance: number
  is_active: boolean
}

export interface AccountingEntry {
  id: number
  entry_number: string
  entry_type: string
  date: string
  description?: string
  is_reversed: boolean
  details: EntryDetail[]
}

export interface EntryDetail {
  id: number
  account_id: number
  nature: string
  debit: number
  credit: number
  description?: string
}

export interface FinancialIndicators {
  liquidity: { value: number; interpretation: string }
  debt_ratio: { value: number; interpretation: string }
  roe: { value: number; interpretation: string }
  total_assets: number
  total_liabilities: number
  total_equity: number
  total_income: number
}

export interface DashboardSummary {
  total_assets: number
  total_liabilities: number
  total_equity: number
  total_income: number
  total_expenses: number
  net_profit: number
  total_invoices: number
  invoice_total: number
  total_clients: number
  liquidity: number
  profit_margin: number
}

export interface Client {
  id: number
  document_type: string
  document_number: string
  business_name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  city?: string
  tax_regime?: string
  is_active: boolean
}

export interface Product {
  id: number
  code: string
  name: string
  category?: string
  cost_price: number
  sale_price: number
  current_stock: number
  min_stock: number
}

export interface Invoice {
  id: number
  invoice_number: string
  prefix?: string
  issue_date: string
  client_name?: string
  subtotal: number
  tax_amount: number
  total: number
  status: string
  dian_status?: string
  cufe?: string
}

export interface IAReport {
  analysis?: string
  error?: string
  report?: string
}
