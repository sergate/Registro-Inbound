import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { usernameToEmail } from "@/lib/constants";
import type { UserRole } from "@/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.active || profile.role !== "admin") return null;

  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, role, active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const username: string = (body.username ?? "").trim().toLowerCase();
  const password: string = body.password ?? "";
  const role: UserRole = body.role ?? "operario";

  if (!username || !/^[a-z0-9._-]{3,32}$/.test(username)) {
    return NextResponse.json(
      { error: "Usuario inválido (3-32 caracteres, minúsculas/números/._-)" },
      { status: 400 }
    );
  }

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  if (!["admin", "supervisor", "operario"].includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email: usernameToEmail(username),
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    const message =
      createError?.code === "email_exists"
        ? "Ese usuario ya existe"
        : createError?.message ?? "No se pudo crear el usuario";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: created.user.id,
    username,
    role,
    active: true,
  });

  if (profileError) {
    // roll back the auth user so we don't leave an orphaned account
    await adminClient.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
