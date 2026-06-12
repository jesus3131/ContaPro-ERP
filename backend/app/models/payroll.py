# Modelo: Nómina
# Propósito: Administra periodos de nómina y liquidaciones salariales con prestaciones sociales, deducciones y aportes parafiscales
# Tablas principales: payroll_periods, payroll_settlements
from sqlalchemy import (JSON, Boolean, Column, Date, DateTime, Float,
                        ForeignKey, Integer, String, Text)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class PayrollPeriod(Base):
    __tablename__ = "payroll_periods"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    period_type = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    payment_date = Column(Date)
    is_closed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PayrollSettlement(Base):
    __tablename__ = "payroll_settlements"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    period_id = Column(Integer, ForeignKey("payroll_periods.id"), nullable=False)
    base_salary = Column(Float, nullable=False)
    worked_days = Column(Integer, nullable=False)
    overtime_hours = Column(Float, default=0.0)
    overtime_amount = Column(Float, default=0.0)
    bonuses = Column(Float, default=0.0)
    commissions = Column(Float, default=0.0)
    transport_allowance = Column(Float, default=0.0)
    gross_salary = Column(Float, nullable=False)

    health_percentage = Column(Float, default=4.0)
    health_deduction = Column(Float, default=0.0)
    pension_percentage = Column(Float, default=4.0)
    pension_deduction = Column(Float, default=0.0)
    solidarity_fund = Column(Float, default=0.0)
    withholding_tax = Column(Float, default=0.0)
    other_deductions = Column(Float, default=0.0)
    total_deductions = Column(Float, default=0.0)

    net_payment = Column(Float, nullable=False)

    severance = Column(Float, default=0.0)
    severance_interest = Column(Float, default=0.0)
    prima = Column(Float, default=0.0)
    vacation = Column(Float, default=0.0)

    employer_health = Column(Float, default=0.0)
    employer_pension = Column(Float, default=0.0)
    arl = Column(Float, default=0.0)
    ccf = Column(Float, default=0.0)
    sena = Column(Float, default=0.0)
    icbf = Column(Float, default=0.0)
    total_parafiscal = Column(Float, default=0.0)

    status = Column(String(20), default="Draft")
    dian_status = Column(String(20))
    settlement_json = Column(JSON)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    employee = relationship("Employee")
    period = relationship("PayrollPeriod")
