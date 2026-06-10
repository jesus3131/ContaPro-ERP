# Modelo: Banca
# Propósito: Gestiona cuentas bancarias, transacciones y conciliaciones bancarias de la empresa
# Tablas principales: bank_accounts, bank_transactions
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    bank_name = Column(String(255), nullable=False)
    account_type = Column(String(20), nullable=False)
    account_number = Column(String(30), nullable=False)
    account_name = Column(String(255))
    opening_balance = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=False)
    transaction_date = Column(Date, nullable=False)
    description = Column(String(500))
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)
    reference = Column(String(100))
    is_reconciled = Column(Boolean, default=False)
    reconciliation_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
