# Módulo: inventory.py
# Propósito: Esquemas Pydantic para inventario: productos, movimientos, kardex
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
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    code: Optional[str] = None
    barcode: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit_type: Optional[str] = None
    cost_price: Optional[float] = None
    sale_price: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_code: Optional[str] = None
    min_stock: Optional[float] = None
    costing_method: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
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
    current_stock: float = 0.0
    costing_method: str = "Promedio"
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True

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
