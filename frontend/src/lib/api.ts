const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface ApiError {
  status: number;
  detail: string;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");
  const companyId = localStorage.getItem("company_id");

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
      localStorage.removeItem("access_token");
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
