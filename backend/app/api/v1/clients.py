from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.db.database import get_db
from app.core.deps import get_current_company, require_role
from app.models.user import Company
from app.models.clients import Client, Supplier, Employee
from app.schemas.clients import ClientCreate, ClientUpdate, ClientResponse, SupplierCreate, SupplierUpdate, SupplierResponse, EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter()

_reader = require_role(["admin", "contador", "vendedor", "gerente", "viewer"])
_writer = require_role(["admin", "contador", "vendedor", "gerente"])
_editor = require_role(["admin", "contador", "gerente"])


@router.post("/", response_model=ClientResponse)
@router.post("", response_model=ClientResponse)
async def create_client(
    request: ClientCreate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    client = Client(company_id=company.id, **request.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return ClientResponse.model_validate(client)


@router.get("/", response_model=list[ClientResponse])
@router.get("", response_model=list[ClientResponse])
async def list_clients(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Client).where(Client.company_id == company.id).order_by(Client.business_name).offset(skip).limit(limit)
    )
    return [ClientResponse.model_validate(c) for c in result.scalars().all()]


@router.get("/suppliers", response_model=list[SupplierResponse])
async def list_suppliers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Supplier).where(Supplier.company_id == company.id).order_by(Supplier.business_name).offset(skip).limit(limit)
    )
    return [SupplierResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/suppliers", response_model=SupplierResponse)
async def create_supplier(
    request: SupplierCreate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    supplier = Supplier(company_id=company.id, **request.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return SupplierResponse.model_validate(supplier)


@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id, Supplier.company_id == company.id)
    )
    supplier = result.scalars().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierResponse.model_validate(supplier)


@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: int,
    request: SupplierUpdate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_editor),
):
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id, Supplier.company_id == company.id)
    )
    supplier = result.scalars().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(supplier, key, value)
    await db.commit()
    await db.refresh(supplier)
    return SupplierResponse.model_validate(supplier)


@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(
    supplier_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(["admin"])),
):
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id, Supplier.company_id == company.id)
    )
    supplier = result.scalars().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    await db.delete(supplier)
    await db.commit()
    return {"message": "Supplier deleted"}


@router.get("/employees", response_model=list[EmployeeResponse])
async def list_employees(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Employee).where(Employee.company_id == company.id).order_by(Employee.first_name).offset(skip).limit(limit)
    )
    return [EmployeeResponse.model_validate(e) for e in result.scalars().all()]


@router.post("/employees", response_model=EmployeeResponse)
async def create_employee(
    request: EmployeeCreate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_writer),
):
    employee = Employee(company_id=company.id, **request.model_dump())
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return EmployeeResponse.model_validate(employee)


@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id, Employee.company_id == company.id)
    )
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeResponse.model_validate(employee)


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    request: EmployeeUpdate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_editor),
):
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id, Employee.company_id == company.id)
    )
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(employee, key, value)
    await db.commit()
    await db.refresh(employee)
    return EmployeeResponse.model_validate(employee)


@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(["admin"])),
):
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id, Employee.company_id == company.id)
    )
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    await db.delete(employee)
    await db.commit()
    return {"message": "Employee deleted"}


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_reader),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.company_id == company.id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return ClientResponse.model_validate(client)


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    request: ClientUpdate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(_editor),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.company_id == company.id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(client, key, value)
    await db.commit()
    await db.refresh(client)
    return ClientResponse.model_validate(client)


@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role(["admin"])),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.company_id == company.id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    await db.delete(client)
    await db.commit()
    return {"message": "Client deleted"}
