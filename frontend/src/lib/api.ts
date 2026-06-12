const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface ApiError {
  status: number;
  detail: string;
}

function getToken(): string | null {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
}

function getCompanyId(): string | null {
  return localStorage.getItem("companyId") || localStorage.getItem("company_id");
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<T> {
  const token = getToken();
  const companyId = getCompanyId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (companyId) headers["X-Company-ID"] = companyId;

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("companyId");
      localStorage.removeItem("company_id");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Sesión expirada");
    }
    const errBody = await res.json().catch(() => ({ detail: "Error del servidor" }));
    const error: ApiError = { status: res.status, detail: errBody.detail || "Error desconocido" };
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function downloadBlob(endpoint: string, filename: string) {
  const token = getToken();
  const companyId = getCompanyId();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (companyId) headers["X-Company-ID"] = companyId;
  const res = await fetch(`${API_BASE}${endpoint}`, { headers });
  if (!res.ok) throw new Error("Error al descargar el reporte");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function crud(base: string) {
  return {
    list: (params?: string) => apiFetch(`${base}/${params || ""}`),
    get: (id: number | string) => apiFetch(`${base}/${id}`),
    create: (data: any) => apiFetch(base, { method: "POST", body: data }),
    update: (id: number | string, data: any) => apiFetch(`${base}/${id}`, { method: "PUT", body: data }),
    delete: (id: number | string) => apiFetch(`${base}/${id}`, { method: "DELETE" }),
  };
}

function crudWithSubPath(base: string, sub: string) {
  return {
    list: () => apiFetch(`${base}/${sub}`),
    create: (data: any) => apiFetch(`${base}/${sub}`, { method: "POST", body: data }),
    update: (id: number | string, data: any) => apiFetch(`${base}/${sub}/${id}`, { method: "PUT", body: data }),
    delete: (id: number | string) => apiFetch(`${base}/${sub}/${id}`, { method: "DELETE" }),
  };
}

export const api = {
  clients: crud("/clients"),
  suppliers: crudWithSubPath("/clients", "suppliers"),
  employees: crudWithSubPath("/clients", "employees"),
  auth: {
    login: (data: { username: string; password: string }) =>
      apiFetch<{ access_token: string; token_type: string; company_id?: number }>("/auth/login", { method: "POST", body: data }),
    registerWithCompany: (data: any) =>
      apiFetch<{ access_token: string; token_type: string; company_id?: number }>("/auth/register-with-company", { method: "POST", body: data }),
    companies: () => apiFetch<any[]>("/auth/companies"),
    selectCompany: (companyId: number) => {
      localStorage.setItem("companyId", String(companyId));
      localStorage.setItem("company_id", String(companyId));
    },
  },
  invoicing: {
    list: () => apiFetch("/invoicing/invoices"),
    create: (data: any) => apiFetch("/invoicing/invoices", { method: "POST", body: data }),
    sendDian: (id: number) => apiFetch(`/invoicing/invoices/${id}/send-dian`, { method: "POST" }),
    cancel: (id: number) => apiFetch(`/invoicing/invoices/${id}/cancel`, { method: "PUT" }),
  },
  inventory: {
    getProducts: () => apiFetch("/inventory/products"),
    stockAlerts: () => apiFetch("/inventory/stock-alerts"),
    createProduct: (data: any) => apiFetch("/inventory/products", { method: "POST", body: data }),
    updateProduct: (id: number, data: any) => apiFetch(`/inventory/products/${id}`, { method: "PUT", body: data }),
    deleteProduct: (id: number) => apiFetch(`/inventory/products/${id}`, { method: "DELETE" }),
  },
  accounting: {
    getPuc: () => apiFetch("/accounting/puc"),
    getEntries: () => apiFetch("/accounting/entries"),
    seedPuc: () => apiFetch("/accounting/puc/seed", { method: "POST" }),
    createEntry: (data: any) => apiFetch("/accounting/entries", { method: "POST", body: data }),
  },
  payroll: {
    createPeriod: (year: number, month: number) =>
      apiFetch(`/payroll/periods?year=${year}&month=${month}`, { method: "POST" }),
    settle: (periodId: number) =>
      apiFetch(`/payroll/settle/${periodId}`, { method: "POST" }),
    getSettlements: (periodId: number) =>
      apiFetch(`/payroll/settlements?period_id=${periodId}`),
  },
  reports: {
    download: async (reportId: string, format: string, start?: string, end?: string) => {
      let ep = `/reports/${reportId}?format=${format}`;
      if (start) ep += `&start_date=${start}`;
      if (end) ep += `&end_date=${end}`;
      await downloadBlob(ep, `${reportId}.${format}`);
    },
    data: (reportId: string, start?: string, end?: string) => {
      let ep = `/reports/${reportId}`;
      const params: string[] = [];
      if (start) params.push(`start_date=${start}`);
      if (end) params.push(`end_date=${end}`);
      if (params.length) ep += `?${params.join("&")}`;
      return apiFetch(ep);
    },
  },
  financial: {
    indicators: (year: number) => apiFetch(`/financial/indicators?year=${year}`),
  },
  dashboard: {
    summary: (year: number, month: number) =>
      apiFetch(`/dashboard/summary?year=${year}&month=${month}`),
    monthlyEvolution: (year: number) =>
      apiFetch(`/dashboard/monthly-evolution?year=${year}`),
    accountsReceivable: () =>
      apiFetch("/dashboard/accounts-receivable"),
  },
  ai: {
    analyze: (year: number, month: number) =>
      apiFetch(`/ai/analyze?year=${year}&month=${month}`, { method: "POST" }),
    detectErrors: () =>
      apiFetch("/ai/detect-errors", { method: "POST" }),
    predictCashFlow: () =>
      apiFetch("/ai/predict-cash-flow", { method: "POST" }),
    generateReport: (reportType: string) =>
      apiFetch(`/ai/generate-report?report_type=${reportType}`, { method: "POST" }),
  },
};
