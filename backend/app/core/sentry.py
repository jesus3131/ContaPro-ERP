import sentry_sdk

from app.core.config import settings


def init_sentry():
    dsn = getattr(settings, "SENTRY_DSN", None)
    if not dsn:
        return

    sentry_sdk.init(
        dsn=dsn,
        environment="production" if not settings.DIAN_TEST_MODE else "development",
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
        send_default_pii=False,
    )
