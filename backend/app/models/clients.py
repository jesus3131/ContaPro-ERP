# Modelo: Clientes, Proveedores y Empleados
# Propósito: Almacena la información de terceros (clientes, proveedores y empleados) relacionados con la empresa
# Tablas principales: clients, suppliers, employees
from sqlalchemy import (Boolean, Column, Date, DateTime, Float, ForeignKey,
                        Integer, String, Text)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    document_type = Column(String(5), nullable=False)
    document_number = Column(String(20), nullable=False, index=True)
    dv = Column(String(2))
    business_name = Column(String(255))
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(String(255))
    city = Column(String(100))
    department = Column(String(100))
    country = Column(String(50), default="Colombia")
    tax_regime = Column(String(50))
    credit_limit = Column(Float, default=0.0)
    payment_term_days = Column(Integer, default=30)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    document_type = Column(String(5), nullable=False)
    document_number = Column(String(20), nullable=False, index=True)
    dv = Column(String(2))
    business_name = Column(String(255), nullable=False)
    contact_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(String(255))
    city = Column(String(100))
    department = Column(String(100))
    tax_regime = Column(String(50))
    payment_term_days = Column(Integer, default=30)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="suppliers")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    document_type = Column(String(5), nullable=False)
    document_number = Column(String(20), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(String(255))
    city = Column(String(100))
    department = Column(String(100))
    position = Column(String(100))
    department_name = Column(String(100))
    salary = Column(Float, default=0.0)
    salary_type = Column(String(20))
    contract_type = Column(String(50))
    start_date = Column(Date)
    end_date = Column(Date)
    eps = Column(String(100))
    afp = Column(String(100))
    ccf = Column(String(100))
    risk_class = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="employees")
