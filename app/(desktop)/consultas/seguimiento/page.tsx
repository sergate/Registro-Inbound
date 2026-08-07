import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/datetime";

interface RawLabel {
  ean13: string;
  scanned_at: string;
  pallets: {
    pallet_number: number;
    opened_at: string;
    closed_at: string | null;
    profiles: { username: string } | null;
  } | null;
}

export default async function SeguimientoReportPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pallet_labels")
    .select(
      "ean13, scanned_at, pallets(pallet_number, opened_at, closed_at, profiles(username))"
    )
    .order("scanned_at", { ascending: false });

  const labels = (data as unknown as RawLabel[]) ?? [];

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Seguimiento de bultos
      </h1>
      {error && <p style={{ color: "var(--danger)" }}>{error.message}</p>}
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th} colSpan={4}>Ingreso</th>
              <th style={styles.th} colSpan={4}>Salida</th>
            </tr>
            <tr>
              <th style={styles.th}>Etiqueta</th>
              <th style={styles.th}>Pallet</th>
              <th style={styles.th}>Operario</th>
              <th style={styles.th}>Cierre pallet</th>
              <th style={styles.th}>Pallet</th>
              <th style={styles.th}>Operario</th>
              <th style={styles.th}>Escaneo</th>
              <th style={styles.th}>Cierre pallet</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((l) => (
              <tr key={l.ean13}>
                <td style={{ ...styles.td, fontFamily: "monospace" }}>{l.ean13}</td>
                <td style={styles.td}>{l.pallets?.pallet_number ?? "-"}</td>
                <td style={styles.td}>{l.pallets?.profiles?.username ?? "-"}</td>
                <td style={styles.td}>{formatDateTime(l.pallets?.closed_at)}</td>
                <td style={styles.tdPending}>Pendiente</td>
                <td style={styles.tdPending}>Pendiente</td>
                <td style={styles.tdPending}>Pendiente</td>
                <td style={styles.tdPending}>Pendiente</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
  },
  th: {
    textAlign: "left",
    padding: "0.5rem",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-dim)",
    fontSize: "0.85rem",
  },
  td: {
    padding: "0.5rem",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.9rem",
  },
  tdPending: {
    padding: "0.5rem",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.9rem",
    color: "var(--text-dim)",
    fontStyle: "italic",
  },
};
