# Modelo: Financiero
# Propósito: Administra presupuestos, proyecciones de flujo de caja e indicadores financieros para el análisis económico
# Tablas principales: budgets, cash_flow_projections, financial_indicators
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer)
    budgeted_amount = Column(Float, default=0.0)
    actual_amount = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CashFlowProjection(Base):
    __tablename__ = "cash_flow_projections"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    projection_date = Column(Date, nullable=False)
    projected_income = Column(Float, default=0.0)
    projected_expenses = Column(Float, default=0.0)
    projected_balance = Column(Float, default=0.0)
    actual_income = Column(Float, default=0.0)
    actual_expenses = Column(Float, default=0.0)
    actual_balance = Column(Float, default=0.0)
    confidence_level = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FinancialIndicator(Base):
    __tablename__ = "financial_indicators"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    period_year = Column(Integer, nullable=False)
    period_month = Column(Integer)
    indicator_type = Column(String(50), nullable=False)
    indicator_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    previous_value = Column(Float)
    variation = Column(Float)
    interpretation = Column(Text)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
