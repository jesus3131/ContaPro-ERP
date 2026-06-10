# Modelo: Facturación
# Propósito: Gestiona facturas de venta, notas crédito y notas débito con integración a la DIAN (facturación electrónica)
# Tablas principales: invoices, invoice_items, credit_notes, debit_notes
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    invoice_type = Column(String(20), nullable=False)
    invoice_number = Column(String(20), nullable=False, index=True)
    prefix = Column(String(5))
    resolution_number = Column(String(30))
    cufe = Column(String(100))
    dian_status = Column(String(20))
    dian_response = Column(JSON)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date)
    payment_method = Column(String(50))
    payment_form = Column(String(5))
    currency = Column(String(5), default="COP")
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    retention_amount = Column(Float, default=0.0)
    status = Column(String(20), default="Draft")
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    description = Column(String(500), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    tax_code = Column(String(10))
    tax_percentage = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)

    invoice = relationship("Invoice", back_populates="items")


class CreditNote(Base):
    __tablename__ = "credit_notes"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    note_number = Column(String(20), nullable=False)
    cude = Column(String(100))
    dian_status = Column(String(20))
    reason = Column(String(500), nullable=False)
    total = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DebitNote(Base):
    __tablename__ = "debit_notes"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    note_number = Column(String(20), nullable=False)
    cude = Column(String(100))
    dian_status = Column(String(20))
    reason = Column(String(500), nullable=False)
    total = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
