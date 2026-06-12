type SentryLevel = "error" | "warning" | "info";

interface CaptureContext {
  level?: SentryLevel;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

async function ensureSentry() {
  if (!SENTRY_DSN) return null;
  try {
    const Sentry = await import("@sentry/nextjs");
    return Sentry;
  } catch {
    return null;
  }
}

export async function captureException(
  error: Error,
  context?: CaptureContext
): Promise<void> {
  const Sentry = await ensureSentry();
  if (!Sentry) {
    console.error("[Sentry mock]", error.message, context);
    return;
  }
  Sentry.captureException(error, { level: context?.level, extra: context?.extra, tags: context?.tags });
}

export async function captureMessage(
  message: string,
  context?: CaptureContext
): Promise<void> {
  const Sentry = await ensureSentry();
  if (!Sentry) {
    console.info("[Sentry mock]", message, context);
    return;
  }
  Sentry.captureMessage(message, context?.level);
}

export async function setUser(userId: string, email?: string): Promise<void> {
  const Sentry = await ensureSentry();
  if (Sentry) {
    Sentry.setUser({ id: userId, email });
  }
}
