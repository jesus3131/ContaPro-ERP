"""
Apply RLS policies and composite indexes to Supabase PostgreSQL.
Uses sync psycopg to avoid Windows event loop issues.

Usage from backend/ directory:
    python scripts/apply_migrations.py
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["USE_SQLITE"] = "false"

from app.core.config import settings


def main():
    print("=" * 60)
    print("ContaPro ERP — Database Migrations")
    print("=" * 60)

    url = settings.sqlalchemy_database_url
    print(f"Database: {url[:50]}...")

    import psycopg

    conn = psycopg.connect(url)
    conn.autocommit = False

    base = Path(__file__).parent.parent / "app" / "db"

    for name in ["rls_policies.sql", "composite_indexes.sql"]:
        filepath = base / name
        if not filepath.exists():
            print(f"  SKIP {name}: file not found")
            continue

        sql = filepath.read_text(encoding="utf-8")
        if not sql.strip():
            print(f"  SKIP {name}: empty")
            continue

        print(f"  Applying {name}...")
        try:
            conn.execute(sql)
            conn.commit()
            print(f"  OK {name}")
        except Exception as e:
            conn.rollback()
            print(f"  ERROR {name}: {e}")

    conn.close()
    print("=" * 60)
    print("Migrations complete.")


if __name__ == "__main__":
    main()
