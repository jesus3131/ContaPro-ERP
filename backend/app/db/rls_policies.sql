-- RLS Policies for ContaPro ERP Colombia
-- Run this file in the Supabase SQL Editor after tables are created.
-- Requires: ALTER TABLE ... ENABLE ROW LEVEL SECURITY on each tenant-isolated table.

-- Enable RLS on all tenant-scoped tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE kardex ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entry_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settlements ENABLE ROW LEVEL SECURITY;

-- Helper: extract company_id from app.current_company_id set by backend
CREATE OR REPLACE FUNCTION app_current_company_id() RETURNS INTEGER AS $$
  SELECT nullif(current_setting('app.current_company_id', true), '')::INTEGER;
$$ LANGUAGE SQL STABLE;

-- Helper: extract user_id from app.current_user_id set by backend
CREATE OR REPLACE FUNCTION app_current_user_id() RETURNS INTEGER AS $$
  SELECT nullif(current_setting('app.current_user_id', true), '')::INTEGER;
$$ LANGUAGE SQL STABLE;

-- Helper: check if the current role has access
CREATE OR REPLACE FUNCTION app_current_is_superuser() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = app_current_user_id() AND is_superuser = TRUE
  );
$$ LANGUAGE SQL STABLE;

-- Generic policy: user can access rows that belong to their current company
-- (Super admin sees all)

-- companies: only super admin can see all companies; regular users see their own
CREATE POLICY companies_select ON companies FOR SELECT USING (
  app_current_is_superuser() OR
  id IN (SELECT company_id FROM user_companies WHERE user_id = app_current_user_id())
);
CREATE POLICY companies_insert ON companies FOR INSERT WITH CHECK (
  app_current_is_superuser()
);
CREATE POLICY companies_update ON companies FOR UPDATE USING (
  app_current_is_superuser()
) WITH CHECK (app_current_is_superuser());
CREATE POLICY companies_delete ON companies FOR DELETE USING (
  app_current_is_superuser()
);

-- users: only super admin can see all users; regular users see themselves
CREATE POLICY users_select ON users FOR SELECT USING (
  app_current_is_superuser() OR id = app_current_user_id()
);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (TRUE);
CREATE POLICY users_update ON users FOR UPDATE USING (
  app_current_is_superuser() OR id = app_current_user_id()
);
CREATE POLICY users_delete ON users FOR DELETE USING (
  app_current_is_superuser()
);

-- user_companies: only super admin or the owning user
CREATE POLICY user_companies_select ON user_companies FOR SELECT USING (
  app_current_is_superuser() OR user_id = app_current_user_id()
);
CREATE POLICY user_companies_insert ON user_companies FOR INSERT WITH CHECK (
  app_current_is_superuser() OR user_id = app_current_user_id()
);
CREATE POLICY user_companies_update ON user_companies FOR UPDATE USING (
  app_current_is_superuser() OR user_id = app_current_user_id()
);
CREATE POLICY user_companies_delete ON user_companies FOR DELETE USING (
  app_current_is_superuser() OR user_id = app_current_user_id()
);

-- Generic policy template for all tenant-scoped tables:
--   FOR ALL USING (company_id = app_current_company_id() OR app_current_is_superuser())

-- Tables with direct company_id column
DO $$
DECLARE
  tables_list TEXT[] := ARRAY[
    'audit_logs', 'clients', 'suppliers', 'employees',
    'products', 'inventory_movements', 'kardex',
    'invoices', 'credit_notes', 'debit_notes',
    'accounts', 'accounting_entries', 'closings',
    'budgets', 'cash_flow_projections', 'financial_indicators',
    'bank_accounts',
    'payroll_periods', 'payroll_settlements'
  ];
  t TEXT;
  policy_name TEXT;
