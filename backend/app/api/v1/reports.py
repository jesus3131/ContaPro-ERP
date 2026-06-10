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
from app.models.clients import Client, Employee
from app.models.inventory import Product
from app.models.payroll import PayrollSettlement
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


@router.get("/trial-balance")
async def download_trial_balance(
    end_date: date = Query(...),
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    data = await _get_trial_balance_data(company.id, end_date, db)
    return await generator.generate_report("trial_balance", data, format)


@router.get("/accounts-receivable")
async def download_accounts_receivable(
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    data = await _get_receivable_data(company.id, db)
    return await generator.generate_report("accounts_receivable", data, format)


@router.get("/inventory-report")
async def download_inventory_report(
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    data = await _get_inventory_data(company.id, db)
    return await generator.generate_report("inventory_report", data, format)


@router.get("/payroll-report")
async def download_payroll_report(
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    data = await _get_payroll_data(company.id, db)
    return await generator.generate_report("payroll_report", data, format)


@router.get("/tax-report")
async def download_tax_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    format: str = Query(default="pdf"),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    generator = ReportGenerator(company, db)
    data = await _get_tax_data(company.id, start_date, end_date, db)
    return await generator.generate_report("tax_report", data, format)


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


async def _get_trial_balance_data(company_id: int, end_date: date, db: AsyncSession):
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company_id,
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
        net = account.opening_balance + (d - c)
        result.append({
            "code": account.code, "name": account.name,
            "debit": d, "credit": c, "balance": net,
            "type": account.account_type.value,
        })
    return result


async def _get_receivable_data(company_id: int, db: AsyncSession):
    clients = await db.execute(
        select(Client).where(
            Client.company_id == company_id,
            Client.is_active == True,
        ).order_by(Client.business_name)
    )
    return [
        {"code": c.document_number, "name": c.business_name or f"{c.first_name} {c.last_name}",
         "city": c.city or "", "credit_limit": c.credit_limit or 0}
        for c in clients.scalars().all()
    ]


async def _get_inventory_data(company_id: int, db: AsyncSession):
    products = await db.execute(
        select(Product).where(
            Product.company_id == company_id,
            Product.is_active == True,
        ).order_by(Product.name)
    )
    return [
        {"code": p.code, "name": p.name, "category": p.category or "",
         "stock": p.current_stock, "price": p.sale_price, "cost": p.cost_price}
        for p in products.scalars().all()
    ]


async def _get_payroll_data(company_id: int, db: AsyncSession):
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(PayrollSettlement).options(joinedload(PayrollSettlement.employee)).where(
            PayrollSettlement.company_id == company_id,
        ).order_by(PayrollSettlement.id.desc()).limit(50)
    )
    data = []
    for s in result.scalars().all():
        emp = s.employee
        name = f"{emp.first_name} {emp.last_name}" if emp else str(s.employee_id)
        data.append({
            "employee": name, "gross": s.gross_salary,
            "deductions": s.total_deductions, "net": s.net_payment,
            "severance": s.severance, "prima": s.prima, "vacation": s.vacation,
        })
    return data


async def _get_tax_data(company_id: int, start_date: date, end_date: date, db: AsyncSession):
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company_id,
            Account.account_type == AccountType.PASIVO,
            Account.code.like("24%"),
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
        result.append({"code": account.code, "name": account.name, "debit": d, "credit": c, "balance": c - d})
    return result
