import calendar
from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_company, require_role
from app.db.database import get_db
from app.models.accounting import (Account, AccountingEntry,
                                   AccountingEntryDetail, AccountType)
from app.models.clients import Client
from app.models.invoicing import Invoice
from app.models.user import Company

router = APIRouter()

_reader = require_role(["admin", "contador", "gerente", "viewer"])


@router.get("/summary")
async def dashboard_summary(
    year: int = Query(default_factory=lambda: datetime.now().year),
    month: int = Query(default_factory=lambda: datetime.now().month),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    end_date = date(year, min(month, 12), calendar.monthrange(year, min(month, 12))[1])

    accounts = await db.execute(
        select(Account).where(Account.company_id == company.id)
    )
    accounts_list = accounts.scalars().all()
    total_assets = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.ACTIVO)
    total_liabilities = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.PASIVO)
    total_equity = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.PATRIMONIO)
    total_income = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.INGRESO)
    total_expenses = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.GASTO)
    total_orders = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.CUENTA_ORDEN)

    invoices = await db.execute(
        select(func.count(Invoice.id), func.coalesce(func.sum(Invoice.total), 0)).where(
            Invoice.company_id == company.id,
            extract('year', Invoice.issue_date) == year,
            extract('month', Invoice.issue_date) == month,
        )
    )
    inv_row = invoices.one()
    total_invoices = inv_row[0] or 0
    invoice_total = float(inv_row[1] or 0)

    clients_result = await db.execute(
        select(func.count(Client.id)).where(Client.company_id == company.id, Client.is_active == True)
    )
    total_clients = clients_result.scalar() or 0

    return {
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "total_equity": total_equity,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_profit": total_income - total_expenses,
        "total_invoices": total_invoices,
        "invoice_total": invoice_total,
        "total_clients": total_clients,
        "liquidity": round(total_assets / total_liabilities, 2) if total_liabilities else 0,
        "profit_margin": round(((total_income - total_expenses) / total_income) * 100, 2) if total_income else 0,
        "period": {"year": year, "month": month},
    }


@router.get("/monthly-evolution")
async def monthly_evolution(
    year: int = Query(default_factory=lambda: datetime.now().year),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    start_of_year = date(year, 1, 1)
    end_of_year = date(year, 12, 31)

    entries = await db.execute(
        select(
            extract('month', AccountingEntry.date).label('month'),
            func.coalesce(func.sum(AccountingEntryDetail.debit), 0).label('total_debits'),
            func.coalesce(func.sum(AccountingEntryDetail.credit), 0).label('total_credits'),
        ).select_from(AccountingEntryDetail).join(
            AccountingEntry, AccountingEntryDetail.entry_id == AccountingEntry.id
        ).where(
            AccountingEntry.company_id == company.id,
            AccountingEntry.date.between(start_of_year, end_of_year),
            AccountingEntry.is_reversed == False,
        ).group_by(extract('month', AccountingEntry.date))
    )

    totals_by_month = {
        int(row[0]): (float(row[1]), float(row[2]))
        for row in entries.all()
    }

    months_data = []
    for m in range(1, 13):
        const_debits, const_credits = totals_by_month.get(m, (0.0, 0.0))
        months_data.append({
            "month": m,
            "total_debits": const_debits,
            "total_credits": const_credits,
            "balance": const_credits - const_debits,
        })

    return months_data


@router.get("/accounts-receivable")
async def accounts_receivable(
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Invoice).where(
            Invoice.company_id == company.id,
            Invoice.status == "Sent",
        ).order_by(Invoice.due_date)
    )
    invoices = result.scalars().all()
    total_due = sum(i.total for i in invoices)
    overdue_count = sum(1 for i in invoices if i.due_date and i.due_date < date.today())
    return {
        "total_receivable": total_due,
        "invoice_count": len(invoices),
        "overdue_count": overdue_count,
    }
