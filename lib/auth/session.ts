import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isMobileUserAgent } from "@/lib/device";
import type { UserRole } from "@/types/database";

export interface CurrentProfile {
  id: string;
  username: string;
  role: UserRole;
  active: boolean;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, role, active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.active) return null;

  return profile;
}

export async function isMobileRequest(): Promise<boolean> {
  const headerList = await headers();
  return isMobileUserAgent(headerList.get("user-agent"));
}

// Mobile handhelds are for operational tasks only, regardless of role.
// Desktop is for follow-up/admin work, restricted to admin/supervisor.
export function resolveHome(role: UserRole, mobile: boolean): string {
  if (mobile) return "/app";
  if (role === "admin") return "/admin";
  if (role === "supervisor") return "/consultas";
  return "/bloqueado";
}
