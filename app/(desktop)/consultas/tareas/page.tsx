import { createClient } from "@/lib/supabase/server";
import TareasReportTable from "@/components/TareasReportTable";

interface RawPallet {
  id: string;
  pallet_number: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  profiles: { username: string } | null;
  pallet_labels: { ean13: string; scanned_at: string }[] | null;
}

export default async function TareasReportPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pallets")
    .select(
      "id, pallet_number, status, opened_at, closed_at, profiles(username), pallet_labels(ean13, scanned_at)"
    )
    .order("pallet_number", { ascending: false });

  const pallets = ((data as unknown as RawPallet[]) ?? []).map((p) => ({
    id: p.id,
    pallet_number: p.pallet_number,
    status: p.status,
    opened_at: p.opened_at,
    closed_at: p.closed_at,
    operario: p.profiles?.username ?? "-",
    labels: (p.pallet_labels ?? []).slice().sort((a, b) => a.scanned_at.localeCompare(b.scanned_at)),
  }));

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Tareas realizadas
      </h1>
      {error && <p style={{ color: "var(--danger)" }}>{error.message}</p>}
      <TareasReportTable pallets={pallets} />
    </main>
  );
}
