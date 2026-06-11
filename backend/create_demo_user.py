#!/usr/bin/env python
import asyncio
import sys
import os
sys.path.insert(0, '.')
os.environ['USE_SQLITE'] = 'true'

from app.db.database import engine, Base, async_session
from app.models.user import User, Company, UserCompany
import hashlib

def simple_hash(password: str) -> str:
    """Simple hash function for demo - NOT for production"""
    return f"demo_{hashlib.sha256(password.encode()).hexdigest()}"

async def create_demo_user():
    try:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # Create session
        async with async_session() as db:
            # Check if user exists
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.username == "demo"))
            if result.scalars().first():
                print("✓ Demo user already exists")
                return
            
            # Create demo user
            user = User(
                username="demo",
                email="demo@example.com",
                full_name="Demo User",
                password_hash=simple_hash("demo123"),
                is_superuser=False,
            )
            db.add(user)
            await db.flush()
            
            # Create company
            company = Company(
                name="Demo Company",
                business_name="Demo Company S.A.S.",
                nit="999999999-1",
                dv="0",
                city="Bogotá",
                department="Cundinamarca",
                regime_type="Común",
            )
            db.add(company)
            await db.flush()
            
            # Link user to company
            user_company = UserCompany(user_id=user.id, company_id=company.id, role="admin")
            db.add(user_company)
            await db.commit()
            
            print("✓ Demo user created: demo / demo123")
    except Exception as e:
        print(f"✗ Error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(create_demo_user())
