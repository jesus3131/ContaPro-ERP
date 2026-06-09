
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
- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Módulos](#-módulos)
  - [Módulo Contable](#módulo-contable)
  - [Módulo Financiero](#módulo-financiero)
  - [Módulo Administrativo](#módulo-administrativo)
  - [Facturación Electrónica DIAN](#facturación-electrónica-dian)
  - [Módulo de Inventario](#módulo-de-inventario)
  - [Módulo de Nómina](#módulo-de-nómina)
  - [Inteligencia Artificial](#inteligencia-artificial)
  - [Dashboard Inteligente](#dashboard-inteligente)
  - [Reportes](#reportes)
- [Cumplimiento Legal Colombiano](#-cumplimiento-legal-colombiano)
- [Instalación y Despliegue](#-instalación-y-despliegue)
  - [Requisitos](#requisitos)
  - [Desarrollo Local](#desarrollo-local)
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

## ✨ Características

| Característica | Descripción |
|---|---|
| 🌐 **Interfaz Moderna** | Diseño UI/UX profesional con tema claro/oscuro y responsive (PC, tablet, móvil) |
| 📊 **Dashboard Ejecutivo** | KPIs en tiempo real, gráficos interactivos (barras, líneas, áreas, pie) |
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
| [Recharts](https://recharts.org/) | 2.15 | Gráficos interactivos (barras, líneas, áreas, pie) |
| [Lucide React](https://lucide.dev/) | 0.460 | Iconos |
| [date-fns](https://date-fns.org/) | 4.1 | Manipulación de fechas |
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
| [passlib](https://passlib.readthedocs.io/) | 1.7 | Hash de contraseñas |
| [OpenAI](https://openai.com/) | 1.51 | API de IA para análisis financiero |
| [Pandas](https://pandas.pydata.org/) | 2.2 | Procesamiento de datos |
| [ReportLab](https://www.reportlab.com/) / WeasyPrint | - | Generación de PDF |
| [OpenPyXL](https://openpyxl.readthedocs.io/) | 3.1 | Generación de Excel |

### Base de Datos e Infraestructura

| Tecnología | Versión | Propósito |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/) | 16 | Base de datos relacional |
| [Supabase](https://supabase.com/) | - | Plataforma PostgreSQL + Auth + RLS |
| [Redis](https://redis.io/) | 7 | Caché y colas |
| [Docker](https://www.docker.com/) | - | Contenedores |
| [Kubernetes](https://kubernetes.io/) | - | Orquestación |
| [Nginx](https://nginx.org/) | - | Proxy inverso |

---

## 🏗 Arquitectura del Proyecto

```
contapro-erp/
├── backend/                          # API REST con FastAPI
│   ├── app/
│   │   ├── api/v1/                   # Endpoints REST
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
│   │   ├── db/                       # Conexión a base de datos
│   │   ├── models/                   # Modelos SQLAlchemy (20+ tablas)
│   │   ├── schemas/                  # Esquemas Pydantic
│   │   └── services/                 # Lógica de negocio
│   │       ├── dian.py               # Integración DIAN
│   │       ├── puc_colombia.py       # PUC Colombia (136 cuentas)
│   │       ├── payroll_calculator.py # Cálculo de nómina
│   │       ├── ai_assistant.py       # Asistente IA
│   │       └── report_generator.py   # Generador de reportes
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic/                      # Migraciones
│
├── frontend/                         # Aplicación Next.js
│   ├── src/
│   │   ├── app/                      # Páginas (App Router)
│   │   │   ├── login/                # Autenticación
│   │   │   ├── contabilidad/         # Módulo contable
│   │   │   ├── financiero/           # Módulo financiero
│   │   │   ├── facturacion/          # Facturación electrónica
│   │   │   ├── inventario/           # Inventario
│   │   │   ├── nomina/               # Nómina
│   │   │   ├── administrativo/        # Clientes, proveedores, empleados
│   │   │   ├── reportes/             # Reportes
│   │   │   ├── ia/                   # Asistente IA
│   │   │   └── page.tsx              # Dashboard principal
│   │   ├── components/
│   │   │   ├── ui/                   # Componentes atómicos (Button, Card)
│   │   │   ├── layout/               # Sidebar, Header
│   │   │   └── charts/               # Gráficos Recharts
│   │   ├── lib/                      # Utilidades
│   │   │   ├── api.ts                # Cliente API REST
│   │   │   ├── supabase.ts           # Cliente Supabase
│   │   │   └── utils.ts              # Formateo, fechas, moneda
│   │   ├── types/                    # Interfaces TypeScript
│   │   └── styles/                   # Estilos globales Tailwind
│   ├── Dockerfile
│   └── package.json
│
├── infra/                            # Infraestructura
│   ├── nginx/nginx.conf              # Configuración Nginx
│   ├── k8s/deployment.yaml           # Despliegue Kubernetes
│   └── monitoring/                   # Monitoreo
│
├── docker-compose.yml                # Orquestación Docker
├── .env                              # Variables de entorno
└── opencode.json                     # Configuración MCP Supabase
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

**Proceso de facturación:**
1. Creación de factura con ítems, impuestos y retenciones
2. Validación previa contra reglas DIAN
3. Generación de CUFE/CUDE
4. Envío a la DIAN mediante API
5. Seguimiento de estado (aceptada, rechazada)
6. Registro de eventos RADIAN

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

```mermaid
graph LR
    A[Datos Contables] --> B[IA Asistente]
    B --> C[Análisis Financiero]
    B --> D[Detección de Errores]
    B --> E[Predicción Flujo Caja]
    B --> F[Reportes Ejecutivos]
    B --> G[Alertas de Riesgo]
```

| Funcionalidad | Descripción |
|---|---|
| **Análisis Financiero** | Interpretación en lenguaje natural de balances |
| **Detección de Errores** | Identifica asientos descuadrados, cuentas mal clasificadas |
| **Predicción de Flujo de Caja** | Proyecta ingresos y egresos futuros con IA |
| **Reportes Ejecutivos** | Genera informes gerenciales automáticos |
| **Alertas de Riesgo** | Detecta patrones anómalos y riesgos financieros |

### Dashboard Inteligente

Muestra en tiempo real:

| KPI | Tipo de Gráfico | Descripción |
|---|---|---|
| Ventas del Período | 📊 Barras / Líneas | Evolución de ingresos |
| Gastos | 📊 Áreas | Composición y tendencia |
| Utilidad Neta | 📈 Líneas | Margen de utilidad |
| Flujo de Caja | 📊 Áreas | Entradas vs salidas |
| Cuentas por Cobrar | 🥧 Pie | Cartera por antigüedad |
| Cuentas por Pagar | 🥧 Pie | Obligaciones pendientes |
| Impuestos | 📊 Barras | IVA, Retefuente, ICA |

**Los gráficos permiten:**
- 🔍 Zoom y selección de rangos
- 🔄 Filtros dinámicos por período
- 📥 Exportación a imagen
- ⏱ Visualización en tiempo real

### Reportes

Generación automática en múltiples formatos:

| Reporte | PDF | Excel | CSV | Word |
|---|---|---|---|---|
| Balance General | ✅ | ✅ | ✅ | 🚧 |
| Estado de Resultados | ✅ | ✅ | ✅ | 🚧 |
| Flujo de Caja | ✅ | ✅ | ✅ | 🚧 |
| Balance de Prueba | ✅ | ✅ | ✅ | 🚧 |
| Cartera (CxC) | ✅ | ✅ | ✅ | 🚧 |
| Inventario | ✅ | ✅ | ✅ | 🚧 |
| Nómina | ✅ | ✅ | ✅ | 🚧 |
| Impuestos | ✅ | ✅ | ✅ | 🚧 |
| Reportes Gerenciales IA | ✅ | 🚧 | 🚧 | 🚧 |

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

## 🔧 Instalación y Despliegue

### Requisitos

- Node.js 22+
- Python 3.14+
- PostgreSQL 16+ (o cuenta en Supabase)
- Docker y Docker Compose (opcional)
- Git

### Desarrollo Local

#### 1. Clonar el repositorio

```bash
git clone https://github.com/jesus3131/ContaPro-ERP.git
cd ContaPro-ERP
```

#### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

#### 3. Backend

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

El backend se iniciará en `http://localhost:8000`
- Documentación interactiva: `http://localhost:8000/docs`
- Documentación Redoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

#### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se iniciará en `http://localhost:3000`

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
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Nginx | 80/443 | http://localhost |

### Despliegue en Producción

#### Supabase (Base de Datos)

```bash
# 1. Crear proyecto en Supabase

# 2. Configurar .env con credenciales
DATABASE_URL=postgresql://postgres:password@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>

# 3. Aplicar migraciones (ya ejecutadas via MCP)
```

#### Kubernetes

```bash
kubectl apply -f infra/k8s/deployment.yaml

# Verificar estado
kubectl get pods -l app=contapro
kubectl get services
kubectl get ingress
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
GET    /api/v1/financial/budgets       # Presupuestos
```

### Facturación

```
POST   /api/v1/invoicing/invoices                  # Crear factura
GET    /api/v1/invoicing/invoices                  # Listar facturas
POST   /api/v1/invoicing/invoices/{id}/validate-dian # Validar DIAN
POST   /api/v1/invoicing/invoices/{id}/send-dian    # Enviar DIAN
```

### Inventario

```
POST   /api/v1/inventory/products         # Crear producto
GET    /api/v1/inventory/products         # Listar productos
POST   /api/v1/inventory/movements       # Registrar movimiento
GET    /api/v1/inventory/kardex/{id}     # Consultar kardex
GET    /api/v1/inventory/stock-alerts    # Alertas de stock
```

### Nómina

```
POST   /api/v1/payroll/periods           # Crear período
POST   /api/v1/payroll/settle/{id}       # Liquidar nómina
GET    /api/v1/payroll/settlements       # Listar liquidaciones
```

### Reportes

```
GET    /api/v1/reports/balance-sheet     # Balance General (PDF/Excel/CSV)
GET    /api/v1/reports/income-statement  # Estado Resultados
GET    /api/v1/reports/cash-flow         # Flujo de Efectivo
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

### Listado Completo de Tablas (25)

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

### Row Level Security (RLS)

Las 25 tablas tienen RLS habilitado con políticas basadas en la compañía del usuario autenticado:

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

### Autenticación

- JWT (JSON Web Tokens) con expiración configurable
- Hash de contraseñas con bcrypt
- Integración con Supabase Auth
- Tokens de acceso renovables

### Auditoría

- Tabla `audit_logs` registra todas las operaciones CRUD
- Trazabilidad completa: usuario, acción, entidad, valores anteriores/nuevos
- Registro de dirección IP

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de código

- **Python**: PEP 8, type hints, docstrings
- **TypeScript/React**: ESLint, Prettier, componentes funcionales
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
