# run.py
# Propósito: Script de arranque para Windows (SelectorEventLoop solo para PostgreSQL)
import os
import sys
import asyncio
import selectors

use_sqlite = os.getenv("USE_SQLITE", "false").lower() == "true"

# psycopg async requires SelectorEventLoop on Windows; aiosqlite works with ProactorEventLoop
if sys.platform == "win32" and not use_sqlite:
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from uvicorn import Config, Server

if __name__ == "__main__":
    config = Config("app.main:app", host="0.0.0.0", port=8000, loop="asyncio", reload=False)
    server = Server(config=config)
    if sys.platform == "win32" and not use_sqlite:
        loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
        asyncio.set_event_loop(loop)
        loop.run_until_complete(server.serve())
    else:
        asyncio.run(server.serve())
