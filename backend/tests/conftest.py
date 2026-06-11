"""Pytest configuration for async tests with test SQLite database."""
import sys
import os
import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ["USE_SQLITE"] = "true"

from app.main import app
from app.db.database import Base, get_db
from app.core.security import get_password_hash
from app.models.user import User, Company, UserCompany

TEST_DB_URL = "sqlite+aiosqlite:///./test_contapro.db"
test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


async def seed_test_data(session: AsyncSession):
    admin = User(
        username="admin", email="admin@contapro.com",
        full_name="Administrador",
        password_hash=get_password_hash("admin123"),
        is_superuser=True,
    )
    session.add(admin)
    await session.flush()

    company = Company(
        name="Mi Empresa", business_name="Mi Empresa S.A.S.",
        nit="900000000-1", dv="0",
        city="Bogotá", department="Cundinamarca", regime_type="Común",
    )
    session.add(company)
    await session.flush()

    session.add(UserCompany(user_id=admin.id, company_id=company.id, role="admin"))
    await session.commit()


@pytest.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSessionLocal() as session:
        await seed_test_data(session)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session
