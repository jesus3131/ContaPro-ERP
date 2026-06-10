# Módulo: dashboard
# Propósito: Resumen ejecutivo del negocio — indicadores clave, evolución mensual y cuentas por cobrar.
# Funcionalidades principales: Dashboard con totales de activos/pasivos/patrimonio/ingresos, evolución mensual de movimientos contables y estado de cuentas por cobrar.
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date, datetime
from app.db.database import get_db
from app.core.deps import get_current_company
from app.models.user import Company
from app.models.accounting import Account, AccountingEntry, AccountingEntryDetail, AccountType
from app.models.invoicing import Invoice
from app.models.clients import Client

router = APIRouter()


@router.get("/summary")
async def dashboard_summary(
    year: int = Query(default_factory=lambda: datetime.now().year),
    month: int = Query(default_factory=lambda: datetime.now().month),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    end_date = date(year, min(month, 12), 28)

    accounts = await db.execute(
        select(Account).where(Account.company_id == company.id)
    )
    total_assets = sum(a.current_balance for a in accounts.scalars().all() if a.account_type == AccountType.ACTIVO)

    accounts = await db.execute(
        select(Account).where(Account.company_id == company.id)
    )
    accounts_list = accounts.scalars().all()
    total_liabilities = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.PASIVO)
    total_equity = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.PATRIMONIO)
    total_income = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.INGRESO)
    total_expenses = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.GASTO)
    total_orders = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.CUENTA_ORDEN)

    invoices = await db.execute(
        select(func.count(Invoice.id), func.coalesce(func.sum(Invoice.total), 0)).where(
            Invoice.company_id == company.id,
            func.extract('year', Invoice.issue_date) == year,
            func.extract('month', Invoice.issue_date) == month,
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
):
    months_data = []
    for m in range(1, 13):
        end_date = date(year, m, 28)

        entries = await db.execute(
            select(AccountingEntryDetail, AccountingEntry).join(AccountingEntry).where(
                AccountingEntry.company_id == company.id,
                AccountingEntry.date <= end_date,
                AccountingEntry.is_reversed == False,
            )
        )
        total_debits = sum(d.debit for d, e in entries.all())
        total_credits = sum(d.credit for d, e in entries.all())

        months_data.append({
            "month": m,
            "total_debits": total_debits,
            "total_credits": total_credits,
            "balance": total_credits - total_debits,
        })

    return months_data


@router.get("/accounts-receivable")
async def accounts_receivable(company: Company = Depends(get_current_company), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Invoice).where(
            Invoice.company_id == company.id,
            Invoice.status.in_(["Draft", "Sent"]),
        ).order_by(Invoice.due_date)
    )
    invoices = result.scalars().all()
    total_due = sum(i.total for i in invoices if i.status in ["Draft", "Sent"])
    return {"total_receivable": total_due, "invoice_count": len(invoices)}
