from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_company, require_role
from app.db.database import get_db
from app.models.accounting import (Account, AccountingEntry,
                                   AccountingEntryDetail, AccountType)
from app.models.financial import Budget
from app.models.user import Company

router = APIRouter()

_reader = require_role(["admin", "contador", "gerente", "viewer"])


@router.get("/indicators")
async def get_financial_indicators(
    year: int,
    month: Optional[int] = None,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    import calendar
    end_date = date(year, month or 12, month and calendar.monthrange(year, month)[1] or 31)

    async def get_balance_by_type(account_type: AccountType) -> float:
        acct_ids_r = await db.execute(
            select(Account.id).where(
                Account.company_id == company.id,
                Account.account_type == account_type,
            )
        )
        acct_ids = [r[0] for r in acct_ids_r.all()]
        if not acct_ids:
            return 0.0

        details_r = await db.execute(
            select(
                AccountingEntryDetail.account_id,
                AccountingEntryDetail.debit,
                AccountingEntryDetail.credit,
            )
            .join(AccountingEntry)
            .where(
                AccountingEntryDetail.account_id.in_(acct_ids),
                AccountingEntry.date <= end_date,
                AccountingEntry.is_reversed == False,
            )
        )

        total = 0.0
        for det in details_r.all():
            _, debit, credit = det
            total += float(debit or 0) - float(credit or 0)
        return total

    total_assets = await get_balance_by_type(AccountType.ACTIVO)
    total_liabilities = await get_balance_by_type(AccountType.PASIVO)
    total_equity = await get_balance_by_type(AccountType.PATRIMONIO)
    total_income = await get_balance_by_type(AccountType.INGRESO)

    liquidity = round(total_assets / total_liabilities, 2) if total_liabilities else 0
    debt_ratio = round((total_liabilities / total_assets) * 100, 2) if total_assets else 0
    roe = round((total_income / total_equity) * 100, 2) if total_equity else 0

    return {
        "period": {"year": year, "month": month},
        "liquidity": {"value": liquidity, "name": "Liquidez Corriente", "interpretation": f"La empresa tiene ${liquidity} por cada peso de deuda" if liquidity >= 1 else "Riesgo de liquidez"},
        "debt_ratio": {"value": debt_ratio, "name": "Endeudamiento", "interpretation": f"El {debt_ratio}% de los activos están financiados con deuda"},
        "roe": {"value": roe, "name": "Rentabilidad del Patrimonio", "interpretation": f"Retorno sobre patrimonio del {roe}%"},
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "total_equity": total_equity,
        "total_income": total_income,
    }


@router.get("/cash-flow")
async def get_cash_flow(
    start_date: date,
    end_date: date,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    cash_accounts = await db.execute(
        select(Account).where(
            Account.company_id == company.id,
            Account.code.like("11%"),
            Account.is_active == True,
        )
    )
    cash_ids = [a.id for a in cash_accounts.scalars().all()]

    entries = await db.execute(
        select(AccountingEntryDetail, AccountingEntry).join(
            AccountingEntry
        ).where(
            AccountingEntryDetail.account_id.in_(cash_ids),
            AccountingEntry.company_id == company.id,
            AccountingEntry.date.between(start_date, end_date),
            AccountingEntry.is_reversed == False,
        )
    )

    total_inflow = 0
    total_outflow = 0
    for detail, entry in entries.all():
        if detail.nature == "Debito":
            total_inflow += detail.debit
        else:
            total_outflow += detail.credit

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_inflow": total_inflow,
        "total_outflow": total_outflow,
        "net_cash_flow": total_inflow - total_outflow,
    }


@router.get("/budgets")
async def get_budgets(
    year: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    budgets = await db.execute(
        select(Budget).where(
            Budget.company_id == company.id,
            Budget.year == year,
        ).order_by(Budget.account_id)
    )
    return [{ "account_id": b.account_id, "month": b.month, "budgeted": b.budgeted_amount, "actual": b.actual_amount }
            for b in budgets.scalars().all()]
