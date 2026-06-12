-- Composite indexes for multi-tenant queries
-- Run after tables are created. All major queries filter by company_id first.

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients (company_id, document_number, business_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_company ON suppliers (company_id, document_number, business_name);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees (company_id, document_number, email);
CREATE INDEX IF NOT EXISTS idx_products_company ON products (company_id, code, name, category);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_company ON inventory_movements (company_id, product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_kardex_company ON kardex (company_id, product_id, date);
CREATE INDEX IF NOT EXISTS idx_accounts_company ON accounts (company_id, code, account_type);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_company ON accounting_entries (company_id, date, entry_type);
CREATE INDEX IF NOT EXISTS idx_accounting_entry_details_entry ON accounting_entry_details (entry_id, account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices (company_id, issue_date, status, client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id, product_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice ON credit_notes (invoice_id, company_id);
CREATE INDEX IF NOT EXISTS idx_debit_notes_invoice ON debit_notes (invoice_id, company_id);
CREATE INDEX IF NOT EXISTS idx_budgets_company ON budgets (company_id, year, month);
CREATE INDEX IF NOT EXISTS idx_cash_flow_company ON cash_flow_projections (company_id, projection_date);
CREATE INDEX IF NOT EXISTS idx_financial_indicators_company ON financial_indicators (company_id, period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company ON bank_accounts (company_id, account_number);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON bank_transactions (bank_account_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_company ON payroll_periods (company_id, year, month);
CREATE INDEX IF NOT EXISTS idx_payroll_settlements_period ON payroll_settlements (period_id, employee_id, company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_user ON user_companies (user_id, company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs (company_id, created_at);
