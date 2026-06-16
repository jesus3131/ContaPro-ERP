
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_company, get_current_user, require_role
from app.db.database import get_db
from app.models.inventory import (CostingMethod, InventoryMovement, Kardex,
                                  MovementType, Product)
from app.models.user import Company, User
from app.schemas.inventory import (InventoryMovementCreate, KardexResponse,
                                   ProductCreate, ProductResponse,
                                   ProductUpdate)

router = APIRouter()

_reader = require_role(["admin", "contador", "inventario", "gerente", "viewer"])
_writer = require_role(["admin", "inventario", "gerente"])
_editor = require_role(["admin", "inventario", "gerente"])


@router.post("/products", response_model=ProductResponse)
async def create_product(
    request: ProductCreate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    product = Product(company_id=company.id, **request.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.get("/products", response_model=list[ProductResponse])
async def list_products(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Product).where(Product.company_id == company.id).order_by(Product.name).offset(skip).limit(limit)
    )
    return [ProductResponse.model_validate(p) for p in result.scalars().all()]


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.company_id == company.id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    request: ProductUpdate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_editor),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.company_id == company.id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(["admin"])),
):
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.company_id == company.id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted"}


@router.post("/movements")
async def create_movement(
    request: InventoryMovementCreate,
    company: Company = Depends(get_current_company),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    product_result = await db.execute(
        select(Product).where(Product.id == request.product_id, Product.company_id == company.id)
    )
    product = product_result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    total_cost = request.quantity * request.unit_cost

    movement = InventoryMovement(
        company_id=company.id,
        product_id=request.product_id,
        movement_type=request.movement_type,
        quantity=request.quantity,
        unit_cost=request.unit_cost,
        total_cost=total_cost,
        reference_type=request.reference_type,
        reference_id=request.reference_id,
        description=request.description,
        created_by=user.id,
    )
    db.add(movement)
    await db.flush()

    if request.movement_type == MovementType.ENTRADA:
        if product.costing_method == CostingMethod.PROMEDIO:
            new_total = (product.current_stock * product.cost_price) + total_cost
            new_qty = product.current_stock + request.quantity
            product.cost_price = new_total / new_qty if new_qty else 0
        product.current_stock += request.quantity
        entry_qty, entry_cost = request.quantity, request.unit_cost
        output_qty, output_cost = 0, 0
    elif request.movement_type == MovementType.SALIDA:
        product.current_stock -= request.quantity
        entry_qty, entry_cost = 0, 0
        output_qty, output_cost = request.quantity, product.cost_price
    else:
        product.current_stock = request.quantity
        entry_qty, entry_cost = 0, 0
        output_qty, output_cost = 0, 0

    kardex = Kardex(
        company_id=company.id,
        product_id=request.product_id,
        movement_id=movement.id,
        date=movement.created_at,
        concept=request.description or f"{request.movement_type} de inventario",
        entry_quantity=entry_qty,
        entry_unit_cost=entry_cost,
        entry_total_cost=entry_qty * entry_cost,
        output_quantity=output_qty,
        output_unit_cost=output_cost,
        output_total_cost=output_qty * output_cost,
        balance_quantity=product.current_stock,
        balance_unit_cost=product.cost_price,
        balance_total_cost=product.current_stock * product.cost_price,
    )
    db.add(kardex)
    await db.commit()

    return {"message": "Movement registered", "new_stock": product.current_stock}


@router.get("/kardex/{product_id}", response_model=list[KardexResponse])
async def get_kardex(
    product_id: int,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=200, ge=1, le=1000),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Kardex).where(
            Kardex.product_id == product_id,
            Kardex.company_id == company.id,
        ).order_by(Kardex.date).offset(skip).limit(limit)
    )
    return [KardexResponse.model_validate(k) for k in result.scalars().all()]


@router.get("/stock-alerts")
async def get_stock_alerts(
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Product).where(
            Product.company_id == company.id,
            Product.is_active == True,
            Product.current_stock <= Product.min_stock,
        )
    )
    products = result.scalars().all()
    return [{"id": p.id, "code": p.code, "name": p.name, "current_stock": p.current_stock, "min_stock": p.min_stock}
            for p in products]
