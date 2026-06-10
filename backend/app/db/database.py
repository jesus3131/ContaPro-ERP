# database.py
# Propósito: Configuración de base de datos: engine, sesiones asíncronas, init_db

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.core.config import settings

engine = create_async_engine(settings.async_database_url, echo=False, future=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db(request: Request = None) -> AsyncSession:
    async with async_session() as session:
        try:
            if request and hasattr(request.state, "user_id") and request.state.user_id:
                await session.execute(
                    text(f"SET app.current_user_id = '{request.state.user_id}'")
                )
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
