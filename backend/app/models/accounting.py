# Modelo: Contabilidad
# Propósito: Define las estructuras contables del sistema, incluyendo catálogo de cuentas, asientos contables y cierres periódicos
# Tablas principales: accounts, accounting_entries, accounting_entry_details, closings
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Date, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class AccountType(str, enum.Enum):
    ACTIVO = "ACTIVO"
    PASIVO = "PASIVO"
    PATRIMONIO = "PATRIMONIO"
    INGRESO = "INGRESO"
    GASTO = "GASTO"
    COSTO = "COSTO"
    CUENTA_ORDEN = "CUENTA_ORDEN"


class AccountNature(str, enum.Enum):
    DEUDORA = "DEUDORA"
    ACREEDORA = "ACREEDORA"


class AccountClass(str, enum.Enum):
    REAL = "REAL"
    NOMINAL = "NOMINAL"
    ORDEN = "ORDEN"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    code = Column(String(15), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    account_type = Column(SAEnum(AccountType), nullable=False)
    nature = Column(SAEnum(AccountNature), nullable=False)
    account_class = Column(SAEnum(AccountClass), nullable=False)
    level = Column(Integer, nullable=False, default=1)
    parent_id = Column(Integer, ForeignKey("accounts.id"))
    accepts_movements = Column(Boolean, default=False)
    third_party_required = Column(Boolean, default=False)
    center_cost_required = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    opening_balance = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="accounts")
    parent = relationship("Account", remote_side="Account.id", backref="children")
    journal_entries = relationship("AccountingEntryDetail", back_populates="account")


class AccountingEntry(Base):
    __tablename__ = "accounting_entries"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    entry_number = Column(String(20), nullable=False)
    entry_type = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(Text)
    third_party_id = Column(Integer, ForeignKey("clients.id"))
    cost_center_id = Column(Integer)
    document_type = Column(String(50))
    document_number = Column(String(50))
    is_reversed = Column(Boolean, default=False)
    reversed_entry_id = Column(Integer, ForeignKey("accounting_entries.id"))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    details = relationship("AccountingEntryDetail", back_populates="entry")
    reversed_entry = relationship("AccountingEntry", remote_side="AccountingEntry.id", backref="reversal_of")


class AccountingEntryDetail(Base):
    __tablename__ = "accounting_entry_details"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("accounting_entries.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    nature = Column(String(10), nullable=False)
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)
    third_party_id = Column(Integer, ForeignKey("clients.id"))
    cost_center_id = Column(Integer)
    description = Column(Text)

    entry = relationship("AccountingEntry", back_populates="details")
    account = relationship("Account", back_populates="journal_entries")


class Closing(Base):
    __tablename__ = "closings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    period_year = Column(Integer, nullable=False)
    period_month = Column(Integer)
    closing_type = Column(String(20), nullable=False)
    closed_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_reversed = Column(Boolean, default=False)
    notes = Column(Text)
