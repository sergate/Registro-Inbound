import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import DespachosReportTable from "@/components/DespachosReportTable";
import Pager from "@/components/Pager";
import { pageRange, parsePage } from "@/lib/pagination";

interface RawDespacho {
  id: string;
  numero: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  destino: string | null;
  referencia: string | null;
  profiles: { username: string } | null;
  despacho_etiquetas:
    | { id: string; scanned_at: string; pallet_labels: { ean13: string } | null }[]
    | null;
}

export default async function DespachosReportPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const page = parsePage((await searchParams).page);
  const { from, to } = pageRange(page);

  const { data, error, count } = await supabase
    .from("despachos")
    .select(
      "id, numero, status, opened_at, closed_at, destino, referencia, profiles(username), despacho_etiquetas(id, scanned_at, pallet_labels(ean13))",
      { count: "exact" }
    )
    .order("numero", { ascending: false })
    .range(from, to);

  const despachos = ((data as unknown as RawDespacho[]) ?? []).map((d) => ({
    id: d.id,
    numero: d.numero,
    status: d.status,
    opened_at: d.opened_at,
    closed_at: d.closed_at,
    destino: d.destino,
    referencia: d.referencia,
    operario: d.profiles?.username ?? "-",
    cajas: (d.despacho_etiquetas ?? [])
      .map((e) => ({
        id: e.id,
        ean13: e.pallet_labels?.ean13 ?? "-",
        scanned_at: e.scanned_at,
      }))
      .sort((a, b) => a.scanned_at.localeCompare(b.scanned_at)),
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
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Despachos</h1>
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
      <DespachosReportTable despachos={despachos} isAdmin={profile?.role === "admin"} />
      <Pager basePath="/consultas/despachos" page={page} total={count ?? 0} />
    </main>
  );
}
