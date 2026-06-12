# database.py
# Propósito: Configuración de base de datos: engine, sesiones asíncronas, init_db

from fastapi import Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (AsyncSession, async_sessionmaker,
                                    create_async_engine)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(settings.async_database_url, echo=False, future=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db(request: Request = None) -> AsyncSession:
    async with async_session() as session:
        try:
            if request and hasattr(request.state, "user_id") and request.state.user_id:
                # SQLite does not support PostgreSQL's set_config.
                # We only set a contextual value when using a Postgres DB.
                if settings.async_database_url.startswith("postgres"):
                    await session.execute(
                        text("SELECT set_config('app.current_user_id', :uid, true)"),
                        {"uid": request.state.user_id},
                    )
                else:
                    # No-op for SQLite (and other engines) to avoid runtime failures.
                    pass
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables using async connection"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✓ Database tables created/verified")
    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        raise
