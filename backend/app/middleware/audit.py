from fastapi import Request

from app.db.database import async_session
from app.models.user import AuditLog


async def log_audit(
    request: Request,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    old_values: str | None = None,
    new_values: str | None = None,
):
    company_id = getattr(request.state, "company_id", None)
    user_id = getattr(request.state, "user_id", None)
    ip_address = request.client.host if request.client else None

    if not company_id or not user_id:
        return

    async with async_session() as db:
        log = AuditLog(
            company_id=int(company_id),
            user_id=int(user_id),
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
        )
        db.add(log)
        await db.commit()
