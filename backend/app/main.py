from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.db.seed import seed_default_admin
import app.models
from app.api.v1 import auth, accounting, financial, clients, invoicing, inventory, payroll, reports, ai, dashboard

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="ERP Contable y Administrativo para Colombia",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_STR}/auth", tags=["Autenticación"])
app.include_router(accounting.router, prefix=f"{settings.API_STR}/accounting", tags=["Contabilidad"])
app.include_router(financial.router, prefix=f"{settings.API_STR}/financial", tags=["Financiero"])
app.include_router(clients.router, prefix=f"{settings.API_STR}/clients", tags=["Clientes"])
app.include_router(invoicing.router, prefix=f"{settings.API_STR}/invoicing", tags=["Facturación"])
app.include_router(inventory.router, prefix=f"{settings.API_STR}/inventory", tags=["Inventario"])
app.include_router(payroll.router, prefix=f"{settings.API_STR}/payroll", tags=["Nómina"])
app.include_router(reports.router, prefix=f"{settings.API_STR}/reports", tags=["Reportes"])
app.include_router(ai.router, prefix=f"{settings.API_STR}/ai", tags=["Inteligencia Artificial"])
app.include_router(dashboard.router, prefix=f"{settings.API_STR}/dashboard", tags=["Dashboard"])


@app.on_event("startup")
async def startup():
    await init_db()
    await seed_default_admin()


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
