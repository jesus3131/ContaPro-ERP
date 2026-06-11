"""Tests for financial indicators endpoint."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_financial_indicators(client: AsyncClient):
    r = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    token = r.json()["access_token"]
    r = await client.get("/api/v1/auth/companies", headers={"Authorization": f"Bearer {token}"})
    cid = r.json()[0]["id"]

    r = await client.get(
        "/api/v1/financial/indicators?year=2026",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    data = r.json()
    assert "liquidity" in data
    assert "debt_ratio" in data
    assert "roe" in data
    assert data["total_assets"] == 0.0


@pytest.mark.asyncio
async def test_financial_indicators_with_month(client: AsyncClient):
    r = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    token = r.json()["access_token"]
    r = await client.get("/api/v1/auth/companies", headers={"Authorization": f"Bearer {token}"})
    cid = r.json()[0]["id"]

    r = await client.get(
        "/api/v1/financial/indicators?year=2026&month=6",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["period"]["month"] == 6


@pytest.mark.asyncio
async def test_cash_flow(client: AsyncClient):
    r = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    token = r.json()["access_token"]
    r = await client.get("/api/v1/auth/companies", headers={"Authorization": f"Bearer {token}"})
    cid = r.json()[0]["id"]

    r = await client.get(
        "/api/v1/financial/cash-flow?start_date=2026-01-01&end_date=2026-06-30",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    data = r.json()
    assert "net_cash_flow" in data
    assert "total_inflow" in data
    assert "total_outflow" in data


@pytest.mark.asyncio
async def test_budgets(client: AsyncClient):
    r = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    token = r.json()["access_token"]
    r = await client.get("/api/v1/auth/companies", headers={"Authorization": f"Bearer {token}"})
    cid = r.json()[0]["id"]

    r = await client.get(
        "/api/v1/financial/budgets?year=2026",
        headers={"Authorization": f"Bearer {token}", "X-Company-ID": str(cid)},
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)
