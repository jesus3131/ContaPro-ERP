{/* Página: Layout Raíz
   Propósito: Proveedor de autenticación, configuración global de fuentes, metadatos y estructura HTML base
   Módulo: Global */}
import { AuthProvider } from '@/components/layout/AuthProvider'
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
