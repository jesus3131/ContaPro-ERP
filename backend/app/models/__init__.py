# Modelo: Inicializador de modelos
# Propósito: Centraliza la importación de todos los modelos SQLAlchemy para facilitar su uso en la aplicación
# Tablas principales: Ninguna (solo reexporta modelos)
from app.models.user import User, Company, UserCompany, AuditLog
from app.models.accounting import Account, AccountingEntry, AccountingEntryDetail, Closing
from app.models.clients import Client, Supplier, Employee
from app.models.invoicing import Invoice, InvoiceItem, CreditNote, DebitNote
from app.models.inventory import Product, InventoryMovement, Kardex
from app.models.payroll import PayrollPeriod, PayrollSettlement
from app.models.financial import Budget, CashFlowProjection, FinancialIndicator
from app.models.banking import BankAccount, BankTransaction