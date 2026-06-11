# Módulo: auth.py
# Propósito: Esquemas Pydantic para autenticación: login, registro, tokens, empresas
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"
    company_id: Optional[int] = None


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RegisterWithCompanyRequest(UserCreate):
    company_name: str = Field(..., min_length=2, max_length=255)
    company_nit: str = Field(..., min_length=5, max_length=20)
    company_business_name: Optional[str] = None
    company_address: Optional[str] = None
    company_city: Optional[str] = None
    company_phone: Optional[str] = None


class CompanyCreate(BaseModel):
    name: str
    business_name: Optional[str] = None
    nit: str
    dv: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    economic_activity: Optional[str] = None
    regime_type: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    nit: str
    business_name: Optional[str]
    address: Optional[str]
    city: Optional[str]
    department: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True
