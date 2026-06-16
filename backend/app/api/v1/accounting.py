from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_company, get_current_user, require_role
from app.db.database import get_db
from app.models.accounting import (Account, AccountingEntry,
                                   AccountingEntryDetail, AccountType)
from app.models.user import Company, User
from app.schemas.accounting import (AccountCreate, AccountingEntryCreate,
                                    AccountingEntryResponse, AccountResponse,
                                    FinancialStatementResponse,
                                    TrialBalanceResponse)
from app.services.puc_colombia import PUC_COLOMBIA

router = APIRouter()

_reader = require_role(["admin", "contador", "gerente", "viewer"])
_writer = require_role(["admin", "contador", "gerente"])


@router.get("/puc", response_model=list[AccountResponse])
async def get_puc(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=200, ge=1, le=1000),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Account).where(Account.company_id == company.id).order_by(Account.code).offset(skip).limit(limit)
    )
    return [AccountResponse.model_validate(a) for a in result.scalars().all()]


@router.post("/puc/seed")
async def seed_puc(
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(["admin"])),
):
    existing = await db.execute(
        select(Account).where(Account.company_id == company.id).limit(1)
    )
    if existing.scalars().first():
        return {"message": "PUC already seeded for this company"}

    accounts = []
    for acc in PUC_COLOMBIA:
        accounts.append(Account(
            company_id=company.id,
            code=acc["code"],
            name=acc["name"],
            account_type=acc["account_type"],
            nature=acc["nature"],
            account_class=acc["account_class"],
            level=acc["level"],
            parent_id=None,
            accepts_movements=acc.get("accepts_movements", False),
            third_party_required=acc.get("third_party_required", False),
        ))

    db.add_all(accounts)
    await db.commit()

    await _build_account_hierarchy(company.id, db)
    return {"message": f"PUC seeded with {len(accounts)} accounts"}


