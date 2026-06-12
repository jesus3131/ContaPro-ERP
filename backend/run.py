# run.py
# Propósito: Script de arranque para Windows (SelectorEventLoop solo para PostgreSQL)
import os
import sys
import asyncio
import selectors

use_sqlite = os.getenv("USE_SQLITE", "false").lower() == "true"

# psycopg async requires SelectorEventLoop on Windows; aiosqlite works with ProactorEventLoop
# Python 3.14+: WindowsSelectorEventLoopPolicy deprecated, use SelectorEventLoop directly
from uvicorn import Config, Server

if __name__ == "__main__":
    config = Config("app.main:app", host="0.0.0.0", port=8000, loop="asyncio", reload=False)
    server = Server(config=config)
    if sys.platform == "win32" and not use_sqlite:
        loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(server.serve())
        finally:
            loop.close()
    else:
        asyncio.run(server.serve())
