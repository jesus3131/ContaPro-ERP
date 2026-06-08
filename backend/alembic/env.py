from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.db.database import Base
from app.models.user import User, Company, UserCompany, AuditLog
from app.models.accounting import Account, AccountingEntry, AccountingEntryDetail, Closing
from app.models.financial import Budget, CashFlowProjection, FinancialIndicator
from app.models.clients import Client, Supplier, Employee
from app.models.invoicing import Invoice, InvoiceItem, CreditNote, DebitNote
from app.models.inventory import Product, InventoryMovement, Kardex
from app.models.payroll import PayrollPeriod, PayrollSettlement
from app.models.banking import BankAccount, BankTransaction
from app.core.config import settings

config = context.config
config.set_main_option("sqlalchemy.url", settings.sqlalchemy_database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
