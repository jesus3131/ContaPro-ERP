from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProductCreate(BaseModel):
    code: str
    barcode: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    unit_type: Optional[str] = None
    cost_price: float = 0.0
    sale_price: float = 0.0
    tax_rate: float = 0.0
    tax_code: Optional[str] = None
    min_stock: float = 0.0
    costing_method: str = "Promedio"
    location: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    code: str
    name: str
    category: Optional[str]
    cost_price: float
    sale_price: float
    current_stock: float
    min_stock: float
    is_active: bool

    class Config:
        from_attributes = True


class InventoryMovementCreate(BaseModel):
    product_id: int
    movement_type: str
    quantity: float
    unit_cost: float
    description: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None


class KardexResponse(BaseModel):
    date: datetime
    concept: str
    entry_quantity: float
    entry_unit_cost: float
    output_quantity: float
    output_unit_cost: float
    balance_quantity: float
    balance_unit_cost: float
    balance_total_cost: float
