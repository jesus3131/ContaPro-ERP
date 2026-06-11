{/* Archivo: api.ts
   Propósito: Cliente API centralizado — todas las llamadas a endpoints del backend, manejo de autenticación y tokens */}
const API_URL = '/api'
let isRedirecting = false

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

function decodeToken(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return true
  return payload.exp * 1000 < Date.now()
}

function removeAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('companyId')
  }
}

async function getToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token && isTokenExpired(token)) {
      removeAuthData()
      return null
    }
    return token
  }
  return null
}

function getCompanyId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('companyId')
  }
  return null
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!skipAuth) {
    const token = await getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const companyId = getCompanyId()
    if (companyId) {
      headers['X-Company-ID'] = companyId
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401 && !skipAuth && !isRedirecting) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token && isTokenExpired(token)) {
        isRedirecting = true
        removeAuthData()
      }
    }
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Error ${response.status}`)
  }

  return response.json()
}

export async function apiDownloadBlob(endpoint: string, filename: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (companyId) headers['X-Company-ID'] = companyId

  const response = await fetch(`${API_URL}${endpoint}`, { headers })
  if (!response.ok) throw new Error(`Error ${response.status}`)

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export const api = {
  auth: {
    login: (data: { username: string; password: string }) =>
      apiFetch<{ access_token: string; token_type: string; user: any; company_id?: number }>('/auth/login', {
        method: 'POST', body: JSON.stringify(data), skipAuth: true,
      }),
    register: (data: { username: string; email: string; full_name: string; password: string }) =>
      apiFetch<{ access_token: string; token_type: string; user: any; company_id?: number }>('/auth/register', {
        method: 'POST', body: JSON.stringify(data), skipAuth: true,
      }),
    registerWithCompany: (data: {
      username: string; email: string; full_name: string; password: string;
      company_name: string; company_nit: string;
    }) =>
      apiFetch<{ access_token: string; token_type: string; user: any; company_id?: number }>('/auth/register-with-company', {
        method: 'POST', body: JSON.stringify(data), skipAuth: true,
      }),
    me: () => apiFetch<any>('/auth/me'),
    companies: () => apiFetch<any[]>('/auth/companies'),
    selectCompany: (companyId: number) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('companyId', String(companyId))
      }
    },
    logout: () => removeAuthData(),
  },
  accounting: {
    getPuc: () => apiFetch<any[]>('/accounting/puc'),
    seedPuc: () => apiFetch<{ message: string }>('/accounting/puc/seed', { method: 'POST' }),
    createAccount: (data: any) =>
      apiFetch<any>('/accounting/accounts', { method: 'POST', body: JSON.stringify(data) }),
    getEntries: (params?: { start_date?: string; end_date?: string; entry_type?: string }) => {
      const qs = new URLSearchParams(params as any).toString()
      return apiFetch<any[]>(`/accounting/entries?${qs}`)
    },
    createEntry: (data: any) =>
      apiFetch<any>('/accounting/entries', { method: 'POST', body: JSON.stringify(data) }),
    trialBalance: (end_date: string) =>
      apiFetch<any[]>(`/accounting/trial-balance?end_date=${end_date}`),
    balanceSheet: (end_date: string) =>
      apiFetch<any[]>(`/accounting/balance-sheet?end_date=${end_date}`),
    incomeStatement: (start_date: string, end_date: string) =>
      apiFetch<any[]>(`/accounting/income-statement?start_date=${start_date}&end_date=${end_date}`),
  },
  financial: {
    indicators: (year: number, month?: number) =>
      apiFetch<any>(`/financial/indicators?year=${year}${month ? `&month=${month}` : ''}`),
    cashFlow: (start_date: string, end_date: string) =>
      apiFetch<any>(`/financial/cash-flow?start_date=${start_date}&end_date=${end_date}`),
  },
  invoicing: {
    list: () => apiFetch<any[]>('/invoicing/invoices'),
    create: (data: any) =>
      apiFetch<any>('/invoicing/invoices', { method: 'POST', body: JSON.stringify(data) }),
    validateDian: (id: number) =>
      apiFetch<any>(`/invoicing/invoices/${id}/validate-dian`, { method: 'POST' }),
    sendDian: (id: number) =>
      apiFetch<any>(`/invoicing/invoices/${id}/send-dian`, { method: 'POST' }),
    cancel: (id: number) =>
      apiFetch<any>(`/invoicing/invoices/${id}/cancel`, { method: 'PUT' }),
  },
  inventory: {
    getProducts: () => apiFetch<any[]>('/inventory/products'),
    createProduct: (data: any) =>
      apiFetch<any>('/inventory/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id: number, data: any) =>
      apiFetch<any>(`/inventory/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id: number) =>
      apiFetch<any>(`/inventory/products/${id}`, { method: 'DELETE' }),
    getProduct: (id: number) =>
      apiFetch<any>(`/inventory/products/${id}`),
    createMovement: (data: any) =>
      apiFetch<any>('/inventory/movements', { method: 'POST', body: JSON.stringify(data) }),
    getKardex: (id: number) => apiFetch<any[]>(`/inventory/kardex/${id}`),
    stockAlerts: () => apiFetch<any[]>('/inventory/stock-alerts'),
  },
  payroll: {
    createPeriod: (year: number, month: number) =>
      apiFetch<any>(`/payroll/periods?year=${year}&month=${month}`, { method: 'POST' }),
    settle: (periodId: number) =>
      apiFetch<any>(`/payroll/settle/${periodId}`, { method: 'POST' }),
    getSettlements: (periodId: number) =>
      apiFetch<any[]>(`/payroll/settlements?period_id=${periodId}`),
  },
  dashboard: {
    summary: (year: number, month: number) =>
      apiFetch<any>(`/dashboard/summary?year=${year}&month=${month}`),
    monthlyEvolution: (year: number) =>
      apiFetch<any[]>(`/dashboard/monthly-evolution?year=${year}`),
    accountsReceivable: () => apiFetch<any>('/dashboard/accounts-receivable'),
  },
  clients: {
    list: () => apiFetch<any[]>('/clients/'),
    create: (data: any) =>
      apiFetch<any>('/clients/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      apiFetch<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      apiFetch<any>(`/clients/${id}`, { method: 'DELETE' }),
    get: (id: number) =>
      apiFetch<any>(`/clients/${id}`),
  },
  suppliers: {
    list: () => apiFetch<any[]>('/clients/suppliers'),
    create: (data: any) =>
      apiFetch<any>('/clients/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      apiFetch<any>(`/clients/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      apiFetch<any>(`/clients/suppliers/${id}`, { method: 'DELETE' }),
  },
  employees: {
    list: () => apiFetch<any[]>('/clients/employees'),
    create: (data: any) =>
      apiFetch<any>('/clients/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      apiFetch<any>(`/clients/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      apiFetch<any>(`/clients/employees/${id}`, { method: 'DELETE' }),
  },
  reports: {
    _params: (reportId: string, startDate?: string, endDate?: string): string => {
      const needsDates = ['balance-sheet', 'income-statement', 'cash-flow', 'trial-balance', 'tax-report']
      const needsBoth = ['income-statement', 'cash-flow', 'tax-report']
      const p: string[] = []
      if (needsDates.includes(reportId)) {
        if (needsBoth.includes(reportId) && startDate) p.push(`start_date=${startDate}`)
        if (endDate) p.push(`end_date=${endDate}`)
      }
      return p.length ? `?${p.join('&')}` : ''
    },
    download: (reportId: string, format: string, startDate?: string, endDate?: string) => {
      const qs = api.reports._params(reportId, startDate, endDate)
      const base = `/reports/${reportId}${qs}${qs ? '&' : '?'}format=${format}`
      return format === 'json'
        ? apiFetch<any[]>(base)
        : apiDownloadBlob(base, `${reportId}.${format}`)
    },
    data: (reportId: string, startDate?: string, endDate?: string) => {
      const qs = api.reports._params(reportId, startDate, endDate)
      return apiFetch<any[]>(`/reports/${reportId}${qs}${qs ? '&' : '?'}format=json`)
    },
  },
  ai: {
    analyze: (year: number, month: number) =>
      apiFetch<any>(`/ai/analyze?year=${year}&month=${month}`, { method: 'POST' }),
    detectErrors: () =>
      apiFetch<any>('/ai/detect-errors', { method: 'POST' }),
    predictCashFlow: () =>
      apiFetch<any>('/ai/predict-cash-flow', { method: 'POST' }),
    generateReport: (reportType: string) =>
      apiFetch<any>(`/ai/generate-report?report_type=${reportType}`, { method: 'POST' }),
  },
}
