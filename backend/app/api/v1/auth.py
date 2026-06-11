# Módulo: auth
# Propósito: Gestión de autenticación y registro — login, registro de usuarios y administración de empresas.
# Funcionalidades principales: Inicio de sesión con JWT, registro de nuevos usuarios, creación y listado de empresas asociadas al usuario.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.deps import get_current_user
from app.models.user import User, Company, UserCompany
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse, CompanyCreate, CompanyResponse, RegisterWithCompanyRequest

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == request.username))
    user = result.scalars().first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    companies_result = await db.execute(
        select(Company).join(UserCompany).where(
            UserCompany.user_id == user.id, UserCompany.is_active == True
        )
    )
    companies = companies_result.scalars().all()
    company_id = companies[0].id if len(companies) == 1 else None

    access_token = create_access_token(user.id)
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
        company_id=company_id,
    )


@router.post("/register", response_model=TokenResponse)
async def register(request: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(
        (User.username == request.username) | (User.email == request.email)
    ))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already exists")

    user = User(
        username=request.username,
        email=request.email,
        full_name=request.full_name,
        password_hash=get_password_hash(request.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id)
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/register-with-company", response_model=TokenResponse)
async def register_with_company(request: RegisterWithCompanyRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(
        (User.username == request.username) | (User.email == request.email)
    ))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario o email ya existe")

    existing_nit = await db.execute(select(Company).where(Company.nit == request.company_nit))
    if existing_nit.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="NIT ya registrado")

    user = User(
        username=request.username,
        email=request.email,
        full_name=request.full_name,
        password_hash=get_password_hash(request.password),
    )
    db.add(user)
    await db.flush()

    company = Company(
        name=request.company_name,
        business_name=request.company_business_name or request.company_name,
        nit=request.company_nit,
        address=request.company_address,
        city=request.company_city,
        phone=request.company_phone,
    )
    db.add(company)
    await db.flush()

    user_company = UserCompany(user_id=user.id, company_id=company.id, role="admin")
    db.add(user_company)
    await db.commit()
    await db.refresh(user)
    await db.refresh(company)

    access_token = create_access_token(user.id)
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
        company_id=company.id,
    )


@router.post("/companies", response_model=CompanyResponse)
async def create_company(
    request: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Company).where(Company.nit == request.nit))
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="NIT already exists")

    company = Company(**request.model_dump())
    db.add(company)
    await db.flush()

    user_company = UserCompany(user_id=current_user.id, company_id=company.id, role="admin")
    db.add(user_company)
    await db.commit()
    await db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("/companies", response_model=list[CompanyResponse])
async def list_companies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).join(UserCompany).where(UserCompany.user_id == current_user.id)
    )
    companies = result.scalars().all()
    return [CompanyResponse.model_validate(c) for c in companies]
