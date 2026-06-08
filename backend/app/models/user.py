from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    business_name = Column(String(255))
    nit = Column(String(20), unique=True, nullable=False, index=True)
    dv = Column(String(2))
    address = Column(String(255))
    city = Column(String(100))
    department = Column(String(100))
    phone = Column(String(50))
    email = Column(String(255))
    economic_activity = Column(String(255))
    regime_type = Column(String(50))
    resolution_number = Column(String(50))
    resolution_date = Column(Date)
    resolution_expiry = Column(Date)
    logo_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    users = relationship("UserCompany", back_populates="company")
    accounts = relationship("Account", back_populates="company")
    clients = relationship("Client", back_populates="company")
    suppliers = relationship("Supplier", back_populates="company")
    employees = relationship("Employee", back_populates="company")
    products = relationship("Product", back_populates="company")
    invoices = relationship("Invoice", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    professional_card = Column(String(50))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    companies = relationship("UserCompany", back_populates="user")


class UserCompany(Base):
    __tablename__ = "user_companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False, default="viewer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="companies")
    company = relationship("Company", back_populates="users")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer)
    old_values = Column(Text)
    new_values = Column(Text)
    ip_address = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
