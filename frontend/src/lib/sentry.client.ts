export function initSentry() {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    // Sentry will be auto-initialized by @sentry/nextjs if configured
    console.info("Sentry DSN configured:", process.env.NEXT_PUBLIC_SENTRY_DSN?.slice(0, 20) + "...");
  }
}
