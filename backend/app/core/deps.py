# deps.py
# Propósito: Dependencias FastAPI: obtener usuario actual, verificar permisos

from fastapi import Depends, HTTPException, status, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.db.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, Company, UserCompany

security_scheme = HTTPBearer()


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    request.state.user_id = str(user.id)
    await db.execute(text(f"SET app.current_user_id = '{user.id}'"))
    return user


async def get_current_company(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    x_company_id: Optional[int] = Header(default=None),
) -> Company:
    query = select(Company).join(UserCompany).where(
        UserCompany.user_id == current_user.id,
        UserCompany.is_active == True,
    )
    if x_company_id:
        query = query.where(Company.id == x_company_id)
    result = await db.execute(query)
    company = result.scalars().first()
    if company is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active company found")

    request.state.company_id = str(company.id)
    await db.execute(text(f"SET app.current_company_id = '{company.id}'"))
    return company
