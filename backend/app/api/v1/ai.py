from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from app.db.database import get_db
from app.core.deps import get_current_company
from app.core.config import settings
from app.models.user import Company
from app.models.accounting import Account, AccountingEntry, AccountingEntryDetail, AccountType
from app.services.ai_assistant import AIAssistant

router = APIRouter()


@router.post("/analyze")
async def analyze_financials(
    year: int,
    month: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=400, detail="OpenAI API key not configured")

    end_date = date(year, min(month, 12), 28)
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company.id,
            Account.is_active == True,
            Account.accepts_movements == True,
        ).order_by(Account.code)
    )
    account_data = []
    for acc in accounts.scalars().all():
        debits = await db.execute(
            select(AccountingEntryDetail.debit).join(AccountingEntry).where(
                AccountingEntryDetail.account_id == acc.id,
                AccountingEntry.company_id == company.id,
                AccountingEntry.date <= end_date,
                AccountingEntry.is_reversed == False,
            )
        )
        credits = await db.execute(
            select(AccountingEntryDetail.credit).join(AccountingEntry).where(
                AccountingEntryDetail.account_id == acc.id,
                AccountingEntry.company_id == company.id,
                AccountingEntry.date <= end_date,
                AccountingEntry.is_reversed == False,
            )
        )
        d = sum((r[0] or 0) for r in debits.all())
        c = sum((r[0] or 0) for r in credits.all())
        balance = acc.current_balance
        account_data.append({
            "code": acc.code,
            "name": acc.name,
            "type": acc.account_type.value,
            "balance": balance,
            "debits": d,
            "credits": c,
        })

    assistant = AIAssistant()
    analysis = await assistant.analyze_financials(account_data, company.name)
    return analysis


@router.post("/detect-errors")
async def detect_accounting_errors(
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=400, detail="OpenAI API key not configured")

    entries = await db.execute(
        select(AccountingEntry).where(
            AccountingEntry.company_id == company.id,
            AccountingEntry.is_reversed == False,
        ).order_by(AccountingEntry.date.desc()).limit(100)
    )
    entries_data = []
    for entry in entries.scalars().all():
        details = await db.execute(
            select(AccountingEntryDetail).where(AccountingEntryDetail.entry_id == entry.id)
        )
        total_debit = sum(d.debit for d in details.scalars().all())
        details = await db.execute(
            select(AccountingEntryDetail).where(AccountingEntryDetail.entry_id == entry.id)
        )
        total_credit = sum(d.credit for d in details.scalars().all())
        entries_data.append({
            "entry_number": entry.entry_number,
            "date": str(entry.date),
            "description": entry.description,
            "total_debit": total_debit,
            "total_credit": total_credit,
            "is_balanced": abs(total_debit - total_credit) < 0.01,
        })

    assistant = AIAssistant()
    errors = await assistant.detect_errors(entries_data)
    return errors


@router.post("/predict-cash-flow")
async def predict_cash_flow(
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=400, detail="OpenAI API key not configured")

    cash_accounts = await db.execute(
        select(Account).where(
            Account.company_id == company.id,
            Account.code.like("11%"),
        )
    )
    cash_ids = [a.id for a in cash_accounts.scalars().all()]

    monthly_data = []
    for m in range(1, 13):
        end_date = date(2026, min(m, 12), 28)
        entries = await db.execute(
            select(AccountingEntryDetail, AccountingEntry).join(AccountingEntry).where(
                AccountingEntryDetail.account_id.in_(cash_ids),
                AccountingEntry.company_id == company.id,
                AccountingEntry.date <= end_date,
                AccountingEntry.is_reversed == False,
            )
        )
        inflow = sum(d.debit for d, e in entries.all())
        outflow = sum(d.credit for d, e in entries.all())
        monthly_data.append({"month": m, "inflow": inflow, "outflow": outflow})

    assistant = AIAssistant()
    prediction = await assistant.predict_cash_flow(monthly_data)
    return prediction


@router.post("/generate-report")
async def generate_ai_report(
    report_type: str,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=400, detail="OpenAI API key not configured")

    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company.id,
            Account.is_active == True,
        ).order_by(Account.code)
    )
    summary = {
        "total_assets": sum(a.current_balance for a in accounts.scalars().all() if a.account_type == AccountType.ACTIVO),
    }
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company.id,
            Account.is_active == True,
        ).order_by(Account.code)
    )
    accounts_list = accounts.scalars().all()
    summary["total_liabilities"] = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.PASIVO)
    summary["total_equity"] = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.PATRIMONIO)
    summary["total_income"] = sum(a.current_balance for a in accounts_list if a.account_type == AccountType.INGRESO)

    assistant = AIAssistant()
    report = await assistant.generate_report(report_type, summary)
    return report
