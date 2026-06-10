
<!--suppress HtmlDeprecatedAttribute, HtmlUnknownAnchorTarget -->
<div align="center">
  <br/>
    <p>
      <img src="https://img.shields.io/badge/Status-En%20Desarrollo-yellow?style=flat-square" alt="Status"/>
      <img src="https://img.shields.io/badge/Python-3.14-blue?style=flat-square&logo=python" alt="Python"/>
      <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" alt="FastAPI"/>
      <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js"/>
      <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React"/>
      <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind"/>
      <img src="https://img.shields.io/badge/pnpm-10.33-F69220?style=flat-square&logo=pnpm" alt="pnpm"/>
      <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL"/>
      <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase" alt="Supabase"/>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker" alt="Docker"/>
      <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
      <img src="https://img.shields.io/badge/Licencia-MIT-green?style=flat-square" alt="License"/>
    </p>
  <br/>
</div>

<div align="center">
  <h1>📊 ContaPro ERP Colombia</h1>
  <h3>Software Contable y Administrativo de Nivel Empresarial</h3>
  <p><strong>NIIF · DIAN · Facturación Electrónica · Nómina Electrónica · IA Integrada</strong></p>
  <br/>
  <p><i>Plataforma moderna, intuitiva e interactiva para gestionar la información financiera,<br/>
  contable, tributaria y administrativa de tu empresa en Colombia.</i></p>
</div>

---

## 📋 Tabla de Contenido

