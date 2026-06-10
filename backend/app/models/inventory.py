from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Date, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class CostingMethod(str, enum.Enum):
    PROMEDIO = "Promedio"
    PEPS = "PEPS"
    UEPS = "UEPS"


class MovementType(str, enum.Enum):
    ENTRADA = "Entrada"
    SALIDA = "Salida"
    AJUSTE = "Ajuste"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    code = Column(String(50), nullable=False, index=True)
    barcode = Column(String(100))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    unit_type = Column(String(20))
    cost_price = Column(Float, default=0.0)
    sale_price = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_code = Column(String(10))
    min_stock = Column(Float, default=0.0)
    current_stock = Column(Float, default=0.0)
    costing_method = Column(SAEnum(CostingMethod), default=CostingMethod.PROMEDIO)
    location = Column(String(100))
    image_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="products")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    movement_type = Column(SAEnum(MovementType), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    reference_type = Column(String(50))
    reference_id = Column(Integer)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")


class Kardex(Base):
    __tablename__ = "kardex"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    movement_id = Column(Integer, ForeignKey("inventory_movements.id"))
    date = Column(Date, nullable=False)
    concept = Column(String(255))
    entry_quantity = Column(Float, default=0.0)
    entry_unit_cost = Column(Float, default=0.0)
    entry_total_cost = Column(Float, default=0.0)
    output_quantity = Column(Float, default=0.0)
    output_unit_cost = Column(Float, default=0.0)
    output_total_cost = Column(Float, default=0.0)
    balance_quantity = Column(Float, default=0.0)
    balance_unit_cost = Column(Float, default=0.0)
    balance_total_cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
