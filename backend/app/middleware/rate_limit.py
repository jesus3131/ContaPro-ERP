import os
import time
from collections import defaultdict

from fastapi import HTTPException, status

_login_attempts: dict[str, list[float]] = defaultdict(list)
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 300


def check_rate_limit(key: str, endpoint: str = "login"):
    if os.getenv("USE_SQLITE", "false").lower() == "true":
        return
    now = time.time()
    window = WINDOW_SECONDS
    if endpoint == "login":
        attempts = _login_attempts[key]
        attempts[:] = [t for t in attempts if now - t < window]

        if len(attempts) >= MAX_ATTEMPTS:
            retry_after = int(window - (now - attempts[0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Demasiados intentos. Intente de nuevo en {retry_after} segundos.",
                headers={"Retry-After": str(retry_after)},
            )
        attempts.append(now)
