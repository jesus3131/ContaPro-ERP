from typing import Optional

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import Company, User, UserCompany

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
    # Store JWT claims for RBAC
    request.state.token_company_id = payload.get("company_id")
    request.state.token_role = payload.get("role")
    try:
        await db.execute(text("SELECT set_config('app.current_user_id', :uid, true)"), {"uid": str(user.id)})
    except Exception:
        pass
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

    # Also store role from DB into request.state for RBAC
    uc_result = await db.execute(
        select(UserCompany).where(
            UserCompany.user_id == current_user.id,
            UserCompany.company_id == company.id,
        )
    )
    uc = uc_result.scalars().first()
    request.state.db_role = uc.role if uc else "viewer"

    try:
        await db.execute(text("SELECT set_config('app.current_company_id', :cid, true)"), {"cid": str(company.id)})
    except Exception:
        pass
    return company


def require_role(allowed_roles: list[str]):
    """Dependency factory: verifies the user has one of the allowed roles."""
    async def role_checker(request: Request, current_user: User = Depends(get_current_user)):
        role = getattr(request.state, "db_role", None) or getattr(request.state, "token_role", None)
        if current_user.is_superuser:
            return True
        if role is None or role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' not authorized. Required one of: {', '.join(allowed_roles)}",
            )
        return True
    return role_checker
