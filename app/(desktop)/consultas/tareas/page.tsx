import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import TareasReportTable from "@/components/TareasReportTable";

interface RawPallet {
  id: string;
  pallet_number: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  profiles: { username: string } | null;
  pallet_labels: { id: string; ean13: string; scanned_at: string }[] | null;
}

export default async function TareasReportPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from("pallets")
    .select(
      "id, pallet_number, status, opened_at, closed_at, profiles(username), pallet_labels(id, ean13, scanned_at)"
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Tareas realizadas</h1>
        <a
          href="/api/consultas/export"
          download
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          Descargar Excel
        </a>
      </div>
      {error && <p style={{ color: "var(--danger)" }}>{error.message}</p>}
      <TareasReportTable pallets={pallets} isAdmin={profile?.role === "admin"} />
    </main>
  );
}