BEGIN
  FOREACH t IN ARRAY tables_list LOOP
    FOR policy_name IN (
      SELECT policyname FROM pg_policies WHERE tablename = t AND schemaname = 'public'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT USING (company_id = app_current_company_id() OR app_current_is_superuser())',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (company_id = app_current_company_id() OR app_current_is_superuser())',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON %I FOR UPDATE USING (company_id = app_current_company_id() OR app_current_is_superuser()) WITH CHECK (company_id = app_current_company_id() OR app_current_is_superuser())',
      t, t
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON %I FOR DELETE USING (company_id = app_current_company_id() OR app_current_is_superuser())',
      t, t
    );
  END LOOP;
END;
$$;

-- invoice_items: no direct company_id, join through invoices
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoice_items_select ON invoice_items;
DROP POLICY IF EXISTS invoice_items_insert ON invoice_items;
DROP POLICY IF EXISTS invoice_items_update ON invoice_items;
DROP POLICY IF EXISTS invoice_items_delete ON invoice_items;
CREATE POLICY invoice_items_select ON invoice_items FOR SELECT USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.company_id = app_current_company_id()
  )
);
CREATE POLICY invoice_items_insert ON invoice_items FOR INSERT WITH CHECK (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.company_id = app_current_company_id()
  )
);
CREATE POLICY invoice_items_update ON invoice_items FOR UPDATE USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.company_id = app_current_company_id()
  )
);
CREATE POLICY invoice_items_delete ON invoice_items FOR DELETE USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.company_id = app_current_company_id()
  )
);

-- accounting_entry_details: no direct company_id, join through accounting_entries
ALTER TABLE accounting_entry_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS accounting_entry_details_select ON accounting_entry_details;
DROP POLICY IF EXISTS accounting_entry_details_insert ON accounting_entry_details;
DROP POLICY IF EXISTS accounting_entry_details_update ON accounting_entry_details;
DROP POLICY IF EXISTS accounting_entry_details_delete ON accounting_entry_details;
CREATE POLICY accounting_entry_details_select ON accounting_entry_details FOR SELECT USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM accounting_entries WHERE accounting_entries.id = accounting_entry_details.entry_id AND accounting_entries.company_id = app_current_company_id()
  )
);
CREATE POLICY accounting_entry_details_insert ON accounting_entry_details FOR INSERT WITH CHECK (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM accounting_entries WHERE accounting_entries.id = accounting_entry_details.entry_id AND accounting_entries.company_id = app_current_company_id()
  )
);
CREATE POLICY accounting_entry_details_update ON accounting_entry_details FOR UPDATE USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM accounting_entries WHERE accounting_entries.id = accounting_entry_details.entry_id AND accounting_entries.company_id = app_current_company_id()
  )
);
CREATE POLICY accounting_entry_details_delete ON accounting_entry_details FOR DELETE USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM accounting_entries WHERE accounting_entries.id = accounting_entry_details.entry_id AND accounting_entries.company_id = app_current_company_id()
  )
);

-- bank_transactions: no direct company_id, join through bank_accounts
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bank_transactions_select ON bank_transactions;
DROP POLICY IF EXISTS bank_transactions_insert ON bank_transactions;
DROP POLICY IF EXISTS bank_transactions_update ON bank_transactions;
DROP POLICY IF EXISTS bank_transactions_delete ON bank_transactions;
CREATE POLICY bank_transactions_select ON bank_transactions FOR SELECT USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM bank_accounts WHERE bank_accounts.id = bank_transactions.bank_account_id AND bank_accounts.company_id = app_current_company_id()
  )
);
CREATE POLICY bank_transactions_insert ON bank_transactions FOR INSERT WITH CHECK (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM bank_accounts WHERE bank_accounts.id = bank_transactions.bank_account_id AND bank_accounts.company_id = app_current_company_id()
  )
);
CREATE POLICY bank_transactions_update ON bank_transactions FOR UPDATE USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM bank_accounts WHERE bank_accounts.id = bank_transactions.bank_account_id AND bank_accounts.company_id = app_current_company_id()
  )
);
CREATE POLICY bank_transactions_delete ON bank_transactions FOR DELETE USING (
  app_current_is_superuser() OR EXISTS (
    SELECT 1 FROM bank_accounts WHERE bank_accounts.id = bank_transactions.bank_account_id AND bank_accounts.company_id = app_current_company_id()
  )
);
