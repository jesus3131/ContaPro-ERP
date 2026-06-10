# Módulo: invoicing.py
# Propósito: Esquemas Pydantic para facturación: facturas, items, DIAN
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class InvoiceItemCreate(BaseModel):
    product_id: Optional[int] = None
    description: str
    quantity: float
    unit_price: float
    discount: float = 0.0
    tax_code: Optional[str] = None
    tax_percentage: float = 0.0


class InvoiceCreate(BaseModel):
    client_id: int
    invoice_type: str = "FVE"
    prefix: Optional[str] = None
    issue_date: date
    due_date: Optional[date] = None
    payment_method: Optional[str] = None
    payment_form: Optional[str] = None
    notes: Optional[str] = None
    items: List[InvoiceItemCreate]


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    prefix: Optional[str]
    issue_date: date
    due_date: Optional[date]
    client_name: Optional[str]
    subtotal: float
    tax_amount: float
    total: float
    status: str
    dian_status: Optional[str]
    cufe: Optional[str]

    class Config:
        from_attributes = True


class DianValidationResponse(BaseModel):
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