- [Descripción General](#-descripción-general)
- [Cambios Recientes y Modificaciones](#-cambios-recientes-y-modificaciones)
- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Módulos](#-módulos)
- [Cumplimiento Legal Colombiano](#-cumplimiento-legal-colombiano)
- [Guía de Despliegue Paso a Paso](#-guía-de-despliegue-paso-a-paso)
  - [Requisitos](#requisitos)
  - [Desarrollo Local (Windows)](#desarrollo-local-windows)
  - [Desarrollo Local (Linux/Mac)](#desarrollo-local-linuxmac)
  - [Acceso Multi-dispositivo en LAN](#acceso-multi-dispositivo-en-lan)
  - [Docker Compose](#docker-compose)
  - [Despliegue en Producción](#despliegue-en-producción)
- [API REST](#-api-rest)
- [Estructura de la Base de Datos](#-estructura-de-la-base-de-datos)
- [Seguridad](#-seguridad)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🚀 Descripción General

**ContaPro ERP Colombia** es una plataforma web empresarial diseñada para pequeñas, medianas y grandes empresas, así como para contadores públicos y firmas contables en Colombia. El sistema automatiza procesos financieros, contables, tributarios y administrativos, generando reportes en tiempo real con inteligencia artificial integrada.

Cumple totalmente con la normatividad colombiana: **NIIF**, **NIIF para Pymes**, **Estatuto Tributario Colombiano**, **DIAN** (Facturación Electrónica, Nómina Electrónica, RADIAN), **Ley 1581 de Protección de Datos** y normativa de la **Contaduría Pública de Colombia**.

---

## 🔄 Cambios Recientes y Modificaciones

### Migración a pnpm
- Se reemplazó npm por **pnpm** (v10.33.2) como gestor de paquetes del frontend
- `package-lock.json` reemplazado por `pnpm-lock.yaml` (más rápido, deterministico, ahorra espacio)
- Comando de instalación: `pnpm install` (en lugar de `npm install`)
- Comando de desarrollo: `pnpm dev` (en lugar de `npm run dev`)

### Proxy API para acceso multi-dispositivo
- El frontend ahora usa rutas relativas (`/api/...`) que pasan por **Next.js Rewrites**
- Configurado en `frontend/next.config.ts`: `/api/:path*` → `BACKEND_URL/api/v1/:path*`
- Variable de entorno `BACKEND_URL` en `frontend/.env.local`
- Permite acceder desde cualquier IP de la red local (ej: `http://192.168.56.1:3000`)
- Elimina problemas de CORS al mantener el mismo origen

### Carga con Skeleton Loaders
- **Dashboard**: esqueleto de 6 cards + placeholders de gráficos
- **Facturación**: cards de estadísticas + tabla placeholder
- **Contabilidad**: cards + tabla placeholder
- **Financiero**: 3 cards pulsantes
- **Inventario**: 4 stats cards + tabla placeholder
- Mejora la percepción de velocidad: el usuario ve la estructura de la página inmediatamente

### Corrección AuthProvider (Flash Blanco)
- Reemplazado `return null` por un **spinner de carga** centrado
- El usuario ya no ve un flash blanco al navegar entre páginas
- Redirige a `/` automáticamente si ya hay token y está en `/login`

### Mejoras de UX
- **Manejo de errores en Dashboard**: si falla la API, muestra botón **"Reintentar"** en lugar de datos en cero
- **Año dinámico en Financiero**: reemplazado `2026` hardcodeado por `new Date().getFullYear()`
- **Confirmación modal en Facturación**: reemplazado `confirm()` nativo por modal personalizado
- **Pestañas Login/Registro**: la página de login ahora tiene tabs para iniciar sesión o registrarse

### Seed Automático (Admin por Defecto)
- `backend/app/db/seed.py`: al iniciar el backend, si no existe un usuario `admin`, lo crea automáticamente
- También crea una empresa por defecto (`Mi Empresa S.A.S.`)
- Credenciales iniciales: **usuario:** `admin` / **contraseña:** `admin123`

### Comentarios en Español (Documentación)
- Todos los archivos del proyecto (74 en total) incluyen comentarios descriptivos en español
- Cada archivo explica su propósito, módulo y funcionalidades principales
- Backend: formato `# Módulo: ... # Propósito: ...`
- Frontend: formato `{'/* Componente: ... Propósito: ... */}`
- Facilita la incorporación de nuevos miembros al equipo

### Backend: Endpoints Adicionales
- **Clientes/Proveedores/Empleados**: CRUD completo con rutas separadas
  - `/clients/suppliers` y `/clients/employees` (declarados antes de `/{client_id}`)
  - Schemas `SupplierUpdate` y `EmployeeUpdate` para actualización parcial
- **Reportes**: 5 endpoints adicionales
  - `trial-balance`, `accounts-receivable`, `inventory-report`, `payroll-report`, `tax-report`
  - `report_generator.py` actualizado con títulos para todos los tipos de reporte

---

## ✨ Características

| Característica | Descripción |
|---|---|
| 🌐 **Interfaz Moderna** | Diseño UI/UX profesional con tema claro/oscuro y responsive (PC, tablet, móvil) |
| 📊 **Dashboard Ejecutivo** | KPIs en tiempo real, gráficos interactivos (barras, líneas, áreas, pie) |
| ⏱ **Skeleton Loaders** | Carga visual inmediata en todas las páginas |
| 🏢 **Multiempresa** | Gestión de múltiples empresas desde una sola cuenta |
| 👥 **Multiusuario** | Roles y permisos (admin, contador, auditor, viewer) |
| ☁️ **Cloud Native** | Arquitectura en la nube con Docker, Kubernetes y Supabase |
| 🔒 **Seguridad** | JWT, RLS (Row Level Security), auditoría completa de movimientos |
| 🤖 **IA Integrada** | Análisis financiero, detección de errores, predicción de flujo de caja |
| 📄 **Facturación DIAN** | Cumplimiento total con facturación y nómina electrónica |
| 📱 **Responsive** | Experiencia óptima en todos los dispositivos |

---

## 🛠 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Next.js](https://nextjs.org/) | 15.2 | Framework React con SSR y App Router |
| [React](https://react.dev/) | 19.0 | Biblioteca UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.6 | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0 | Framework CSS utilitario |
| [pnpm](https://pnpm.io/) | 10.33 | Gestor de paquetes (rápido, deterministico) |
| [Recharts](https://recharts.org/) | 2.15 | Gráficos interactivos (barras, líneas, áreas, pie) |
| [Lucide React](https://lucide.dev/) | 0.460 | Iconos |
| [date-fns](https://date-fns.org/) | 4.1 | Manipulación de fechas |
| [jose](https://github.com/panva/jose) | 6.0 | Verificación de tokens JWT en el frontend |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | - | Gestión de clases condicionales |

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Python](https://www.python.org/) | 3.14 | Lenguaje de programación |
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115 | Framework web asíncrono |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | ORM asíncrono |
| [Pydantic](https://docs.pydantic.dev/) | 2.9 | Validación de datos |
| [asyncpg](https://magicstack.github.io/asyncpg/) | 0.30 | Driver PostgreSQL asíncrono |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.3 | JWT |
| [passlib](https://passlib.readthedocs.io/) | 1.7 | Hash de contraseñas (bcrypt) |
| [OpenAI](https://openai.com/) | 1.51 | API de IA para análisis financiero |
| [Pandas](https://pandas.pydata.org/) | 2.2 | Procesamiento de datos |
| [ReportLab](https://www.reportlab.com/) / [WeasyPrint](https://weasyprint.org/) | - | Generación de PDF |
| [OpenPyXL](https://openpyxl.readthedocs.io/) | 3.1 | Generación de Excel |
| [Celery](https://docs.celeryq.dev/) | 5.4 | Tareas asíncronas / colas |
| [Redis](https://redis.io/) | 5.2 | Caché y broker de Celery |

### Base de Datos e Infraestructura

| Tecnología | Versión | Propósito |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/) | 16 | Base de datos relacional |
| [Supabase](https://supabase.com/) | - | Plataforma PostgreSQL + Auth + RLS |
| [Docker](https://www.docker.com/) | - | Contenedores |
| [Nginx](https://nginx.org/) | - | Proxy inverso / balanceo |

---

## 🏗 Arquitectura del Proyecto

```
contapro-erp/
├── backend/                          # API REST con FastAPI
│   ├── app/
│   │   ├── api/v1/                   # Endpoints REST (12 routers)
│   │   │   ├── auth.py               # Autenticación JWT + multiempresa
│   │   │   ├── accounting.py         # PUC, asientos, balance, resultados
│   │   │   ├── financial.py          # Indicadores, flujo caja, presupuestos
│   │   │   ├── clients.py            # CRUD clientes, proveedores, empleados
│   │   │   ├── invoicing.py          # Facturación electrónica DIAN
│   │   │   ├── inventory.py          # Kardex, stock, movimientos
│   │   │   ├── payroll.py            # Nómina, liquidación, prestaciones
│   │   │   ├── reports.py            # Generación de reportes (PDF, Excel, CSV)
│   │   │   ├── ai.py                 # Asistente IA (OpenAI)
│   │   │   └── dashboard.py          # KPIs y dashboard ejecutivo
│   │   ├── core/                     # Configuración, seguridad, dependencias
│   │   │   ├── config.py             # Variables de entorno y settings
│   │   │   ├── security.py           # JWT + bcrypt
│   │   │   └── deps.py               # Dependencias FastAPI
│   │   ├── db/                       # Conexión y semilla
│   │   │   ├── database.py           # Engine, sesiones asíncronas
│   │   │   └── seed.py               # Seed: admin + empresa por defecto
│   │   ├── models/                   # Modelos SQLAlchemy (9 archivos, 25+ tablas)
│   │   ├── schemas/                  # Esquemas Pydantic (6 archivos)
│   │   └── services/                 # Lógica de negocio (5 archivos)
│   │       ├── dian.py               # Integración DIAN
│   │       ├── puc_colombia.py       # PUC Colombia (136 cuentas)
│   │       ├── payroll_calculator.py # Cálculo de nómina colombiana
│   │       ├── ai_assistant.py       # Asistente IA (OpenAI)
│   │       └── report_generator.py   # Generador de reportes
│   ├── alembic/                      # Migraciones de base de datos
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                         # Aplicación Next.js (pnpm)
│   ├── src/
│   │   ├── app/                      # Páginas (App Router)
│   │   │   ├── login/                # Autenticación (login + registro)
│   │   │   ├── page.tsx              # Dashboard principal con skeletons
│   │   │   └── (dashboard)/
│   │   │       ├── contabilidad/     # Módulo contable
│   │   │       ├── financiero/       # Módulo financiero
│   │   │       ├── facturacion/      # Facturación electrónica
│   │   │       ├── inventario/       # Inventario con skeletons
│   │   │       ├── nomina/           # Nómina
│   │   │       ├── administrativo/   # Clientes, proveedores, empleados
│   │   │       ├── reportes/         # Reportes PDF/Excel
│   │   │       └── ia/               # Asistente IA
│   │   ├── components/
│   │   │   ├── ui/                   # Button, Card, Modal, ImageUploader
│   │   │   ├── layout/               # Sidebar, Header, AuthProvider
│   │   │   ├── forms/               # ContactForm, EntryForm, InvoiceForm, ProductForm
│   │   │   └── charts/              # DashboardChart (Recharts)
│   │   ├── lib/                      # api.ts (cliente proxy), supabase.ts, utils.ts
│   │   ├── types/                    # Interfaces TypeScript
│   │   └── styles/                   # globals.css (Tailwind + tema claro/oscuro)
│   ├── .env.local                    # BACKEND_URL=http://localhost:8000
│   ├── next.config.ts                # Rewrites: /api/* → backend
│   ├── dockerfile
│   └── package.json
│
├── infra/                            # Infraestructura
│   ├── nginx/nginx.conf
│   └── k8s/deployment.yaml
│
├── docker-compose.yml                # Orquestación Docker
└── .env                              # Variables de entorno
```

---

## 📦 Módulos

### Módulo Contable

Sistema contable completo que cumple con el Plan Único de Cuentas (PUC) Colombiano.

| Funcionalidad | Estado | Descripción |
|---|---|---|
| **Plan Único de Cuentas (PUC)** | ✅ | 136 cuentas clasificadas por tipo, naturaleza y clase |
| **Creación de Cuentas** | ✅ | Cuentas jerárquicas con niveles |
| **Comprobantes Contables** | ✅ | Asientos con débito/crédito, validación de cuadre |
| **Libro Diario** | ✅ | Registro cronológico de todas las transacciones |
| **Libro Mayor** | ✅ | Saldos por cuenta contable |
| **Balance de Prueba** | ✅ | Saldos debitores y acreedores |
| **Estado de Resultados** | ✅ | Ingresos, gastos, costos y utilidad del período |
| **Balance General** | ✅ | Activos, pasivos y patrimonio |
| **Flujo de Efectivo** | ✅ | Método directo e indirecto |
| **Conciliación Bancaria** | ✅ | Automática con movimientos bancarios |
| **Cierre Mensual/Anual** | ✅ | Cierre de períodos contables |
| **Reversión de Asientos** | ✅ | Reversión completa con trazabilidad |

### Módulo Financiero

Indicadores y análisis financiero automatizado.

| Indicador | Fórmula | Descripción |
|---|---|---|
| **Liquidez Corriente** | `Activo Corriente / Pasivo Corriente` | Capacidad de pago a corto plazo |
| **Endeudamiento** | `(Pasivos / Activos) × 100` | Nivel de deuda sobre activos |
| **ROE** | `(Utilidad Neta / Patrimonio) × 100` | Rentabilidad sobre patrimonio |
| **ROI** | `(Ganancia - Inversión) / Inversión × 100` | Retorno sobre inversión |
| **EBITDA** | `Utilidad + Intereses + Impuestos + Depreciación + Amortización` | Resultado operativo |
| **Margen de Utilidad** | `(Utilidad / Ingresos) × 100` | Eficiencia operativa |

Además incluye:
- ✅ Presupuestos anuales y mensuales
- ✅ Proyección de flujo de caja
- ✅ Comparativos mensuales y anuales
- ✅ Alertas de desviación presupuestal

### Módulo Administrativo

| Funcionalidad | Descripción |
|---|---|
| **Gestión de Clientes** | Registro, documentación, cupo de crédito, plazos |
| **Gestión de Proveedores** | Datos tributarios, condiciones de pago |
| **Gestión de Empleados** | Contratos, salarios, EPS, AFP, CCF, riesgo ARL |
| **Gestión Documental** | Almacenamiento de soportes y documentos |
| **Control de Actividades** | Registro de tareas y actividades |

### Facturación Electrónica DIAN

Cumplimiento total con los requisitos técnicos y legales de la DIAN:

| Tipo de Documento | Soporte | Estado |
|---|---|---|
| **Factura Electrónica de Venta (FEV)** | Resolución DIAN | ✅ |
| **Nómina Electrónica** | CUNE | ✅ |
| **Documento Soporte** | Resolución DIAN | ✅ |
| **Notas Crédito** | CUDE | ✅ |
| **Notas Débito** | CUDE | ✅ |
| **Eventos RADIAN** | Registro de acuses, reclamos | ✅ |

### Módulo de Inventario

| Funcionalidad | Descripción |
|---|---|
| **Entradas y Salidas** | Registro de movimientos de inventario |
| **Kardex** | Control detallado por producto |
| **Costeo Promedio** | Cálculo de costo promedio ponderado |
| **Costeo PEPS** | Primeras en entrar, primeras en salir |
| **Control de Existencias** | Stock actual en tiempo real |
| **Alertas de Stock Mínimo** | Notificaciones automáticas |
| **Trazabilidad** | Historial completo de movimientos |

### Módulo de Nómina

Liquidación automática cumpliendo con la legislación laboral colombiana:

| Concepto | Empleado | Empleador |
|---|---|---|
| **Salud** | 4% | 8.5% |
| **Pensión** | 4% | 12% |
| **ARL** | 0% | 0.522% - 6.96% (según riesgo) |
| **CCF (Caja de Compensación)** | 0% | 4% |
| **SENA** | 0% | 2% |
| **ICBF** | 0% | 3% |

**Prestaciones Sociales calculadas automáticamente:**
- ✅ Cesantías (salario × días / 360)
- ✅ Intereses de cesantías (cesantías × 12% × días / 360)
- ✅ Prima de servicios (salario × días / 360)
- ✅ Vacaciones (salario × días / 720)

### Inteligencia Artificial

Asistente inteligente integrado con OpenAI (GPT-4) que ofrece:

| Funcionalidad | Descripción |
|---|---|
| **Análisis Financiero** | Interpretación en lenguaje natural de balances |
| **Detección de Errores** | Identifica asientos descuadrados, cuentas mal clasificadas |
| **Predicción de Flujo de Caja** | Proyecta ingresos y egresos futuros con IA |
| **Reportes Ejecutivos** | Genera informes gerenciales automáticos |
| **Alertas de Riesgo** | Detecta patrones anómalos y riesgos financieros |

### Dashboard Inteligente

Muestra en tiempo real KPIs con gráficos interactivos (barras, líneas, áreas, pie):
- Ventas del período, gastos, utilidad neta
- Flujo de caja, cuentas por cobrar/pagar
- Impuestos (IVA, Retefuente, ICA)
- **Skeleton loaders** mientras cargan los datos

### Reportes

Generación automática en múltiples formatos:

| Reporte | PDF | Excel | CSV |
|---|---|---|---|
| Balance General | ✅ | ✅ | ✅ |
| Estado de Resultados | ✅ | ✅ | ✅ |
| Flujo de Caja | ✅ | ✅ | ✅ |
| Balance de Prueba | ✅ | ✅ | ✅ |
| Cartera (CxC) | ✅ | ✅ | ✅ |
| Inventario | ✅ | ✅ | ✅ |
| Nómina | ✅ | ✅ | ✅ |
| Impuestos | ✅ | ✅ | ✅ |
| Reportes Gerenciales IA | ✅ | 🚧 | 🚧 |

---

## ⚖️ Cumplimiento Legal Colombiano

### Normatividad Contable
- ✅ **NIIF** (Normas Internacionales de Información Financiera)
- ✅ **NIIF para Pymes**
- ✅ **Decreto 2649/1993** (Plan Único de Cuentas)
- ✅ **Ley 1314/2009** (Principios de contabilidad)

### Normatividad Tributaria
- ✅ **Estatuto Tributario Colombiano**
- ✅ **Facturación Electrónica** (Resolución 000042/2020)
- ✅ **Nómina Electrónica** (Resolución 000013/2021)
- ✅ **Documento Soporte** (Resolución 000165/2023)
- ✅ **RADIAN** (Registro de Acuse de Recibo)
- ✅ **Retención en la Fuente**
- ✅ **IVA** (Impuesto al Valor Agregado)
- ✅ **ICA** (Impuesto de Industria y Comercio)

### Protección de Datos
- ✅ **Ley 1581/2012** (Protección de datos personales)
- ✅ **Habeas Data**
- ✅ **Decreto 1377/2013**

---

## 🔧 Guía de Despliegue Paso a Paso

### Requisitos

| Herramienta | Versión Mínima | Descarga |
|---|---|---|
| Node.js | 22+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 10+ | `npm install -g pnpm` |
| Python | 3.14+ | [python.org](https://python.org/) |
| PostgreSQL | 16+ | [postgresql.org](https://postgresql.org/) |
| Git | - | [git-scm.com](https://git-scm.com/) |
| Docker (opcional) | - | [docker.com](https://docker.com/) |

---

### Desarrollo Local (Windows)

#### PowerShell (recomendado)

```powershell
# 1. Clonar el repositorio
git clone https://github.com/jesus3131/ContaPro-ERP.git
cd ContaPro-ERP

# 2. Configurar variables de entorno del backend
cd backend
copy .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 3. Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# 4. Instalar dependencias del backend
pip install -r requirements.txt

# 5. Iniciar el backend (Terminal 1)
uvicorn app.main:app --reload --host 0.0.0.0
# El backend se inicia en http://localhost:8000
# Docs: http://localhost:8000/docs
# Seed automático: crea usuario admin / admin123

# 6. En una NUEVA terminal, configurar e iniciar el frontend
cd frontend

# Crear archivo de entorno del frontend
New-Item -ItemType File -Name ".env.local"
Set-Content -Path ".env.local" -Value "BACKEND_URL=http://localhost:8000"

# Instalar dependencias con pnpm
pnpm install

# Iniciar el frontend
pnpm dev
# Se inicia en http://localhost:3000

# 7. Abrir el navegador en http://localhost:3000/login
#    Usuario: admin / Contraseña: admin123
```

#### Solución de problemas comunes en Windows

```
Error: 'pnpm' no se reconoce como un comando
  → npm install -g pnpm

Error: 'pip' no se reconoce como un comando
  → Asegúrate de que Python está en PATH
  → Usa: python -m pip install -r requirements.txt

Error de conexión a PostgreSQL
  → Verifica que PostgreSQL está instalado y corriendo
  → Verifica las credenciales en backend/.env
  → El puerto por defecto es 5432

Error: El archivo .venv/Scripts/Activate.ps1 no se puede cargar
  → Ejecuta: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  → O usa: .\venv\Scripts\activate.bat (CMD)
```

---

### Desarrollo Local (Linux/Mac)

```bash
# 1. Clonar el repositorio
git clone https://github.com/jesus3131/ContaPro-ERP.git
cd ContaPro-ERP

# 2. Backend
cd backend
cp .env.example .env
# Editar .env con tus credenciales

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Iniciar backend (Terminal 1)
uvicorn app.main:app --reload --host 0.0.0.0

# 3. Frontend (Terminal 2)
cd frontend
echo "BACKEND_URL=http://localhost:8000" > .env.local
pnpm install
pnpm dev
```

---

### Acceso Multi-dispositivo en LAN

Para acceder desde otros dispositivos en la misma red (ej: tablet, celular, otro PC):

```powershell
# 1. Obtener tu IP local
ipconfig
# Busca "Dirección IPv4" ej: 192.168.1.10

# 2. Iniciar backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0

# 3. Iniciar frontend (se expone en 0.0.0.0 por defecto)
cd frontend
pnpm dev

# 4. Desde cualquier dispositivo en la misma red:
#    http://192.168.1.10:3000/login
```

**Nota:** El frontend usa un **proxy interno** (Next.js Rewrites) que redirige `/api/*` al backend. Esto significa que:
- No necesitas configurar CORS
- No necesitas cambios de configuración por IP
- Funciona desde cualquier hostname o IP

---

### Docker Compose

Para entornos de desarrollo o producción con un solo comando:

```bash
# Iniciar todos los servicios
docker-compose up --build

# Solo la base de datos
docker-compose up -d postgres

# Servicios específicos
docker-compose up -d postgres redis backend frontend
```

Servicios disponibles:

| Servicio | Puerto | URL |
|---|---|---|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 8000 | http://localhost:8000 |
| Documentación API | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Nginx | 80/443 | http://localhost |

---

### Despliegue en Producción

#### 1. Base de Datos (Supabase o PostgreSQL propio)

```bash
# Opción A: Supabase (recomendado para empezar)
# 1. Crear proyecto en https://supabase.com
# 2. Obtener credenciales del project settings

# Opción B: PostgreSQL propio
# Instalar y configurar PostgreSQL 16+
```

#### 2. Configurar variables de entorno

```bash
# backend/.env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
SECRET_KEY=<generar-clave-segura>
CORS_ORIGINS=["https://tudominio.com"]

# frontend/.env.local
BACKEND_URL=https://api.tudominio.com
```

#### 3. Construir y desplegar

```bash
# Backend
cd backend
docker build -t contapro-backend .
docker run -d --name contapro-backend -p 8000:8000 contapro-backend

# Frontend
cd frontend
pnpm install
pnpm build
pnpm start   # Inicia en puerto 3000

# O con Docker:
docker build -t contapro-frontend .
docker run -d --name contapro-frontend -p 3000:3000 contapro-frontend
```

#### 4. Proxy Inverso con Nginx

```nginx
# /etc/nginx/sites-available/contapro
server {
    listen 80;
    server_name tudominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API (opcional, el frontend ya hace proxy)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

#### 5. Verificar el despliegue

```
http://tudominio.com        → Frontend
http://tudominio.com/login  → Login (admin / admin123)
http://tudominio.com/docs   → Documentación API
http://tudominio.com/health → Health check
```

---

## 📖 API REST

### Autenticación

```
POST   /api/v1/auth/login              # Iniciar sesión
POST   /api/v1/auth/register           # Registrar usuario
GET    /api/v1/auth/me                 # Perfil del usuario
POST   /api/v1/auth/companies          # Crear empresa
GET    /api/v1/auth/companies          # Listar empresas
```

### Contabilidad

```
GET    /api/v1/accounting/puc                    # Obtener PUC
POST   /api/v1/accounting/puc/seed               # Cargar PUC Colombia
POST   /api/v1/accounting/accounts               # Crear cuenta
GET    /api/v1/accounting/accounts/{id}          # Detalle cuenta
POST   /api/v1/accounting/entries                # Crear comprobante
GET    /api/v1/accounting/entries                # Listar comprobantes
GET    /api/v1/accounting/trial-balance          # Balance de prueba
GET    /api/v1/accounting/balance-sheet          # Balance general
GET    /api/v1/accounting/income-statement       # Estado de resultados
```

### Financiero

```
GET    /api/v1/financial/indicators    # Indicadores financieros
GET    /api/v1/financial/cash-flow     # Flujo de caja
```

### Clientes / Proveedores / Empleados

```
GET    /api/v1/clients/                # Listar clientes
POST   /api/v1/clients/                # Crear cliente
GET    /api/v1/clients/suppliers       # Listar proveedores
POST   /api/v1/clients/suppliers       # Crear proveedor
GET    /api/v1/clients/employees       # Listar empleados
POST   /api/v1/clients/employees       # Crear empleado
```

### Facturación

```
GET    /api/v1/invoicing/invoices                  # Listar facturas
POST   /api/v1/invoicing/invoices                  # Crear factura
POST   /api/v1/invoicing/invoices/{id}/validate-dian # Validar DIAN
POST   /api/v1/invoicing/invoices/{id}/send-dian    # Enviar DIAN
PUT    /api/v1/invoicing/invoices/{id}/cancel       # Anular factura
```

### Inventario

```
GET    /api/v1/inventory/products         # Listar productos
POST   /api/v1/inventory/products         # Crear producto
GET    /api/v1/inventory/products/{id}    # Detalle producto
PUT    /api/v1/inventory/products/{id}    # Actualizar producto
DELETE /api/v1/inventory/products/{id}    # Eliminar producto
POST   /api/v1/inventory/movements       # Registrar movimiento
GET    /api/v1/inventory/kardex/{id}     # Consultar kardex
GET    /api/v1/inventory/stock-alerts    # Alertas de stock
```

### Nómina

```
POST   /api/v1/payroll/periods           # Crear período de nómina
POST   /api/v1/payroll/settle/{id}       # Liquidar nómina
GET    /api/v1/payroll/settlements       # Listar liquidaciones
```

### Reportes

```
GET    /api/v1/reports/balance-sheet        # Balance General
GET    /api/v1/reports/income-statement     # Estado Resultados
GET    /api/v1/reports/cash-flow            # Flujo de Efectivo
GET    /api/v1/reports/trial-balance        # Balance de Prueba
GET    /api/v1/reports/accounts-receivable  # Cartera
GET    /api/v1/reports/inventory-report     # Inventario
GET    /api/v1/reports/payroll-report       # Nómina
GET    /api/v1/reports/tax-report           # Impuestos
```

### Inteligencia Artificial

```
POST   /api/v1/ai/analyze               # Analizar finanzas
POST   /api/v1/ai/detect-errors         # Detectar errores contables
POST   /api/v1/ai/predict-cash-flow     # Predecir flujo de caja
POST   /api/v1/ai/generate-report       # Generar reporte IA
```

### Dashboard

```
GET    /api/v1/dashboard/summary               # Resumen ejecutivo
GET    /api/v1/dashboard/monthly-evolution     # Evolución mensual
GET    /api/v1/dashboard/accounts-receivable   # Cuentas por cobrar
```

---

## 🗄 Estructura de la Base de Datos

### Diagrama de Tablas

```
companies
├── users (via user_companies)
├── accounts (PUC)
│   └── accounting_entry_details
│       └── accounting_entries
├── clients
│   ├── invoices
│   │   └── invoice_items
│   ├── credit_notes
│   └── debit_notes
├── suppliers
├── employees
│   └── payroll_settlements
│       └── payroll_periods
├── products
│   ├── inventory_movements
│   │   └── kardex
│   └── invoice_items
├── budgets
├── cash_flow_projections
├── financial_indicators
├── bank_accounts
│   └── bank_transactions
└── closings
```

### Listado Completo de Tablas (25+)

| # | Tabla | Módulo | Descripción |
|---|---|---|---|
| 1 | `companies` | Core | Empresas registradas |
| 2 | `users` | Core | Usuarios del sistema |
| 3 | `user_companies` | Core | Relación usuario-empresa |
| 4 | `audit_logs` | Core | Auditoría de movimientos |
| 5 | `clients` | Admin | Clientes |
| 6 | `suppliers` | Admin | Proveedores |
| 7 | `employees` | Admin | Empleados |
| 8 | `accounts` | Contable | Plan de Cuentas (PUC) |
| 9 | `accounting_entries` | Contable | Comprobantes contables |
| 10 | `accounting_entry_details` | Contable | Detalles de asientos |
| 11 | `closings` | Contable | Cierres contables |
| 12 | `budgets` | Financiero | Presupuestos |
| 13 | `cash_flow_projections` | Financiero | Proyecciones flujo caja |
| 14 | `financial_indicators` | Financiero | Indicadores calculados |
| 15 | `invoices` | Facturación | Facturas electrónicas |
| 16 | `invoice_items` | Facturación | Ítems de factura |
| 17 | `credit_notes` | Facturación | Notas crédito |
| 18 | `debit_notes` | Facturación | Notas débito |
| 19 | `products` | Inventario | Productos |
| 20 | `inventory_movements` | Inventario | Movimientos de inventario |
| 21 | `kardex` | Inventario | Registro kardex |
| 22 | `payroll_periods` | Nómina | Períodos de nómina |
| 23 | `payroll_settlements` | Nómina | Liquidaciones de nómina |
| 24 | `bank_accounts` | Bancos | Cuentas bancarias |
| 25 | `bank_transactions` | Bancos | Transacciones bancarias |

---

## 🔒 Seguridad

### Autenticación

- **JWT** (JSON Web Tokens) con expiración configurable
- **Hash de contraseñas** con bcrypt (passlib)
- Token se almacena en `localStorage` con clave `token`
- Compañía activa se almacena en `localStorage` con clave `companyId`
- Integración opcional con Supabase Auth

### Row Level Security (RLS)

Las tablas tienen RLS habilitado con políticas basadas en la compañía del usuario autenticado:

```sql
-- Cada usuario solo ve datos de su compañía
CREATE POLICY "company access" ON clients
  FOR ALL USING (user_belongs_to_company(company_id));

-- Los administradores pueden gestionar usuarios de su compañía
CREATE POLICY "admin access" ON user_companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_companies uc
      WHERE uc.user_id = get_current_user_id()
      AND uc.company_id = user_companies.company_id
      AND uc.role = 'admin')
  );
```

### Proxy de API

El frontend nunca expone la URL del backend al cliente. Todas las llamadas pasan por el proxy de Next.js, lo que:
- Evita exponer `localhost:8000` al navegador
- Funciona desde cualquier IP/hostname
- Elimina la necesidad de configurar CORS para desarrollo multi-dispositivo

### Seed Data

Al iniciar el backend por primera vez, se crea automáticamente:
- **Usuario admin**: `admin` / `admin123` (superuser)
- **Empresa por defecto**: `Mi Empresa S.A.S.` (NIT: 900000000-1)

> ⚠️ **Importante:** Cambia la contraseña del admin inmediatamente después del primer despliegue en producción.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de código

- **Python**: PEP 8, type hints, comentarios en español al inicio de cada archivo
- **TypeScript/React**: ESLint, componentes funcionales, comentarios en español
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Ramas**: `feature/*`, `fix/*`, `refactor/*`, `docs/*`

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <p>Desarrollado con ❤️ para la comunidad contable colombiana</p>
  <p>
    <a href="https://github.com/jesus3131/ContaPro-ERP/issues">Reportar un problema</a>
    ·
    <a href="https://github.com/jesus3131/ContaPro-ERP/discussions">Discusiones</a>
    ·
    <a href="mailto:jesus3131@users.noreply.github.com">Contacto</a>
  </p>
  <br/>
  <p>
    <sub>© 2026 ContaPro ERP Colombia. Todos los derechos reservados.</sub>
  </p>
</div>
