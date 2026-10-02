import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  buildPalletsWorkbook,
  type ExportLabel,
  type ExportPallet,
} from "@/lib/pallets-export";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 1000;

// Supabase caps a single response at 1000 rows, so pull every page.
async function fetchAll<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "supervisor")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const supabase = await createClient();

  let pallets: ExportPallet[];
  let labels: ExportLabel[];
  try {
    pallets = await fetchAll<ExportPallet>((from, to) =>
      supabase
        .from("pallets")
        .select("id, pallet_number, status, opened_at, closed_at, profiles(username)")
        .order("pallet_number", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    );
    labels = await fetchAll<ExportLabel>((from, to) =>
      supabase
        .from("pallet_labels")
        .select("pallet_id, ean13, scanned_at")
        .order("scanned_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al consultar los datos" },
      { status: 500 }
    );
  }

  const buffer = await buildPalletsWorkbook(pallets, labels);

  const stamp = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pallets-ingresados-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
