# Módulo: invoicing
# Propósito: Facturación electrónica — creación de facturas, validación DIAN, envío y anulación.
# Funcionalidades principales: Creación de facturas con cálculo de impuestos, validación contra la DIAN, envío electrónico con CUFE y anulación de facturas.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from app.db.database import get_db
from app.core.deps import get_current_user, get_current_company
from app.models.user import User, Company
from app.models.invoicing import Invoice, InvoiceItem, CreditNote, DebitNote
from app.models.clients import Client
from app.schemas.invoicing import InvoiceCreate, InvoiceResponse, DianValidationResponse
from datetime import date
from app.services.dian import DianService

router = APIRouter()


@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    request: InvoiceCreate,
    company: Company = Depends(get_current_company),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    client_result = await db.execute(
        select(Client).where(Client.id == request.client_id, Client.company_id == company.id)
    )
    client = client_result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    last_invoice = await db.execute(
        select(func.max(Invoice.invoice_number)).where(
            Invoice.company_id == company.id,
            Invoice.invoice_type == request.invoice_type,
        )
    )
    last_num = int(last_invoice.scalar() or 0)
    invoice_number = f"{last_num + 1:010d}"

    subtotal = sum(item.quantity * item.unit_price - item.discount for item in request.items)
    tax_amount = sum((item.quantity * item.unit_price - item.discount) * item.tax_percentage / 100 for item in request.items)
    total = subtotal + tax_amount

    invoice = Invoice(
        company_id=company.id,
        client_id=request.client_id,
        invoice_type=request.invoice_type,
        invoice_number=invoice_number,
        prefix=request.prefix or "FVE",
        resolution_number=company.resolution_number,
        issue_date=request.issue_date,
        due_date=request.due_date,
        payment_method=request.payment_method,
        payment_form=request.payment_form,
        subtotal=subtotal,
        discount=sum(item.discount for item in request.items),
        tax_amount=tax_amount,
        total=total,
        status="Draft",
        created_by=user.id,
    )
    db.add(invoice)
    await db.flush()

    for item in request.items:
        item_total = item.quantity * item.unit_price - item.discount
        item_tax = item_total * item.tax_percentage / 100
        db.add(InvoiceItem(
            invoice_id=invoice.id,
            product_id=item.product_id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            tax_code=item.tax_code,
            tax_percentage=item.tax_percentage,
            tax_amount=item_tax,
            total=item_total + item_tax,
        ))

    await db.commit()
    await db.refresh(invoice)

    return InvoiceResponse(
        id=invoice.id,
        invoice_number=invoice.invoice_number,
        prefix=invoice.prefix,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date,
        client_name=client.business_name or f"{client.first_name} {client.last_name}",
        subtotal=invoice.subtotal,
        tax_amount=invoice.tax_amount,
        total=invoice.total,
        status=invoice.status,
        dian_status=invoice.dian_status,
        cufe=invoice.cufe,
    )


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices(company: Company = Depends(get_current_company), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Invoice).options(selectinload(Invoice.client)).where(Invoice.company_id == company.id).order_by(Invoice.created_at.desc()).limit(100)
    )
    invoices = result.scalars().all()
    response = []
    for inv in invoices:
        client = inv.client
        response.append(InvoiceResponse(
            id=inv.id,
            invoice_number=inv.invoice_number,
            prefix=inv.prefix,
            issue_date=inv.issue_date,
            due_date=inv.due_date,
            client_id=inv.client_id,
            client_name=f"{client.business_name or f'{client.first_name} {client.last_name}'}" if client else "N/A",
            invoice_type=inv.invoice_type,
            payment_method=inv.payment_method,
            payment_form=inv.payment_form,
            currency=inv.currency or "COP",
            subtotal=inv.subtotal,
            discount=inv.discount,
            tax_amount=inv.tax_amount,
            total=inv.total,
            retention_amount=inv.retention_amount,
            status=inv.status,
            dian_status=inv.dian_status,
            cufe=inv.cufe,
            notes=inv.notes,
            created_by=inv.created_by,
        ))
    return response


@router.post("/invoices/{invoice_id}/validate-dian")
async def validate_with_dian(
    invoice_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.company_id == company.id)
    )
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    dian = DianService()
    validation = await dian.validate_invoice(invoice)

    if validation["is_valid"]:
        invoice.dian_status = "Validated"
        invoice.status = "Sent"
    else:
        invoice.dian_status = "Rejected"

    await db.commit()
    return validation


@router.post("/invoices/{invoice_id}/send-dian")
async def send_to_dian(
    invoice_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.company_id == company.id)
    )
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    dian = DianService()
    response = await dian.send_invoice(invoice)

    invoice.dian_status = response.get("status", "Sent")
    invoice.cufe = response.get("cufe")
    invoice.dian_response = response

    await db.commit()
    return response


@router.put("/invoices/{invoice_id}/cancel")
async def cancel_invoice(
    invoice_id: int,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.company_id == company.id)
    )
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = "Cancelled"
    await db.commit()
    return {"message": "Invoice cancelled"}
