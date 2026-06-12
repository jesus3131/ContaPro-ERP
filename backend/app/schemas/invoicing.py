# Módulo: invoicing.py
# Propósito: Esquemas Pydantic para facturación: facturas, items, DIAN
from datetime import date
from typing import List, Optional

from pydantic import BaseModel


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
    prefix: Optional[str] = None
    issue_date: date
    due_date: Optional[date] = None
    client_id: int
    client_name: Optional[str] = None
    invoice_type: str = "FVE"
    payment_method: Optional[str] = None
    payment_form: Optional[str] = None
    currency: str = "COP"
    subtotal: float = 0.0
    discount: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    retention_amount: float = 0.0
    status: str = "Draft"
    dian_status: Optional[str] = None
    cufe: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


class DianValidationResponse(BaseModel):
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
