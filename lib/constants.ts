export const AUTH_EMAIL_DOMAIN =
  process.env.AUTH_EMAIL_DOMAIN ?? "registro-inbound.local";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

export type UserRole = "admin" | "supervisor" | "operario";
