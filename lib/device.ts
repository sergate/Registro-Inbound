// Deliberately hand-rolled (not next/server's userAgent()/ua-parser-js): that
// helper's compiled dependency crashes Vercel Edge middleware with
// "__dirname is not defined", which is part of why this app has no
// middleware.ts anymore. A small regex is all device-class routing needs.
const MOBILE_UA_PATTERN = /Android|iPhone|iPod|Windows Phone|Mobile/i;

export function isMobileUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return MOBILE_UA_PATTERN.test(userAgent);
}
