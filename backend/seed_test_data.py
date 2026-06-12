"""Seed de datos de prueba para todos los módulos de ContaPro ERP Colombia"""
import sys, os, asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ["USE_SQLITE"] = "false"

from datetime import date, datetime
from app.db.database import async_session
from app.db.seed import seed_default_admin
from app.models.user import User, Company
from app.models.clients import Client, Supplier, Employee
from app.models.inventory import Product, InventoryMovement, Kardex, MovementType, CostingMethod
from app.models.invoicing import Invoice, InvoiceItem, CreditNote, DebitNote
from app.models.accounting import Account, AccountingEntry, AccountingEntryDetail, Closing, AccountType, AccountNature, AccountClass
from app.models.financial import Budget, CashFlowProjection, FinancialIndicator
from app.models.banking import BankAccount, BankTransaction
from app.models.payroll import PayrollPeriod, PayrollSettlement
from sqlalchemy import select, func

PUC = [
    # ACTIVO
    ("1", "ACTIVO", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 1, True),
    ("11", "DISPONIBLE", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 2, True),
    ("1105", "CAJA", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 15000000.0),
    ("1110", "BANCOS", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 85000000.0),
    ("1120", "CUENTAS DE AHORRO", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 45000000.0),
    ("13", "DEUDORES", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 2, True),
    ("1305", "CLIENTES NACIONALES", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 32000000.0),
    ("1310", "CLIENTES DEL EXTERIOR", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 0.0),
    ("1355", "ANTICIPO DE IMPUESTOS", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 8500000.0),
    ("14", "INVENTARIOS", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 2, True),
    ("1405", "INVENTARIOS GENERAL", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 28000000.0),
    ("15", "PROPIEDADES PLANTA Y EQUIPO", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 2, True),
    ("1504", "TERRENOS", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 200000000.0),
    ("1505", "CONSTRUCCIONES EN CURSO", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 0.0),
    ("1516", "MAQUINARIA Y EQUIPO", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 95000000.0),
    ("1520", "EQUIPO DE OFICINA", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 12000000.0),
    ("1524", "EQUIPO DE COMPUTACIÓN", AccountType.ACTIVO, AccountNature.DEUDORA, AccountClass.REAL, 3, True, 18000000.0),
    # PASIVO
    ("2", "PASIVO", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 1, True),
    ("21", "OBLIGACIONES FINANCIERAS", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("2105", "BANCOS NACIONALES", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 45000000.0),
    ("22", "PROVEEDORES", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("2205", "PROVEEDORES NACIONALES", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 18500000.0),
    ("23", "CUENTAS POR PAGAR", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("2305", "COSTOS Y GASTOS POR PAGAR", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 5200000.0),
    ("2365", "RETENCION EN LA FUENTE", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 3800000.0),
    ("2367", "IMPUESTO AL VALOR AGREGADO", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 6200000.0),
    ("2370", "RETENCIÓN DE ICA", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 1200000.0),
    ("24", "IMPUESTOS POR PAGAR", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("2405", "IMPUESTO SOBRE LA RENTA", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 15000000.0),
    ("25", "OBLIGACIONES LABORALES", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("2505", "SALARIOS POR PAGAR", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 8500000.0),
    ("2510", "CESANTIAS", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 4200000.0),
    ("2515", "INTERESES SOBRE CESANTIAS", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 500000.0),
    ("2520", "VACACIONES", AccountType.PASIVO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 2800000.0),
    # PATRIMONIO
    ("3", "PATRIMONIO", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 1, True),
    ("31", "CAPITAL SOCIAL", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("3105", "CAPITAL SUSCRITO Y PAGADO", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 200000000.0),
    ("32", "RESERVAS", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("3205", "RESERVAS OBLIGATORIAS", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 25000000.0),
    ("33", "RESULTADOS DEL EJERCICIO", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("3305", "RESULTADOS DEL EJERCICIO", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 45000000.0),
    ("34", "GANANCIAS RETENIDAS", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 2, True),
    ("3405", "UTILIDADES RETENIDAS", AccountType.PATRIMONIO, AccountNature.ACREEDORA, AccountClass.REAL, 3, True, 12000000.0),
    # INGRESO
    ("4", "INGRESO", AccountType.INGRESO, AccountNature.ACREEDORA, AccountClass.NOMINAL, 1, True),
    ("41", "INGRESOS OPERACIONALES", AccountType.INGRESO, AccountNature.ACREEDORA, AccountClass.NOMINAL, 2, True),
    ("4105", "COMERCIO AL POR MAYOR Y AL POR MENOR", AccountType.INGRESO, AccountNature.ACREEDORA, AccountClass.NOMINAL, 3, True),
    ("42", "INGRESOS NO OPERACIONALES", AccountType.INGRESO, AccountNature.ACREEDORA, AccountClass.NOMINAL, 2, True),
    ("4205", "OTROS INGRESOS", AccountType.INGRESO, AccountNature.ACREEDORA, AccountClass.NOMINAL, 3, True),
    # GASTO
    ("5", "GASTO", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 1, True),
    ("51", "GASTOS OPERACIONALES", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 2, True),
    ("5105", "GASTOS DE PERSONAL", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
    ("5110", "HONORARIOS", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
    ("5115", "IMPUESTOS", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
    ("5120", "ARRENDAMIENTOS", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
    ("5125", "SERVICIOS PÚBLICOS", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
    ("52", "GASTOS NO OPERACIONALES", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 2, True),
    ("5205", "GASTOS FINANCIEROS", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
    ("53", "GASTOS DE IMPUESTO A LA RENTA", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 2, True),
    ("5305", "IMPUESTO DE RENTA", AccountType.GASTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
    # COSTO
    ("6", "COSTO", AccountType.COSTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 1, True),
    ("61", "COSTO DE VENTAS", AccountType.COSTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 2, True),
    ("6105", "COSTO DE VENTAS", AccountType.COSTO, AccountNature.DEUDORA, AccountClass.NOMINAL, 3, True),
]

CLIENTS = [
    {"doc_type": "NIT", "doc_num": "800123456-1", "dv": "1", "biz": "Distribuidora La 14 S.A.S.", "email": "contacto@la14.com.co", "phone": "3101234567", "city": "Cali", "dept": "Valle del Cauca", "limit": 50000000},
    {"doc_type": "NIT", "doc_num": "900234567-7", "dv": "7", "biz": "Comercializadora XYZ S.A.S.", "email": "ventas@comercialxyz.com", "phone": "3159876543", "city": "Medellín", "dept": "Antioquia", "limit": 30000000},
    {"doc_type": "CC", "doc_num": "1012345678", "biz": "Carlos Andrés Martínez", "email": "carlos.martinez@gmail.com", "phone": "3204567890", "city": "Bogotá", "dept": "Cundinamarca", "limit": 10000000},
    {"doc_type": "CC", "doc_num": "1023456789", "biz": "María Fernanda López", "email": "maria.lopez@outlook.com", "phone": "3005678901", "city": "Barranquilla", "dept": "Atlántico", "limit": 15000000},
    {"doc_type": "NIT", "doc_num": "800345678-3", "dv": "3", "biz": "Almacenes Éxito S.A.", "email": "compras@exito.com.co", "phone": "6012345678", "city": "Bogotá", "dept": "Cundinamarca", "limit": 80000000},
]

SUPPLIERS = [
    {"doc_type": "NIT", "doc_num": "800111222-5", "dv": "5", "biz": "Distribuidora de Insumos Ltda.", "contact": "Pedro Ramírez", "email": "pedro@insumos.com", "phone": "3011112233", "city": "Bogotá", "dept": "Cundinamarca"},
    {"doc_type": "NIT", "doc_num": "900333444-9", "dv": "9", "biz": "Tecnología Avanzada S.A.S.", "contact": "Ana Torres", "email": "ana@tecavanza.com", "phone": "3104445566", "city": "Medellín", "dept": "Antioquia"},
    {"doc_type": "NIT", "doc_num": "800555666-2", "dv": "2", "biz": "Papelería y Suministros S.A.", "contact": "Luis Gómez", "email": "luis@papisuministros.com", "phone": "3157778899", "city": "Cali", "dept": "Valle del Cauca"},
    {"doc_type": "NIT", "doc_num": "900777888-4", "dv": "4", "biz": "Servicios Logísticos del Sur", "contact": "Carla Muñoz", "email": "carla@logisticasur.com", "phone": "3209990011", "city": "Bogotá", "dept": "Cundinamarca"},
]

EMPLOYEES = [
    {"doc_type": "CC", "doc_num": "79876543", "first": "Juan David", "last": "Rodríguez Pérez", "email": "juan.rodriguez@contapro.com", "phone": "3101112233", "position": "Gerente General", "dept": "Dirección", "salary": 8500000, "contract": "Indefinido", "eps": "Sura", "afp": "Colfondos", "arl": "Aseguradora Solidaria"},
    {"doc_type": "CC", "doc_num": "52876543", "first": "Laura Marcela", "last": "González Vargas", "email": "laura.gonzalez@contapro.com", "phone": "3154445566", "position": "Contadora", "dept": "Contabilidad", "salary": 4800000, "contract": "Indefinido", "eps": "Compensar", "afp": "Protección", "arl": "Positiva"},
    {"doc_type": "CC", "doc_num": "1018765432", "first": "Andrés Felipe", "last": "Castro Sánchez", "email": "andres.castro@contapro.com", "phone": "3207778899", "position": "Asistente Administrativo", "dept": "Administración", "salary": 2300000, "contract": "Término Fijo", "eps": "Nueva EPS", "afp": "Porvenir", "arl": "ARL Sura"},
    {"doc_type": "CC", "doc_num": "1029876543", "first": "Diana Patricia", "last": "Moreno Rincón", "email": "diana.moreno@contapro.com", "phone": "3009990011", "position": "Auxiliar de Facturación", "dept": "Facturación", "salary": 1600000, "contract": "Término Fijo", "eps": "Famisanar", "afp": "Colfondos", "arl": "Aseguradora Solidaria"},
]

PRODUCTS = [
    {"code": "PROD-001", "barcode": "7701234567890", "name": "Laptop HP ProBook 450", "cat": "Equipos", "unit": "Unidad", "cost": 2800000, "price": 4200000, "tax": 19.0, "stock": 15, "min": 5},
    {"code": "PROD-002", "barcode": "7701234567891", "name": "Monitor LG 27\" 4K", "cat": "Equipos", "unit": "Unidad", "cost": 950000, "price": 1580000, "tax": 19.0, "stock": 25, "min": 8},
    {"code": "PROD-003", "barcode": "7701234567892", "name": "Teclado Mecánico Logitech", "cat": "Periféricos", "unit": "Unidad", "cost": 180000, "price": 320000, "tax": 19.0, "stock": 50, "min": 15},
    {"code": "PROD-004", "barcode": "7701234567893", "name": "Mouse Inalámbrico Dell", "cat": "Periféricos", "unit": "Unidad", "cost": 85000, "price": 149000, "tax": 19.0, "stock": 40, "min": 10},
    {"code": "PROD-005", "barcode": "7701234567894", "name": "Silla Ergonómica Oficina", "cat": "Muebles", "unit": "Unidad", "cost": 650000, "price": 1200000, "tax": 19.0, "stock": 10, "min": 3},
    {"code": "PROD-006", "barcode": "7701234567895", "name": "Escritorio Metálico 1.50m", "cat": "Muebles", "unit": "Unidad", "cost": 380000, "price": 720000, "tax": 19.0, "stock": 8, "min": 2},
]


async def seed():
    async with async_session() as db:
        # 0. Asegurar admin y empresa por defecto
        await seed_default_admin()
        # 1. Verificar empresa por defecto
        result = await db.execute(select(Company).where(Company.nit == "900000000-1"))
        company = result.scalars().first()
        if not company:
            print("❌ No hay empresa por defecto. seed_default_admin() falló.")
            return
        cid = company.id
        print(f"✓ Empresa: {company.name} (ID={cid})")

        # 2. Plan Único de Cuentas (PUC)
        existing = await db.execute(select(func.count(Account.id)).where(Account.company_id == cid))
        if existing.scalar() > 0:
            print("⚠ PUC ya existe, se omite")
        else:
            accounts = {}
            for row in PUC:
                code, name, atype, nature, aclass, level, accepts = row[:7]
                opening = row[7] if len(row) > 7 else 0.0
                a = Account(company_id=cid, code=code, name=name, account_type=atype, nature=nature, account_class=aclass, level=level, accepts_movements=accepts, opening_balance=opening, current_balance=opening)
                db.add(a)
                await db.flush()
                accounts[code] = a.id
            # Asignar parent_id
            for row in PUC:
                code = row[0]
                level = row[5]
                if level > 1:
                    parent_code = code[:-1]
                    if parent_code in accounts:
                        a = await db.get(Account, accounts[code])
                        a.parent_id = accounts[parent_code]
            await db.flush()
            print(f"✓ PUC: {len(PUC)} cuentas creadas")

        # Obtener IDs de cuentas
        cuentas = {}
        r = await db.execute(select(Account).where(Account.company_id == cid))
        for a in r.scalars():
            cuentas[a.code] = a.id

        # 3. Clientes
        r = await db.execute(select(func.count(Client.id)).where(Client.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Clientes ya existen, se omite")
            client_ids = {}
            r2 = await db.execute(select(Client).where(Client.company_id == cid))
            for c in r2.scalars():
                client_ids[c.document_number] = c.id
        else:
            client_ids = {}
            for cl in CLIENTS:
                c = Client(company_id=cid, document_type=cl["doc_type"], document_number=cl["doc_num"], dv=cl.get("dv"), business_name=cl["biz"], email=cl["email"], phone=cl["phone"], city=cl["city"], department=cl["dept"], credit_limit=cl["limit"], tax_regime="Común")
                db.add(c)
                await db.flush()
                client_ids[cl["doc_num"]] = c.id
            await db.flush()
            print(f"✓ Clientes: {len(CLIENTS)} creados")

        # 4. Proveedores
        r = await db.execute(select(func.count(Supplier.id)).where(Supplier.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Proveedores ya existen, se omite")
        else:
            for s in SUPPLIERS:
                sup = Supplier(company_id=cid, document_type=s["doc_type"], document_number=s["doc_num"], dv=s.get("dv"), business_name=s["biz"], contact_name=s["contact"], email=s["email"], phone=s["phone"], city=s["city"], department=s["dept"])
                db.add(sup)
            await db.flush()
            print(f"✓ Proveedores: {len(SUPPLIERS)} creados")

        # 5. Empleados
        r = await db.execute(select(func.count(Employee.id)).where(Employee.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Empleados ya existen, se omite")
            emp_ids = {}
            r2 = await db.execute(select(Employee).where(Employee.company_id == cid))
            for e in r2.scalars():
                emp_ids[e.document_number] = e.id
        else:
            emp_ids = {}
            for e in EMPLOYEES:
                emp = Employee(company_id=cid, document_type=e["doc_type"], document_number=e["doc_num"], first_name=e["first"], last_name=e["last"], email=e["email"], phone=e["phone"], position=e["position"], department_name=e["dept"], salary=e["salary"], contract_type=e["contract"], eps=e["eps"], afp=e["afp"], risk_class=e.get("arl"), start_date=date(2024, 1, 15))
                db.add(emp)
                await db.flush()
                emp_ids[e["doc_num"]] = emp.id
            await db.flush()
            print(f"✓ Empleados: {len(EMPLOYEES)} creados")

        # 6. Productos
        r = await db.execute(select(func.count(Product.id)).where(Product.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Productos ya existen, se omite")
            prod_ids = {}
            r2 = await db.execute(select(Product).where(Product.company_id == cid))
            for p in r2.scalars():
                prod_ids[p.code] = p.id
        else:
            prod_ids = {}
            for p in PRODUCTS:
                prod = Product(company_id=cid, code=p["code"], barcode=p["barcode"], name=p["name"], category=p["cat"], unit_type=p["unit"], cost_price=p["cost"], sale_price=p["price"], tax_rate=p["tax"], current_stock=p["stock"], min_stock=p["min"], costing_method=CostingMethod.PROMEDIO)
                db.add(prod)
                await db.flush()
                prod_ids[p["code"]] = prod.id
            await db.flush()
            print(f"✓ Productos: {len(PRODUCTS)} creados")

        # 7. Facturas
        r = await db.execute(select(func.count(Invoice.id)).where(Invoice.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Facturas ya existen, se omite")
        else:
            today = date.today()
            client_list = list(client_ids.values())
            for i in range(4):
                subtotal = [4800000, 3200000, 1890000, 720000][i]
                tax = round(subtotal * 0.19)
                total = subtotal + tax
                inv = Invoice(company_id=cid, client_id=client_list[i % len(client_list)], invoice_type="FE", invoice_number=f"FE-{i+1:04d}", prefix="FE1", issue_date=date(today.year, today.month, 2 + i), due_date=date(today.year, today.month + 1, 2 + i), payment_method="Transferencia", payment_form="1", subtotal=float(subtotal), tax_amount=float(tax), total=float(total), status="Sent" if i < 3 else "Draft")
                db.add(inv)
                await db.flush()
                # Items de cada factura
                items_data = [
                    [(prod_ids["PROD-001"], "Laptop HP ProBook 450", 1, 4200000)],
                    [(prod_ids["PROD-002"], "Monitor LG 27\" 4K", 2, 1580000)],
                    [(prod_ids["PROD-003"], "Teclado Mecánico Logitech", 3, 320000), (prod_ids["PROD-004"], "Mouse Inalámbrico Dell", 3, 149000)],
                    [(prod_ids["PROD-005"], "Silla Ergonómica Oficina", 1, 1200000)],
                ]
                for prod_id, desc, qty, price in items_data[i]:
                    item_total = qty * price
                    item_tax = round(item_total * 0.19)
                    item = InvoiceItem(invoice_id=inv.id, product_id=prod_id, description=desc, quantity=float(qty), unit_price=float(price), tax_percentage=19.0, tax_amount=float(item_tax), total=float(item_total))
                    db.add(item)
            await db.flush()
            print(f"✓ Facturas: 4 creadas con items")

        # 8. Asientos contables
        r = await db.execute(select(func.count(AccountingEntry.id)).where(AccountingEntry.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Asientos contables ya existen, se omite")
        else:
            entries_data = [
                ("C-001", "Apertura", date(2026, 1, 1), "Apertura del ejercicio contable 2026", [
                    (cuentas["1105"], "DEBITO", 15000000, 0),
                    (cuentas["1110"], "DEBITO", 50000000, 0),
                    (cuentas["3105"], "CREDITO", 0, 65000000),
                ]),
                ("C-002", "Ingreso", date(2026, 6, 1), "Venta de contado según factura FE-0001", [
                    (cuentas["1105"], "DEBITO", 5712000, 0),
                    (cuentas["4105"], "CREDITO", 0, 4800000),
                    (cuentas["2367"], "CREDITO", 0, 912000),
                ]),
                ("C-003", "Gasto", date(2026, 6, 5), "Pago de nómina mes de mayo", [
                    (cuentas["5105"], "DEBITO", 17200000, 0),
                    (cuentas["2505"], "CREDITO", 0, 17200000),
                ]),
                ("C-004", "Egreso", date(2026, 6, 10), "Compra de mercancía para inventario", [
                    (cuentas["1405"], "DEBITO", 8500000, 0),
                    (cuentas["2367"], "DEBITO", 1615000, 0),
                    (cuentas["2205"], "CREDITO", 0, 10115000),
                ]),
            ]
            user_r = await db.execute(select(User).where(User.username == "admin"))
            admin = user_r.scalars().first()
            for entry_num, etype, edate, desc, details in entries_data:
                entry = AccountingEntry(company_id=cid, entry_number=entry_num, entry_type=etype, date=edate, description=desc, created_by=admin.id)
                db.add(entry)
                await db.flush()
                for acc_id, nature, debit, credit in details:
                    detail = AccountingEntryDetail(entry_id=entry.id, account_id=acc_id, nature=nature, debit=float(debit), credit=float(credit))
                    db.add(detail)
            await db.flush()
            print("✓ Asientos contables: 4 creados con detalles")

        # 9. Cuentas bancarias
        r = await db.execute(select(func.count(BankAccount.id)).where(BankAccount.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Cuentas bancarias ya existen, se omite")
            ba_ids = {}
            r2 = await db.execute(select(BankAccount).where(BankAccount.company_id == cid))
            for ba in r2.scalars():
                ba_ids[f"{ba.bank_name}_{ba.account_number}"] = ba.id
        else:
            ba_ids = {}
            banks_data = [
                ("Bancolombia", "Corriente", "123456789", "Cta Corriente Bancolombia", 35000000),
                ("Davivienda", "Ahorros", "987654321", "Cta Ahorros Davivienda", 50000000),
            ]
            for bank_name, acct_type, acct_num, acct_name, balance in banks_data:
                ba = BankAccount(company_id=cid, bank_name=bank_name, account_type=acct_type, account_number=acct_num, account_name=acct_name, opening_balance=float(balance), current_balance=float(balance))
                db.add(ba)
                await db.flush()
                ba_ids[f"{bank_name}_{acct_num}"] = ba.id
            await db.flush()
            print("✓ Cuentas bancarias: 2 creadas")

            # Transacciones bancarias
            ba1 = list(ba_ids.values())[0]
            trans_data = [
                (date(2026, 6, 3), "Transferencia cliente La 14", 5712000, "INGRESO", "Pago factura FE-0001"),
                (date(2026, 6, 5), "Retiro pago nómina", -17200000, "EGRESO", "Nómina mayo"),
                (date(2026, 6, 8), "Transferencia cliente XYZ", 3808000, "INGRESO", "Pago factura FE-0002"),
            ]
            for tdate, desc, amt, ttype, ref in trans_data:
                bt = BankTransaction(company_id=cid, bank_account_id=ba1, transaction_date=tdate, description=desc, amount=float(amt), transaction_type=ttype, reference=ref)
                db.add(bt)
            await db.flush()
            print("  ✓ Transacciones bancarias: 3 creadas")

        # 10. Período de nómina y liquidación
        r = await db.execute(select(func.count(PayrollPeriod.id)).where(PayrollPeriod.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Períodos de nómina ya existen, se omite")
        else:
            period = PayrollPeriod(company_id=cid, year=2026, month=5, period_type="Mensual", start_date=date(2026, 5, 1), end_date=date(2026, 5, 31), payment_date=date(2026, 6, 5), is_closed=True)
            db.add(period)
            await db.flush()

            emp_list = list(emp_ids.values())
            for eid in emp_list:
                emp_r = await db.get(Employee, eid)
                salary = emp_r.salary
                gross = salary
                health = round(salary * 0.04)
                pension = round(salary * 0.04)
                net = gross - health - pension
                sev = round(salary / 12)
                sev_int = round(sev * 0.12)
                prima = round(salary / 12)
                vac = round(salary / 24)
                emp_health = round(salary * 0.085)
                emp_pension = round(salary * 0.12)
                arl = round(salary * 0.00522)
                ccf_val = round(salary * 0.04)
                sena = round(salary * 0.02)
                icbf = round(salary * 0.03)
                total_paraf = emp_health + emp_pension + arl + ccf_val + sena + icbf

                ps = PayrollSettlement(company_id=cid, employee_id=eid, period_id=period.id, base_salary=salary, worked_days=30, gross_salary=float(gross), health_deduction=float(health), pension_deduction=float(pension), total_deductions=float(health + pension), net_payment=float(net), severance=float(sev), severance_interest=float(sev_int), prima=float(prima), vacation=float(vac), employer_health=float(emp_health), employer_pension=float(emp_pension), arl=float(arl), ccf=float(ccf_val), sena=float(sena), icbf=float(icbf), total_parafiscal=float(total_paraf), status="Paid")
                db.add(ps)
            await db.flush()
            print("✓ Nómina: 1 período y 4 liquidaciones creadas")

        # 11. Presupuesto
        r = await db.execute(select(func.count(Budget.id)).where(Budget.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Presupuestos ya existen, se omite")
        else:
            budgets_data = [
                (cuentas["4105"], 480000000, 420000000, "Ingresos operacionales anuales"),
                (cuentas["5105"], 96000000, 88000000, "Gastos de personal anuales"),
                (cuentas["5120"], 24000000, 24000000, "Arrendamientos anuales"),
            ]
            for acc_id, budgeted, actual, _ in budgets_data:
                b = Budget(company_id=cid, account_id=acc_id, year=2026, budgeted_amount=float(budgeted), actual_amount=float(actual))
                db.add(b)
            await db.flush()
            print("✓ Presupuestos: 3 creados")

        # 12. Indicadores financieros
        r = await db.execute(select(func.count(FinancialIndicator.id)).where(FinancialIndicator.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Indicadores ya existen, se omite")
        else:
            indicators = [
                ("LIQUIDEZ", "Razón Corriente", 2.5, 2.3, 8.7, "La liquidez de la empresa es saludable"),
                ("ENDEUDAMIENTO", "Nivel de Endeudamiento", 35.0, 38.0, -7.9, "El nivel de endeudamiento es manejable"),
                ("RENTABILIDAD", "Margen Neto", 15.2, 12.8, 18.75, "La rentabilidad ha mejorado respecto al período anterior"),
            ]
            for itype, iname, val, prev, var, interp in indicators:
                fi = FinancialIndicator(company_id=cid, period_year=2026, indicator_type=itype, indicator_name=iname, value=val, previous_value=prev, variation=var, interpretation=interp)
                db.add(fi)
            await db.flush()
            print("✓ Indicadores financieros: 3 creados")

        # 13. Proyección flujo de caja
        r = await db.execute(select(func.count(CashFlowProjection.id)).where(CashFlowProjection.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Proyecciones flujo ya existen, se omite")
        else:
            for m in range(1, 7):
                proj = CashFlowProjection(company_id=cid, projection_date=date(2026, m, 1), projected_income=80000000.0, projected_expenses=55000000.0, projected_balance=25000000.0, actual_income=float(75000000 + m * 2000000), actual_expenses=float(52000000 + m * 500000), actual_balance=float(23000000 + m * 1500000), confidence_level=0.85)
                db.add(proj)
            await db.flush()
            print("✓ Proyecciones flujo de caja: 6 meses creados")

        # 14. Nota crédito
        r = await db.execute(select(func.count(CreditNote.id)).where(CreditNote.company_id == cid))
        if r.scalar() > 0:
            print("⚠ Notas crédito ya existen, se omite")
        else:
            inv_r = await db.execute(select(Invoice).where(Invoice.company_id == cid).limit(1))
            inv = inv_r.scalars().first()
            if inv:
                cn = CreditNote(company_id=cid, invoice_id=inv.id, note_number="NC-0001", reason="Devolución parcial de mercancía", total=320000.0)
                db.add(cn)
                await db.flush()
                print("✓ Nota crédito: 1 creada")

        await db.commit()
        print("\n✅ DATOS DE PRUEBA COMPLETADOS EXITOSAMENTE")
        print("   Todos los módulos tienen datos para validar.")


if __name__ == "__main__":
    use_sqlite = os.getenv("USE_SQLITE", "false").lower() == "true"
    if sys.platform == "win32" and not use_sqlite:
        import selectors
        loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(seed())
        finally:
            loop.close()
    else:
        asyncio.run(seed())
