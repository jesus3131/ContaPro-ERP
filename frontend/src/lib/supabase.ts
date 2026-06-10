{/* Archivo: supabase.ts
   Propósito: Cliente Supabase — configuración e inicialización del cliente de Supabase */}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function supabaseRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    ...(options.headers as Record<string, string>),
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('supabase_token') : null
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${supabaseUrl}/rest/v1${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `Supabase error ${response.status}`)
  }

  return response.json()
}

export function getSupabaseAuthUrl() {
  return `${supabaseUrl}/auth/v1`
}
