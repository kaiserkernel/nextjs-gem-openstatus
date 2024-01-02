import { headers } from "next/headers";
import { getTimezoneOffset } from "date-fns-tz";

export function getRequestHeaderTimezone() {
  const headersList = headers();

  /**
   * Vercel includes ip timezone to request header
   */
  const requestTimezone = headersList.get("x-vercel-ip-timezone");

  return requestTimezone;
}

export function convertTimezoneToGMT(timezone?: string) {
  const requestTimezone = getRequestHeaderTimezone();

  /**
   * Server region timezone as fallback
   */
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const msOffset = getTimezoneOffset(
    timezone || requestTimezone || clientTimezone,
  );

  if (isNaN(msOffset)) return "Etc/UTC";

  const hrOffset = msOffset / (1000 * 60 * 60);
  const offset = hrOffset >= 0 ? `-${hrOffset}` : `+${Math.abs(hrOffset)}`;

  return `Etc/GMT${offset}` as const;
}

/**
 * All supported browser / node timezones
 */
export const supportedTimezones = Intl.supportedValuesOf("timeZone");
