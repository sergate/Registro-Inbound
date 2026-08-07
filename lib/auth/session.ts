import { createClient } from "@/lib/supabase/server";
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

export function homeForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "supervisor":
      return "/supervisor";
    case "operario":
    default:
      return "/operario";
  }
}
