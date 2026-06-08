from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.core.deps import get_current_company
from app.models.user import Company
from app.models.clients import Client, Supplier, Employee
from app.schemas.clients import ClientCreate, ClientResponse, SupplierCreate, SupplierResponse, EmployeeCreate, EmployeeResponse

router = APIRouter()


@router.post("/", response_model=ClientResponse)
async def create_client(
    request: ClientCreate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    client = Client(company_id=company.id, **request.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return ClientResponse.model_validate(client)


@router.get("/", response_model=list[ClientResponse])
async def list_clients(company: Company = Depends(get_current_company), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Client).where(Client.company_id == company.id).order_by(Client.business_name)
    )
    return [ClientResponse.model_validate(c) for c in result.scalars().all()]


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, company: Company = Depends(get_current_company), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.company_id == company.id)
    )
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return ClientResponse.model_validate(client)