@router.post("/accounts", response_model=AccountResponse)
async def create_account(
    request: AccountCreate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    account = Account(company_id=company.id, **request.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return AccountResponse.model_validate(account)


@router.get("/accounts/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Account).where(Account.id == account_id, Account.company_id == company.id)
    )
    account = result.scalars().first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return AccountResponse.model_validate(account)


@router.post("/entries", response_model=AccountingEntryResponse)
async def create_entry(
    request: AccountingEntryCreate,
    company: Company = Depends(get_current_company),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    last_entry = await db.execute(
        select(func.max(AccountingEntry.entry_number)).where(
            AccountingEntry.company_id == company.id,
            AccountingEntry.entry_number.like(f"CP-{request.date.strftime('%Y%m')}-%"),
        )
    )
    last_num = last_entry.scalar()
    next_num = 1
    if last_num:
        try:
            parts = last_num.split("-")
            next_num = int(parts[-1]) + 1
        except (ValueError, IndexError):
            next_num = 1

    entry_number = f"CP-{request.date.strftime('%Y%m')}-{next_num:04d}"

    entry = AccountingEntry(
        company_id=company.id,
        entry_number=entry_number,
        entry_type=request.entry_type,
        date=request.date,
        description=request.description,
        third_party_id=request.third_party_id,
        document_type=request.document_type,
        document_number=request.document_number,
        created_by=user.id,
    )
    db.add(entry)
    await db.flush()

    for detail in request.details:
        entry_detail = AccountingEntryDetail(
            entry_id=entry.id,
            account_id=detail.account_id,
            nature=detail.nature,
            debit=detail.debit,
            credit=detail.credit,
            third_party_id=detail.third_party_id,
            description=detail.description,
        )
        db.add(entry_detail)

        account_result = await db.execute(
            select(Account).where(Account.id == detail.account_id, Account.company_id == company.id)
        )
        account = account_result.scalars().first()
        if account:
            if account.nature == "Deudora":
                account.current_balance += detail.debit - detail.credit
            else:
                account.current_balance += detail.credit - detail.debit

    await db.commit()
    await db.refresh(entry)
    return AccountingEntryResponse.model_validate(entry)


@router.get("/entries", response_model=list[AccountingEntryResponse])
async def list_entries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    entry_type: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    query = select(AccountingEntry).options(
        selectinload(AccountingEntry.details).selectinload(AccountingEntryDetail.account)
    ).where(AccountingEntry.company_id == company.id)
    if start_date:
        query = query.where(AccountingEntry.date >= start_date)
    if end_date:
        query = query.where(AccountingEntry.date <= end_date)
    if entry_type:
        query = query.where(AccountingEntry.entry_type == entry_type)

    query = query.order_by(AccountingEntry.date.desc(), AccountingEntry.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [AccountingEntryResponse.model_validate(e) for e in result.scalars().all()]


async def _get_account_balance_totals(
    company_id: int,
    account_ids: list[int],
    db: AsyncSession,
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict[int, tuple[float, float]]:
    query = select(
        AccountingEntryDetail.account_id,
        func.coalesce(func.sum(AccountingEntryDetail.debit), 0),
        func.coalesce(func.sum(AccountingEntryDetail.credit), 0),
    ).join(AccountingEntry).where(
        AccountingEntryDetail.account_id.in_(account_ids),
        AccountingEntry.company_id == company_id,
        AccountingEntry.is_reversed == False,
    )
    if start_date and end_date:
        query = query.where(AccountingEntry.date.between(start_date, end_date))
    elif end_date:
        query = query.where(AccountingEntry.date <= end_date)
    elif start_date:
        query = query.where(AccountingEntry.date >= start_date)
    query = query.group_by(AccountingEntryDetail.account_id)
    rows = await db.execute(query)
    return {r[0]: (float(r[1]), float(r[2])) for r in rows.all()}


@router.get("/trial-balance", response_model=list[TrialBalanceResponse])
async def trial_balance(
    end_date: date,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company.id,
            Account.is_active == True,
        ).order_by(Account.code)
    )
    accounts_list = accounts.scalars().all()
    balance_totals = await _get_account_balance_totals(company.id, [a.id for a in accounts_list], db, end_date=end_date)

    result = []
    for account in accounts_list:
        debits, credits = balance_totals.get(account.id, (0.0, 0.0))
        current_balance = (
            account.opening_balance + debits - credits
            if account.account_type in [AccountType.ACTIVO, AccountType.GASTO, AccountType.COSTO]
            else account.opening_balance + credits - debits
        )

        if account.accepts_movements or abs(current_balance) > 0.01:
            result.append(TrialBalanceResponse(
                account_code=account.code,
                account_name=account.name,
                previous_balance=account.opening_balance,
                debits=debits,
                credits=credits,
                current_balance=current_balance,
            ))

    return result


@router.get("/balance-sheet", response_model=list[FinancialStatementResponse])
async def balance_sheet(
    end_date: date,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await _get_financial_statement(company.id, end_date, db)
    return [r for r in result if r.balance != 0]


@router.get("/income-statement", response_model=list[FinancialStatementResponse])
async def income_statement(
    start_date: date,
    end_date: date,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    income_types = [AccountType.INGRESO, AccountType.GASTO, AccountType.COSTO]
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company.id,
            Account.account_type.in_(income_types),
            Account.is_active == True,
        ).order_by(Account.code)
    )
    accounts_list = accounts.scalars().all()
    balance_totals = await _get_account_balance_totals(
        company.id,
        [a.id for a in accounts_list],
        db,
        start_date=start_date,
        end_date=end_date,
    )

    result = []
    for account in accounts_list:
        debits, credits = balance_totals.get(account.id, (0.0, 0.0))
        balance = credits - debits if account.account_type == AccountType.INGRESO else debits - credits

        if abs(balance) > 0.01:
            result.append(FinancialStatementResponse(
                account_code=account.code,
                account_name=account.name,
                balance=balance,
            ))

    return result


async def _get_financial_statement(company_id: int, end_date: date, db: AsyncSession):
    real_types = [AccountType.ACTIVO, AccountType.PASIVO, AccountType.PATRIMONIO]
    accounts = await db.execute(
        select(Account).where(
            Account.company_id == company_id,
            Account.account_type.in_(real_types),
            Account.is_active == True,
        ).order_by(Account.code)
    )
    accounts_list = accounts.scalars().all()
    balance_totals = await _get_account_balance_totals(company_id, [a.id for a in accounts_list], db, end_date=end_date)

    result = []
    for account in accounts_list:
        debits, credits = balance_totals.get(account.id, (0.0, 0.0))
        balance = account.opening_balance + debits - credits if account.account_type == AccountType.ACTIVO else account.opening_balance + credits - debits

        result.append(FinancialStatementResponse(
            account_code=account.code,
            account_name=account.name,
            balance=balance,
        ))

    return result


async def _build_account_hierarchy(company_id: int, db: AsyncSession):
    accounts = await db.execute(
        select(Account).where(Account.company_id == company_id).order_by(Account.code)
    )
    accounts_dict = {a.code: a for a in accounts.scalars().all()}

    for account in accounts_dict.values():
        if len(account.code) > 1:
            parent_code = account.code[:-2]
            while parent_code and parent_code not in accounts_dict:
                parent_code = parent_code[:-2]
            if parent_code and parent_code in accounts_dict:
                account.parent_id = accounts_dict[parent_code].id
                account.level = accounts_dict[parent_code].level + 1

    await db.commit()
