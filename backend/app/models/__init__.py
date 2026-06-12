# Modelo: Inicializador de modelos
# Propósito: Centraliza la importación de todos los modelos SQLAlchemy para facilitar su uso en la aplicación
# Tablas principales: Ninguna (solo reexporta modelos)
from app.models.accounting import (Account, AccountingEntry,
                                   AccountingEntryDetail, Closing)
from app.models.banking import BankAccount, BankTransaction
from app.models.clients import Client, Employee, Supplier
from app.models.financial import Budget, CashFlowProjection, FinancialIndicator
from app.models.inventory import InventoryMovement, Kardex, Product
from app.models.invoicing import CreditNote, DebitNote, Invoice, InvoiceItem
from app.models.payroll import PayrollPeriod, PayrollSettlement
from app.models.user import AuditLog, Company, User, UserCompany
