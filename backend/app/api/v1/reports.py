from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from typing import Optional
from io import BytesIO
from app.db.database import get_db
from app.core.deps import get_current_company
from app.models.user import Company
from app.models.accounting import Account, AccountingEntryDetail, AccountingEntry, AccountType
from app.services.report_generator import ReportGenerator

router = APIRouter()


@router.get("/balance-sheet")
async def download_balance_sheet(
    end_date: date = Query(...),
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    data = await _get_report_data(company.id, end_date, db)
    return await generator.generate_report("balance_sheet", data, format)


@router.get("/income-statement")
async def download_income_statement(
    start_date: date = Query(...),
    end_date: date = Query(...),
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    data = await _get_income_data(company.id, start_date, end_date, db)
    return await generator.generate_report("income_statement", data, format)


@router.get("/cash-flow")
async def download_cash_flow(
    start_date: date = Query(...),
    end_date: date = Query(...),
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    return await generator.generate_report("cash_flow", {}, format)


async def _get_report_data(company_id: int, end_date: date, db: AsyncSession):
    real_types = [AccountType.ACTIVO, AccountType.PASIVO, AccountType.PATRIMONIO]
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company_id,
            Account.account_type.in_(real_types),
            Account.is_active == True,
        ).order_by(Account.code)
    )
    result = []
    for account in accounts.scalars().all():
        debits = await db.execute(
            select(AccountingEntryDetail.debit).join(AccountingEntry).where(
                AccountingEntryDetail.account_id == account.id,
                AccountingEntry.company_id == company_id,
                AccountingEntry.date <= end_date,
                AccountingEntry.is_reversed == False,
            )
        )
        credits = await db.execute(
            select(AccountingEntryDetail.credit).join(AccountingEntry).where(
                AccountingEntryDetail.account_id == account.id,
                AccountingEntry.company_id == company_id,
                AccountingEntry.date <= end_date,
                AccountingEntry.is_reversed == False,
            )
        )
        d = sum((r[0] or 0) for r in debits.all())
        c = sum((r[0] or 0) for r in credits.all())
        balance = account.opening_balance + (d - c) if account.account_type == AccountType.ACTIVO else account.opening_balance + (c - d)
        result.append({"code": account.code, "name": account.name, "balance": balance, "type": account.account_type.value})
    return result


async def _get_income_data(company_id: int, start_date: date, end_date: date, db: AsyncSession):
    income_types = [AccountType.INGRESO, AccountType.GASTO, AccountType.COSTO]
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company_id,
            Account.account_type.in_(income_types),
            Account.is_active == True,
        ).order_by(Account.code)
    )
    result = []
    for account in accounts.scalars().all():
        debits = await db.execute(
            select(AccountingEntryDetail.debit).join(AccountingEntry).where(
                AccountingEntryDetail.account_id == account.id,
                AccountingEntry.company_id == company_id,
                AccountingEntry.date.between(start_date, end_date),
                AccountingEntry.is_reversed == False,
            )
        )
        credits = await db.execute(
            select(AccountingEntryDetail.credit).join(AccountingEntry).where(
                AccountingEntryDetail.account_id == account.id,
                AccountingEntry.company_id == company_id,
                AccountingEntry.date.between(start_date, end_date),
                AccountingEntry.is_reversed == False,
            )
        )
        d = sum((r[0] or 0) for r in debits.all())
        c = sum((r[0] or 0) for r in credits.all())
        balance = (c - d) if account.account_type == AccountType.INGRESO else (d - c)
        result.append({"code": account.code, "name": account.name, "balance": balance, "type": account.account_type.value})
    return result
