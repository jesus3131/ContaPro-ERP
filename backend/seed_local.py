import asyncio
import bcrypt
from datetime import date, datetime, timedelta
from app.db.database import AsyncSession, engine, async_session
from app.models.user import Company, User, UserCompany
from app.models.accounting import Account, AccountType, AccountNature, AccountClass, AccountingEntry, AccountingEntryDetail
from app.models.clients import Client, Supplier, Employee
from app.models.invoicing import Invoice, InvoiceItem
from app.models.inventory import Product, CostingMethod, InventoryMovement, MovementType, Kardex
from app.models.payroll import PayrollPeriod, PayrollSettlement
from app.models.financial import Budget, CashFlowProjection, FinancialIndicator
from app.models.banking import BankAccount, BankTransaction
from app.services.puc_colombia import PUC_COLOMBIA

async def seed():
    async with async_session() as db:
        # 0. Seed admin user and company
        existing = await db.execute(
            __import__("sqlalchemy").select(User).where(User.username == "admin").limit(1)
        )
        if not existing.scalars().first():
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw("admin123".encode(), salt)
            company = Company(name="ContaPro ERP S.A.S.", nit="900123456-7", email="info@contapro.com", phone="3001112233", address="Calle 123 # 45-67", city="Bogotá")
            db.add(company)
            await db.flush()
            admin = User(username="admin", email="admin@contapro.com", full_name="Admin User", password_hash=hashed.decode(), is_active=True, is_superuser=True)
            db.add(admin)
            await db.flush()
            db.add(UserCompany(user_id=admin.id, company_id=company.id, role="admin"))
            await db.commit()
            print(f"✅ Usuario admin y empresa '{company.name}' creados")
        else:
            print("ℹ️ Usuario admin ya existe, saltando")

        # 1. Seed PUC accounts
        existing = await db.execute(
            __import__("sqlalchemy").select(Account).where(Account.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            accounts = []
            for acc in PUC_COLOMBIA:
                accounts.append(Account(
                    company_id=1,
                    code=acc["code"],
                    name=acc["name"],
                    account_type=acc["account_type"],
                    nature=acc["nature"],
                    account_class=acc["account_class"],
                    level=acc["level"],
                    parent_id=None,
                    accepts_movements=acc.get("accepts_movements", False),
                    third_party_required=acc.get("third_party_required", False),
                ))
            db.add_all(accounts)
            await db.commit()
            print(f"✅ PUC: {len(accounts)} cuentas creadas")

            # Set parent_id based on code hierarchy
            sa = __import__("sqlalchemy")
            all_accs = (await db.execute(sa.select(Account).where(Account.company_id == 1))).scalars().all()
            for acc in all_accs:
                if len(acc.code) > 1:
                    parent_code = acc.code[:-1] if len(acc.code) > 1 else None
                    if parent_code:
                        parent = next((a for a in all_accs if a.code == parent_code), None)
                        if parent:
                            acc.parent_id = parent.id
            await db.commit()
            print("✅ PUC: jerarquía de padres asignada")
        else:
            print("ℹ️ PUC ya existe, saltando")

        # 2. Seed clients
        existing = await db.execute(
            __import__("sqlalchemy").select(Client).where(Client.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            clients = [
                Client(company_id=1, document_type="NIT", document_number="800123456-1", business_name="Distribuidora XYZ S.A.S.", email="info@distribuidoraxyz.com", phone="3001234567", city="Bogotá", department="Cundinamarca", credit_limit=50000000, payment_term_days=30),
                Client(company_id=1, document_type="NIT", document_number="800123456-2", business_name="Comercializadora ABC Ltda.", email="ventas@comercializadoraabc.com", phone="3002345678", city="Medellín", department="Antioquia", credit_limit=30000000, payment_term_days=45),
                Client(company_id=1, document_type="CC", document_number="1012345678", first_name="Carlos", last_name="Mendoza", email="carlos.mendoza@email.com", phone="3003456789", city="Cali", department="Valle del Cauca", credit_limit=10000000, payment_term_days=30),
                Client(company_id=1, document_type="NIT", document_number="800123456-4", business_name="Tecnología Global S.A.S.", email="info@tecnologiaglobal.com", phone="3004567890", city="Barranquilla", department="Atlántico", credit_limit=80000000, payment_term_days=60),
                Client(company_id=1, document_type="CC", document_number="1012345679", first_name="Ana", last_name="García", email="ana.garcia@email.com", phone="3005678901", city="Bogotá", department="Cundinamarca", credit_limit=5000000, payment_term_days=15),
            ]
            db.add_all(clients)
            await db.commit()
            print(f"✅ Clientes: {len(clients)} creados")
        else:
            print("ℹ️ Clientes ya existen, saltando")

        # 3. Seed suppliers
        existing = await db.execute(
            __import__("sqlalchemy").select(Supplier).where(Supplier.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            suppliers = [
                Supplier(company_id=1, document_type="NIT", document_number="900123456-7", business_name="Suplidora Industrial S.A.S.", contact_name="Pedro Pérez", email="ventas@suplidoraindustrial.com", phone="3011234567", city="Bogotá", payment_term_days=60),
                Supplier(company_id=1, document_type="NIT", document_number="900123456-8", business_name="Importadora del Sur Ltda.", contact_name="María López", email="compras@importadoradelsur.com", phone="3012345678", city="Cali", payment_term_days=90),
                Supplier(company_id=1, document_type="NIT", document_number="900123456-9", business_name="Materiales y Suministros S.A.", contact_name="Jorge Ramírez", email="pedidos@materialesysuministros.com", phone="3013456789", city="Medellín", payment_term_days=30),
            ]
            db.add_all(suppliers)
            await db.commit()
            print(f"✅ Proveedores: {len(suppliers)} creados")
        else:
            print("ℹ️ Proveedores ya existen, saltando")

        # 4. Seed employees
        existing = await db.execute(
            __import__("sqlalchemy").select(Employee).where(Employee.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            employees = [
                Employee(company_id=1, document_type="CC", document_number="1012345680", first_name="Luis", last_name="Rodríguez", email="luis.rodriguez@contapro.com", position="Contador Senior", department_name="Contabilidad", salary=4500000, salary_type="Fijo", contract_type="Indefinido", start_date=date(2020,1,15), eps="Sura", afp="Porvenir", ccf="Compensar", risk_class="I"),
                Employee(company_id=1, document_type="CC", document_number="1012345681", first_name="María", last_name="Torres", email="maria.torres@contapro.com", position="Auxiliar Contable", department_name="Contabilidad", salary=2500000, salary_type="Fijo", contract_type="Indefinido", start_date=date(2021,3,1), eps="Sanitas", afp="Protección", ccf="Colsubsidio", risk_class="I"),
                Employee(company_id=1, document_type="CC", document_number="1012345682", first_name="Jorge", last_name="Hernández", email="jorge.hernandez@contapro.com", position="Analista Financiero", department_name="Finanzas", salary=3800000, salary_type="Fijo", contract_type="Indefinido", start_date=date(2022,6,1), eps="Nueva EPS", afp="Porvenir", ccf="Cafam", risk_class="I"),
                Employee(company_id=1, document_type="CC", document_number="1012345683", first_name="Laura", last_name="Gómez", email="laura.gomez@contapro.com", position="Asistente Administrativa", department_name="Administración", salary=1800000, salary_type="Fijo", contract_type="Indefinido", start_date=date(2023,1,10), eps="Compensar EPS", afp="Colfondos", ccf="Compensar", risk_class="I"),
                Employee(company_id=1, document_type="CC", document_number="1012345684", first_name="Diego", last_name="Martínez", email="diego.martinez@contapro.com", position="Desarrollador", department_name="Sistemas", salary=5500000, salary_type="Fijo", contract_type="Indefinido", start_date=date(2022,9,1), eps="Sura", afp="Protección", ccf="Colsubsidio", risk_class="I"),
            ]
            db.add_all(employees)
            await db.commit()
            print(f"✅ Empleados: {len(employees)} creados")
        else:
            print("ℹ️ Empleados ya existen, saltando")

        # 5. Seed products
        existing = await db.execute(
            __import__("sqlalchemy").select(Product).where(Product.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            products = [
                Product(company_id=1, code="PROD001", name="Laptop ProBook 450", category="Equipos de Cómputo", unit_type="Unidad", cost_price=2500000, sale_price=3500000, tax_rate=19.0, tax_code="IVA", min_stock=5, current_stock=15, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD002", name="Monitor 27\" 4K", category="Equipos de Cómputo", unit_type="Unidad", cost_price=800000, sale_price=1200000, tax_rate=19.0, tax_code="IVA", min_stock=10, current_stock=25, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD003", name="Teclado Mecánico", category="Periféricos", unit_type="Unidad", cost_price=120000, sale_price=200000, tax_rate=19.0, tax_code="IVA", min_stock=20, current_stock=50, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD004", name="Mouse Inalámbrico", category="Periféricos", unit_type="Unidad", cost_price=45000, sale_price=80000, tax_rate=19.0, tax_code="IVA", min_stock=30, current_stock=80, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD005", name="Servidor Dell PowerEdge", category="Equipos de Cómputo", unit_type="Unidad", cost_price=8500000, sale_price=12000000, tax_rate=19.0, tax_code="IVA", min_stock=2, current_stock=5, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD006", name="Impresora Láser", category="Impresión", unit_type="Unidad", cost_price=650000, sale_price=950000, tax_rate=19.0, tax_code="IVA", min_stock=5, current_stock=12, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD007", name="Cable HDMI 2m", category="Accesorios", unit_type="Unidad", cost_price=8000, sale_price=15000, tax_rate=19.0, tax_code="IVA", min_stock=50, current_stock=200, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD008", name="Webcam HD 1080p", category="Periféricos", unit_type="Unidad", cost_price=75000, sale_price=135000, tax_rate=19.0, tax_code="IVA", min_stock=15, current_stock=40, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD009", name="Disco SSD 1TB", category="Almacenamiento", unit_type="Unidad", cost_price=180000, sale_price=320000, tax_rate=19.0, tax_code="IVA", min_stock=10, current_stock=30, costing_method=CostingMethod.PROMEDIO),
                Product(company_id=1, code="PROD010", name="UPS APC 1500VA", category="Energía", unit_type="Unidad", cost_price=450000, sale_price=720000, tax_rate=19.0, tax_code="IVA", min_stock=5, current_stock=10, costing_method=CostingMethod.PROMEDIO),
            ]
            db.add_all(products)
            await db.commit()
            print(f"✅ Productos: {len(products)} creados")
        else:
            print("ℹ️ Productos ya existen, saltando")

        # 6. Seed accounting entries
        existing = await db.execute(
            __import__("sqlalchemy").select(AccountingEntry).where(AccountingEntry.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            sa = __import__("sqlalchemy")
            accounts = {a.code: a for a in (await db.execute(sa.select(Account).where(Account.company_id == 1))).scalars().all()}
            entries_data = [
                {"entry_number": "C-001", "entry_type": "Apertura", "date": date(2026,1,1), "description": "Apertura del ejercicio contable 2026", "created_by": 1, "details": [
                    {"account_code": "3105", "nature": "DEBIT", "debit": 200000000, "credit": 0},
                    {"account_code": "1105", "nature": "CREDIT", "debit": 0, "credit": 200000000},
                ]},
                {"entry_number": "C-002", "entry_type": "Compra", "date": date(2026,1,15), "description": "Compra de mercancía a Suplidora Industrial", "created_by": 1, "details": [
                    {"account_code": "1405", "nature": "DEBIT", "debit": 15000000, "credit": 0},
                    {"account_code": "2365", "nature": "DEBIT", "debit": 2850000, "credit": 0},
                    {"account_code": "2205", "nature": "CREDIT", "debit": 0, "credit": 17850000},
                ]},
                {"entry_number": "C-003", "entry_type": "Venta", "date": date(2026,2,1), "description": "Venta de productos a Distribuidora XYZ", "created_by": 1, "details": [
                    {"account_code": "1305", "nature": "DEBIT", "debit": 41650000, "credit": 0},
                    {"account_code": "4105", "nature": "CREDIT", "debit": 0, "credit": 35000000},
                    {"account_code": "2370", "nature": "CREDIT", "debit": 0, "credit": 6650000},
                ]},
                {"entry_number": "C-004", "entry_type": "Gasto", "date": date(2026,2,15), "description": "Pago de nómina febrero 2026", "created_by": 1, "details": [
                    {"account_code": "5105", "nature": "DEBIT", "debit": 18100000, "credit": 0},
                    {"account_code": "1105", "nature": "CREDIT", "debit": 0, "credit": 18100000},
                ]},
                {"entry_number": "C-005", "entry_type": "Ingreso", "date": date(2026,3,1), "description": "Pago de factura cliente Tecnología Global", "created_by": 1, "details": [
                    {"account_code": "1105", "nature": "DEBIT", "debit": 50000000, "credit": 0},
                    {"account_code": "1305", "nature": "CREDIT", "debit": 0, "credit": 50000000},
                ]},
            ]
            for ed in entries_data:
                entry = AccountingEntry(
                    company_id=1, entry_number=ed["entry_number"], entry_type=ed["entry_type"],
                    date=ed["date"], description=ed["description"], created_by=ed["created_by"]
                )
                db.add(entry)
                await db.flush()
                for detail in ed["details"]:
                    acc = accounts.get(detail["account_code"])
                    if acc:
                        db.add(AccountingEntryDetail(
                            entry_id=entry.id, account_id=acc.id,
                            nature=detail["nature"], debit=detail["debit"], credit=detail["credit"]
                        ))
            # Set reasonable current_balance for accounts used in entries
            account_code_balances = {
                "1105": 50000000,    # Caja
                "1305": 50000000,    # Clientes
                "1405": 15000000,    # Inventario
                "2205": 17850000,    # Proveedores
                "2365": 2850000,     # IVA por pagar
                "2370": 6650000,     # IVA descontable
                "3105": 200000000,   # Capital
                "4105": 35000000,    # Ingresos
                "5105": 18100000,    # Gastos
            }
            for code, bal in account_code_balances.items():
                acc = accounts.get(code)
                if acc:
                    acc.current_balance = bal
            await db.commit()
            print(f"✅ Asientos contables: {len(entries_data)} creados, cuentas actualizadas")
        else:
            print("ℹ️ Asientos contables ya existen, saltando")

        # 7. Seed invoices
        existing = await db.execute(
            __import__("sqlalchemy").select(Invoice).where(Invoice.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            sa = __import__("sqlalchemy")
            clients_list = {c.id: c for c in (await db.execute(sa.select(Client).where(Client.company_id == 1))).scalars().all()}
            products_list = {p.id: p for p in (await db.execute(sa.select(Product).where(Product.company_id == 1))).scalars().all()}
            client_ids = list(clients_list.keys())
            prod_ids = list(products_list.keys())
            invoices_data = [
                {"client_idx": 0, "invoice_type": "FV", "invoice_number": "FV001", "prefix": "FVE", "issue_date": date(2026,1,20), "due_date": date(2026,2,19), "payment_method": "Crédito", "payment_form": "2", "items": [(0, 3, 3500000), (1, 5, 1200000)]},
                {"client_idx": 1, "invoice_type": "FV", "invoice_number": "FV002", "prefix": "FVE", "issue_date": date(2026,2,5), "due_date": date(2026,3,22), "payment_method": "Crédito", "payment_form": "2", "items": [(2, 10, 200000), (3, 15, 80000), (7, 5, 135000)]},
                {"client_idx": 2, "invoice_type": "FV", "invoice_number": "FV003", "prefix": "FVE", "issue_date": date(2026,2,15), "due_date": date(2026,3,2), "payment_method": "Contado", "payment_form": "1", "items": [(0, 1, 3500000)]},
                {"client_idx": 3, "invoice_type": "FV", "invoice_number": "FV004", "prefix": "FVE", "issue_date": date(2026,3,1), "due_date": date(2026,4,30), "payment_method": "Crédito", "payment_form": "2", "items": [(4, 2, 12000000), (5, 1, 950000)]},
            ]
            for inv_data in invoices_data:
                subtotal = sum(qty * price for (_, qty, price) in inv_data["items"])
                tax = subtotal * 0.19
                total = subtotal + tax
                invoice = Invoice(
                    company_id=1, client_id=client_ids[inv_data["client_idx"]],
                    invoice_type=inv_data["invoice_type"], invoice_number=inv_data["invoice_number"],
                    prefix=inv_data["prefix"], issue_date=inv_data["issue_date"], due_date=inv_data["due_date"],
                    payment_method=inv_data["payment_method"], payment_form=inv_data["payment_form"],
                    subtotal=subtotal, tax_amount=tax, total=total, status="Emitida", created_by=1
                )
                db.add(invoice)
                await db.flush()
                for (prod_idx, qty, price) in inv_data["items"]:
                    db.add(InvoiceItem(
                        invoice_id=invoice.id, product_id=prod_ids[prod_idx],
                        description=products_list[prod_ids[prod_idx]].name,
                        quantity=qty, unit_price=price, tax_percentage=19.0,
                        tax_amount=price * qty * 0.19, total=price * qty * 1.19
                    ))
            await db.commit()
            print(f"✅ Facturas: {len(invoices_data)} creadas")
        else:
            print("ℹ️ Facturas ya existen, saltando")

        # 8. Seed bank accounts
        existing = await db.execute(
            __import__("sqlalchemy").select(BankAccount).where(BankAccount.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            bank_accounts = [
                BankAccount(company_id=1, bank_name="Bancolombia", account_type="Corriente", account_number="123456789", account_name="ContaPro ERP S.A.S. - Cta. Cte.", opening_balance=50000000, current_balance=85000000),
                BankAccount(company_id=1, bank_name="Davivienda", account_type="Ahorros", account_number="987654321", account_name="ContaPro ERP S.A.S. - Cta. Ahorro", opening_balance=30000000, current_balance=45000000),
                BankAccount(company_id=1, bank_name="Banco de Bogotá", account_type="Corriente", account_number="456789123", account_name="ContaPro ERP S.A.S. - Cta. Cte. USD", opening_balance=10000000, current_balance=15000000),
            ]
            db.add_all(bank_accounts)
            await db.commit()
            print(f"✅ Cuentas bancarias: {len(bank_accounts)} creadas")
        else:
            print("ℹ️ Cuentas bancarias ya existen, saltando")

        # 9. Seed bank transactions
        existing = await db.execute(
            __import__("sqlalchemy").select(BankTransaction).where(BankTransaction.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            sa = __import__("sqlalchemy")
            accounts_list = {a.id: a for a in (await db.execute(sa.select(BankAccount).where(BankAccount.company_id == 1))).scalars().all()}
            ba_ids = list(accounts_list.keys())
            transactions = [
                BankTransaction(company_id=1, bank_account_id=ba_ids[0], transaction_date=date(2026,1,5), description="Aporte de capital inicial", amount=50000000, transaction_type="Ingreso", reference="AP-001", is_reconciled=True, reconciliation_date=date(2026,1,5)),
                BankTransaction(company_id=1, bank_account_id=ba_ids[0], transaction_date=date(2026,1,20), description="Pago factura FV001 - Distribuidora XYZ", amount=41650000, transaction_type="Ingreso", reference="PAGO-FV001", is_reconciled=True, reconciliation_date=date(2026,1,22)),
                BankTransaction(company_id=1, bank_account_id=ba_ids[0], transaction_date=date(2026,2,1), description="Pago nómina enero", amount=18100000, transaction_type="Egreso", reference="NOM-ENE", is_reconciled=True, reconciliation_date=date(2026,2,1)),
                BankTransaction(company_id=1, bank_account_id=ba_ids[1], transaction_date=date(2026,1,5), description="Aporte de capital inicial", amount=30000000, transaction_type="Ingreso", reference="AP-002", is_reconciled=True, reconciliation_date=date(2026,1,5)),
                BankTransaction(company_id=1, bank_account_id=ba_ids[0], transaction_date=date(2026,3,1), description="Pago factura Tecnología Global", amount=50000000, transaction_type="Ingreso", reference="PAGO-FV004", is_reconciled=False),
            ]
            db.add_all(transactions)
            await db.commit()
            print(f"✅ Transacciones bancarias: {len(transactions)} creadas")
        else:
            print("ℹ️ Transacciones bancarias ya existen, saltando")

        # 10. Seed payroll period + settlements
        existing = await db.execute(
            __import__("sqlalchemy").select(PayrollPeriod).where(PayrollPeriod.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            period = PayrollPeriod(company_id=1, year=2026, month=1, period_type="Mensual", start_date=date(2026,1,1), end_date=date(2026,1,31), payment_date=date(2026,2,5))
            db.add(period)
            await db.flush()

            sa = __import__("sqlalchemy")
            employees = (await db.execute(sa.select(Employee).where(Employee.company_id == 1))).scalars().all()
            for emp in employees:
                health = emp.salary * 0.04
                pension = emp.salary * 0.04
                deductions = health + pension
                transport_allowance = 162000 if emp.salary <= 2600000 else 0
                gross = emp.salary + transport_allowance
                net = gross - deductions
                db.add(PayrollSettlement(
                    company_id=1, employee_id=emp.id, period_id=period.id,
                    base_salary=emp.salary, worked_days=30,
                    transport_allowance=transport_allowance,
                    gross_salary=gross, health_deduction=health, pension_deduction=pension,
                    total_deductions=deductions, net_payment=net,
                    severance=emp.salary*0.0833, severance_interest=emp.salary*0.0833*0.12/12,
                    prima=emp.salary*0.0833, vacation=emp.salary*0.0417,
                    employer_health=emp.salary*0.085, employer_pension=emp.salary*0.12,
                    arl=emp.salary*0.00522, ccf=emp.salary*0.04, sena=emp.salary*0.02, icbf=emp.salary*0.03,
                    total_parafiscal=emp.salary*0.09,
                    status="Pagada", dian_status="Enviada",
                    notes=f"Liquidación nómina {emp.first_name} {emp.last_name} - Enero 2026"
                ))
            await db.commit()
            print(f"✅ Período nómina + {len(employees)} liquidaciones creados")
        else:
            print("ℹ️ Nómina ya existe, saltando")

        # 11. Seed budgets
        existing = await db.execute(
            __import__("sqlalchemy").select(Budget).where(Budget.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            sa = __import__("sqlalchemy")
            accounts = (await db.execute(sa.select(Account).where(Account.company_id == 1))).scalars().all()
            income_accounts = [a for a in accounts if a.account_type == AccountType.INGRESO and a.accepts_movements]
            expense_accounts = [a for a in accounts if a.account_type == AccountType.GASTO and a.accepts_movements]
            budgets = []
            for acc in income_accounts[:3]:
                budgets.append(Budget(company_id=1, account_id=acc.id, year=2026, budgeted_amount=300000000, actual_amount=0))
            for acc in expense_accounts[:5]:
                budgets.append(Budget(company_id=1, account_id=acc.id, year=2026, budgeted_amount=50000000, actual_amount=0))
            db.add_all(budgets)
            await db.commit()
            print(f"✅ Presupuestos: {len(budgets)} creados")
        else:
            print("ℹ️ Presupuestos ya existen, saltando")

        # 12. Seed financial indicators
        existing = await db.execute(
            __import__("sqlalchemy").select(FinancialIndicator).where(FinancialIndicator.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            indicators = [
                FinancialIndicator(company_id=1, period_year=2026, period_month=1, indicator_type="Liquidez", indicator_name="Razón Corriente", value=2.5, previous_value=2.3, variation=0.087, interpretation="La empresa tiene buena capacidad de pago a corto plazo"),
                FinancialIndicator(company_id=1, period_year=2026, period_month=1, indicator_type="Endeudamiento", indicator_name="Nivel de Endeudamiento", value=0.45, previous_value=0.48, variation=-0.0625, interpretation="El nivel de endeudamiento es saludable y ha disminuido"),
                FinancialIndicator(company_id=1, period_year=2026, period_month=1, indicator_type="Rentabilidad", indicator_name="Margen Neto", value=0.15, previous_value=0.12, variation=0.25, interpretation="La rentabilidad ha mejorado respecto al período anterior"),
                FinancialIndicator(company_id=1, period_year=2026, period_month=1, indicator_type="Eficiencia", indicator_name="Rotación de Cartera", value=45.0, previous_value=50.0, variation=-0.1, interpretation="La rotación de cartera ha mejorado, se recupera más rápido"),
                FinancialIndicator(company_id=1, period_year=2026, period_month=2, indicator_type="Liquidez", indicator_name="Prueba Ácida", value=1.8, previous_value=1.6, variation=0.125, interpretation="La liquidez inmediata es adecuada"),
            ]
            db.add_all(indicators)
            await db.commit()
            print(f"✅ Indicadores financieros: {len(indicators)} creados")
        else:
            print("ℹ️ Indicadores financieros ya existen, saltando")

        # 13. Seed cash flow projections
        existing = await db.execute(
            __import__("sqlalchemy").select(CashFlowProjection).where(CashFlowProjection.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            projections = []
            for i in range(1, 7):
                month = i
                projections.append(CashFlowProjection(
                    company_id=1, projection_date=date(2026, month, 1),
                    projected_income=80000000, projected_expenses=60000000, projected_balance=20000000,
                    actual_income=75000000 if month < 4 else None, actual_expenses=58000000 if month < 4 else None, actual_balance=17000000 if month < 4 else None,
                    confidence_level=0.85
                ))
            db.add_all(projections)
            await db.commit()
            print(f"✅ Proyecciones flujo de caja: {len(projections)} creadas")
        else:
            print("ℹ️ Proyecciones ya existen, saltando")

        # 14. Seed inventory movements + kardex
        existing = await db.execute(
            __import__("sqlalchemy").select(InventoryMovement).where(InventoryMovement.company_id == 1).limit(1)
        )
        if not existing.scalars().first():
            sa = __import__("sqlalchemy")
            products = (await db.execute(sa.select(Product).where(Product.company_id == 1))).scalars().all()
            movements = []
            kardex_entries = []
            for prod in products:
                m = InventoryMovement(company_id=1, product_id=prod.id, movement_type=MovementType.ENTRADA, quantity=prod.current_stock, unit_cost=prod.cost_price, total_cost=prod.cost_price*prod.current_stock, description="Inventario inicial", created_by=1)
                db.add(m)
                await db.flush()
                kardex_entries.append(Kardex(company_id=1, product_id=prod.id, movement_id=m.id, date=date(2026,1,1), concept="Inventario inicial", entry_quantity=prod.current_stock, entry_unit_cost=prod.cost_price, entry_total_cost=prod.cost_price*prod.current_stock, balance_quantity=prod.current_stock, balance_unit_cost=prod.cost_price, balance_total_cost=prod.cost_price*prod.current_stock))
            db.add_all(kardex_entries)
            await db.commit()
            print(f"✅ Movimientos inventario + kardex: {len(movements+[1])} creados")
        else:
            print("ℹ️ Inventario ya existe, saltando")

        # Always update account balances from journal entries
        sa = __import__("sqlalchemy")
        details = (await db.execute(sa.select(AccountingEntryDetail))).scalars().all()
        account_balances = {}
        for d in details:
            account_balances[d.account_id] = account_balances.get(d.account_id, 0) + (d.debit or 0) - (d.credit or 0)
        all_accounts = (await db.execute(sa.select(Account).where(Account.company_id == 1))).scalars().all()
        accounts_dict = {a.id: a for a in all_accounts}
        updated_count = 0
        for acc_id, net_balance in account_balances.items():
            acc = accounts_dict.get(acc_id)
            if acc:
                acc.current_balance = net_balance if net_balance > 0 else 0
                updated_count += 1
        await db.commit()
        if updated_count > 0:
            print(f"✅ Balances de cuentas actualizados: {updated_count} cuentas")

        print("\n🎉 Seed completado exitosamente!")

if __name__ == "__main__":
    asyncio.run(seed())