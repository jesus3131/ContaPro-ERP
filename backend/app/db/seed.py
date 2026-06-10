# seed.py
# Propósito: Datos semilla: creación de usuario admin y empresa por defecto

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import async_session
from app.models.user import User, Company, UserCompany
from app.core.security import get_password_hash


async def seed_default_admin():
    async with async_session() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        if result.scalars().first():
            return

        admin = User(
            username="admin",
            email="admin@contapro.com",
            full_name="Administrador",
            password_hash=get_password_hash("admin123"),
            is_superuser=True,
        )
        db.add(admin)
        await db.flush()

        result = await db.execute(select(Company).where(Company.nit == "900000000-1"))
        company = result.scalars().first()
        if not company:
            company = Company(
                name="Mi Empresa",
                business_name="Mi Empresa S.A.S.",
                nit="900000000-1",
                dv="0",
                city="Bogotá",
                department="Cundinamarca",
                regime_type="Común",
            )
            db.add(company)
            await db.flush()

        user_company = UserCompany(user_id=admin.id, company_id=company.id, role="admin")
        db.add(user_company)
        await db.commit()
