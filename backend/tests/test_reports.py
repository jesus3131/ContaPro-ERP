"""Tests for report generation endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def _login_and_cid(client: AsyncClient) -> tuple[str, int]:
    r = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    token = r.json()["access_token"]
    r = await client.get("/api/v1/auth/companies", headers={"Authorization": f"Bearer {token}"})
    cid = r.json()[0]["id"]
    return token, cid


@pytest.mark.asyncio
async def test_balance_sheet_json(client: AsyncClient):
    token, cid = await _login_and_cid(client)
    r = await client.get(
        "/api/v1/reports/balance-sheet?end_date=2026-06-30&format=json",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_income_statement_json(client: AsyncClient):
    token, cid = await _login_and_cid(client)
    r = await client.get(
        "/api/v1/reports/income-statement?start_date=2026-01-01&end_date=2026-06-30&format=json",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_trial_balance_json(client: AsyncClient):
    token, cid = await _login_and_cid(client)
    r = await client.get(
        "/api/v1/reports/trial-balance?end_date=2026-06-30&format=json",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_tax_report_json(client: AsyncClient):
    token, cid = await _login_and_cid(client)
    r = await client.get(
        "/api/v1/reports/tax-report?start_date=2026-01-01&end_date=2026-06-30&format=json",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_accounts_receivable_json(client: AsyncClient):
    token, cid = await _login_and_cid(client)
    r = await client.get(
        "/api/v1/reports/accounts-receivable?format=json",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_inventory_report_json(client: AsyncClient):
    token, cid = await _login_and_cid(client)
    r = await client.get(
        "/api/v1/reports/inventory-report?format=json",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_payroll_report_json(client: AsyncClient):
    token, cid = await _login_and_cid(client)
    r = await client.get(
        "/api/v1/reports/payroll-report?format=json",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)
