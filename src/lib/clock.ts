import "server-only";
import { cookies } from "next/headers";

/** Cookie the E2E tests use to pin "now" (only honoured when ENABLE_TEST_CLOCK=1). */
export const TEST_CLOCK_COOKIE = "qz-test-now";

/**
 * The server's idea of "now" for delivery rules. Always the real time,
 * except in E2E builds that set ENABLE_TEST_CLOCK=1, where a cookie can pin
 * it to test the same-day cut-off. Vercel never sets that variable.
 */
export async function getNow(): Promise<Date> {
  if (process.env.ENABLE_TEST_CLOCK === "1") {
    const value = (await cookies()).get(TEST_CLOCK_COOKIE)?.value;
    const pinned = value ? new Date(value) : null;
    if (pinned && !Number.isNaN(pinned.getTime())) return pinned;
  }
  return new Date();
}
