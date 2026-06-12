from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.sentry import init_sentry
from app.db.database import init_db
from app.db.seed import seed_default_admin
import app.models
from app.api.v1 import auth, accounting, financial, clients, invoicing, inventory, payroll, reports, ai, dashboard, admin

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="ERP Contable y Administrativo para Colombia",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,
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
app.include_router(admin.router, prefix=f"{settings.API_STR}/admin", tags=["Administración"])

# Initialize Sentry for error monitoring
init_sentry()

# Validate SECRET_KEY in production-like environments
if settings.SECRET_KEY in ("your-secret-key-change-in-production", "contapro-supabase-secret-key-change-in-production"):
    import os
    if not os.getenv("SECRET_KEY"):
        print("⚠ WARNING: Using default SECRET_KEY. Set SECRET_KEY env var in production.")


@app.on_event("startup")
async def startup():
    import asyncio
    try:
        print("⏳ Connecting to database...")
        await asyncio.wait_for(init_db(), timeout=60.0)
        print("✓ Database initialized successfully")
    except asyncio.TimeoutError:
        print("⚠ Database initialization timed out (60s) - proceeding anyway")
    except Exception as e:
        print(f"⚠ Database initialization failed: {e} - proceeding anyway")
    
    try:
        print("⏳ Seeding default admin...")
        await asyncio.wait_for(seed_default_admin(), timeout=30.0)
        print("✓ Seed data created successfully")
    except asyncio.TimeoutError:
        print("⚠ Seed operation timed out (30s) - proceeding anyway")
    except Exception as e:
        print(f"⚠ Seed operation failed: {e} - proceeding anyway")


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
