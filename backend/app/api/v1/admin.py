from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, Company, UserCompany, AuditLog

router = APIRouter()


async def require_superadmin(current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only super admin can access this endpoint")
    return current_user


@router.get("/companies")
async def admin_list_companies(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_superadmin),
):
    result = await db.execute(select(Company).order_by(Company.name))
    companies = result.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "nit": c.nit,
            "email": c.email,
            "phone": c.phone,
            "is_active": c.is_active,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in companies
    ]


@router.get("/companies/stats")
async def admin_company_stats(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_superadmin),
):
    total = await db.execute(select(func.count(Company.id)))
    active = await db.execute(select(func.count(Company.id)).where(Company.is_active == True))
    inactive = await db.execute(select(func.count(Company.id)).where(Company.is_active == False))
    users = await db.execute(select(func.count(User.id)))
    return {
        "total_companies": total.scalar() or 0,
        "active_companies": active.scalar() or 0,
        "inactive_companies": inactive.scalar() or 0,
        "total_users": users.scalar() or 0,
    }


@router.put("/companies/{company_id}/toggle-status")
async def admin_toggle_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_superadmin),
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = not company.is_active
    await db.commit()
    return {"id": company.id, "is_active": company.is_active}


@router.get("/audit-logs")
async def admin_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_superadmin),
):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    )
    logs = result.scalars().all()
    return [
        {
            "id": log.id,
            "company_id": log.company_id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.put("/users/{user_id}/role")
async def admin_set_user_role(
    user_id: int,
    company_id: int,
    role: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_superadmin),
):
    allowed_roles = ["admin", "contador", "vendedor", "inventario", "gerente", "viewer"]
    if role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Allowed: {', '.join(allowed_roles)}")
    result = await db.execute(
        select(UserCompany).where(
            UserCompany.user_id == user_id,
            UserCompany.company_id == company_id,
        )
    )
    uc = result.scalars().first()
    if not uc:
        raise HTTPException(status_code=404, detail="User not associated with this company")
    uc.role = role
    await db.commit()
    return {"user_id": user_id, "company_id": company_id, "role": role}
