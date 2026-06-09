import httpx
import sys

try:
    r = httpx.post(
        "http://localhost:8000/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"},
        timeout=10
    )
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:500]}")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
