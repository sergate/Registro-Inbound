import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth/requireAdmin";
import type { UserRole } from "@/types/database";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const adminClient = createAdminClient();

  const updates: { role?: UserRole; active?: boolean } = {};
  if (body.role !== undefined) {
    if (!["admin", "supervisor", "operario"].includes(body.role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }
    updates.role = body.role;
  }
  if (body.active !== undefined) {
    updates.active = Boolean(body.active);
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }
    const { error } = await adminClient.auth.admin.updateUserById(id, {
      password: body.password,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      { error: "No podés eliminar tu propio usuario" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json(
      {
        error: `No se pudo eliminar (${error.message}). Si el usuario tiene pallets o etiquetas asociadas, desactivalo en lugar de borrarlo.`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
