# Módulo: accounting.py
# Propósito: Esquemas Pydantic para contabilidad: cuentas, asientos, balances
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    code: str = Field(..., max_length=15)
    name: str = Field(..., max_length=255)
    account_type: str
    nature: str
    account_class: str
    parent_id: Optional[int] = None
    accepts_movements: bool = False
    third_party_required: bool = False
    center_cost_required: bool = False
    opening_balance: float = 0.0


class AccountResponse(BaseModel):
    id: int
    code: str
    name: str
    account_type: str
    nature: str
    account_class: str
    level: int
    parent_id: Optional[int]
    accepts_movements: bool
    current_balance: float
    is_active: bool

    class Config:
        from_attributes = True


class AccountingEntryCreate(BaseModel):
    entry_type: str
    date: date
    description: Optional[str] = None
    third_party_id: Optional[int] = None
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    details: List["EntryDetailCreate"]


class EntryDetailCreate(BaseModel):
    account_id: int
    nature: str
    debit: float = 0.0
    credit: float = 0.0
    third_party_id: Optional[int] = None
    description: Optional[str] = None


class AccountingEntryResponse(BaseModel):
    id: int
    entry_number: str
    entry_type: str
    date: date
    description: Optional[str]
    is_reversed: bool
    created_at: datetime
    details: List["EntryDetailResponse"]

    class Config:
        from_attributes = True


class EntryDetailResponse(BaseModel):
    id: int
    account_id: int
    nature: str
    debit: float
    credit: float
    description: Optional[str]
    account: Optional[AccountResponse]

    class Config:
        from_attributes = True


class TrialBalanceResponse(BaseModel):
    account_code: str
    account_name: str
    previous_balance: float
    debits: float
    credits: float
    current_balance: float


class FinancialStatementResponse(BaseModel):
    account_code: str
    account_name: str
    balance: float
