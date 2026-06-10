# Módulo: clients.py
# Propósito: Esquemas Pydantic para clientes, proveedores, empleados
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class ClientCreate(BaseModel):
    document_type: str
    document_number: str
    dv: Optional[str] = None
    business_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    tax_regime: Optional[str] = None
    credit_limit: float = 0.0
    payment_term_days: int = 30


class ClientUpdate(BaseModel):
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    dv: Optional[str] = None
    business_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    tax_regime: Optional[str] = None
    credit_limit: Optional[float] = None
    payment_term_days: Optional[int] = None
    is_active: Optional[bool] = None


class ClientResponse(BaseModel):
    id: int
    document_type: str
    document_number: str
    business_name: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    tax_regime: Optional[str]
    credit_limit: float
    is_active: bool

    class Config:
        from_attributes = True


class SupplierUpdate(BaseModel):
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    dv: Optional[str] = None
    business_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    tax_regime: Optional[str] = None
    payment_term_days: Optional[int] = None
    is_active: Optional[bool] = None


class SupplierCreate(BaseModel):
    document_type: str
    document_number: str
    dv: Optional[str] = None
    business_name: str
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    tax_regime: Optional[str] = None
    payment_term_days: int = 30


class SupplierResponse(BaseModel):
    id: int
    document_type: str
    document_number: str
    business_name: str
    email: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class EmployeeUpdate(BaseModel):
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    department_name: Optional[str] = None
    salary: Optional[float] = None
    salary_type: Optional[str] = None
    contract_type: Optional[str] = None
    eps: Optional[str] = None
    afp: Optional[str] = None
    ccf: Optional[str] = None
    risk_class: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeCreate(BaseModel):
    document_type: str
    document_number: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    department_name: Optional[str] = None
    salary: float = 0.0
    salary_type: Optional[str] = None
    contract_type: Optional[str] = None
    eps: Optional[str] = None
    afp: Optional[str] = None
    ccf: Optional[str] = None
    risk_class: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: int
    document_type: str
    document_number: str
    first_name: str
    last_name: str
    email: Optional[str]
    position: Optional[str]
    department_name: Optional[str]
    salary: float
    contract_type: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True
