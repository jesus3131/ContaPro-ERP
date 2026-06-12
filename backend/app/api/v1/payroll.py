from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.deps import get_current_company, get_current_user, require_role
from app.db.database import get_db
from app.models.clients import Employee
from app.models.payroll import PayrollPeriod, PayrollSettlement
from app.models.user import Company, User
from app.services.payroll_calculator import PayrollCalculator

router = APIRouter()

_reader = require_role(["admin", "contador", "gerente", "viewer"])
_writer = require_role(["admin", "contador", "gerente"])


@router.get("/periods")
async def list_periods(
    year: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    query = select(PayrollPeriod).where(PayrollPeriod.company_id == company.id)
    if year:
        query = query.where(PayrollPeriod.year == year)
    query = query.order_by(PayrollPeriod.year.desc(), PayrollPeriod.month.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    periods = result.scalars().all()
    return [
        {
            "id": p.id,
            "period": f"{p.year}-{p.month:02d}",
            "start_date": p.start_date.isoformat(),
            "end_date": p.end_date.isoformat(),
            "payment_date": p.payment_date.isoformat() if p.payment_date else None,
            "is_closed": p.is_closed,
        }
        for p in periods
    ]


@router.post("/periods")
async def create_period(
    year: int, month: int, period_type: str = "Monthly",
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    existing = await db.execute(
        select(PayrollPeriod).where(
            PayrollPeriod.company_id == company.id,
            PayrollPeriod.year == year,
            PayrollPeriod.month == month,
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Period already exists")

    import calendar
    last_day = calendar.monthrange(year, month)[1]
    period = PayrollPeriod(
        company_id=company.id,
        year=year,
        month=month,
        period_type=period_type,
        start_date=date(year, month, 1),
        end_date=date(year, month, last_day),
        payment_date=date(year, month, last_day),
    )
    db.add(period)
    await db.commit()
    await db.refresh(period)
    return {"id": period.id, "period": f"{year}-{month:02d}", "status": "created"}


@router.post("/settle/{period_id}")
async def settle_payroll(
    period_id: int,
    company: Company = Depends(get_current_company),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(["admin", "contador", "gerente"])),
):
    period = await db.get(PayrollPeriod, period_id)
    if not period or period.company_id != company.id:
        raise HTTPException(status_code=404, detail="Period not found")

    employees = await db.execute(
        select(Employee).where(Employee.company_id == company.id, Employee.is_active == True)
    )

    calculator = PayrollCalculator()
    settlements = []
    for emp in employees.scalars().all():
        result = calculator.calculate(emp, period)
        settlement = PayrollSettlement(
            company_id=company.id,
            employee_id=emp.id,
            period_id=period_id,
            **result,
        )
        db.add(settlement)
        settlements.append(settlement)

    period.is_closed = True
    await db.commit()

    return {"message": f"Payroll settled for {len(settlements)} employees", "period_id": period_id}


@router.get("/settlements")
async def list_settlements(
    period_id: int = Query(...),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(PayrollSettlement).options(joinedload(PayrollSettlement.employee)).where(
            PayrollSettlement.company_id == company.id,
            PayrollSettlement.period_id == period_id,
        ).offset(skip).limit(limit)
    )
    settlements = result.scalars().all()
    response = []
    for s in settlements:
        emp = s.employee
        response.append({
            "id": s.id,
            "employee": f"{emp.first_name} {emp.last_name}" if emp else "N/A",
            "gross_salary": s.gross_salary,
            "total_deductions": s.total_deductions,
            "net_payment": s.net_payment,
            "severance": s.severance,
            "prima": s.prima,
            "vacation": s.vacation,
            "status": s.status,
        })
    return response
