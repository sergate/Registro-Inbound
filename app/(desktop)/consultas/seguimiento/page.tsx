import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/datetime";
import Pager from "@/components/Pager";
import { firstParam, pageRange, parsePage } from "@/lib/pagination";

type Estado = "todas" | "stock" | "despachadas";

interface RawLabel {
  ean13: string;
  scanned_at: string;
  pallets: {
    pallet_number: number;
    status: "open" | "closed";
    closed_at: string | null;
    profiles: { username: string } | null;
  } | null;
  despacho_etiquetas: {
    scanned_at: string;
    despachos: {
      numero: number;
      closed_at: string | null;
      profiles: { username: string } | null;
    } | null;
  } | null;
}

function parseEstado(value: string): Estado {
  return value === "stock" || value === "despachadas" ? value : "todas";
}

export default async function SeguimientoReportPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; estado?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const estado = parseEstado(firstParam(params.estado));
  const q = firstParam(params.q).trim();
  const { from, to } = pageRange(page);

  const supabase = await createClient();

  // "!inner" deja solo las etiquetas que tienen salida; el filtro "is null"
  // sobre la relacion deja solo las que siguen en stock.
  const salida = `despacho_etiquetas${estado === "despachadas" ? "!inner" : ""}(scanned_at, despachos(numero, closed_at, profiles(username)))`;
  let query = supabase
    .from("pallet_labels")
    .select(
      `ean13, scanned_at, pallets(pallet_number, status, closed_at, profiles(username)), ${salida}`,
      { count: "exact" }
    );
  if (estado === "stock") query = query.filter("despacho_etiquetas", "is", null);
  if (q) query = query.ilike("ean13", `%${q}%`);

  const [{ data, error, count }, ingresadas, despachadas] = await Promise.all([
    query.order("scanned_at", { ascending: false }).range(from, to),
    supabase.from("pallet_labels").select("id", { count: "exact", head: true }),
    supabase.from("despacho_etiquetas").select("id", { count: "exact", head: true }),
  ]);

  const labels = (data as unknown as RawLabel[]) ?? [];
  const totalIngresadas = ingresadas.count ?? 0;
  const totalDespachadas = despachadas.count ?? 0;

  const pagerParams: Record<string, string> = {
    estado: estado === "todas" ? "" : estado,
    q,
  };

  function filterHref(target: Estado) {
    const query = new URLSearchParams();
    if (target !== "todas") query.set("estado", target);
    if (q) query.set("q", q);
    const qs = query.toString();
    return qs ? `/consultas/seguimiento?${qs}` : "/consultas/seguimiento";
  }

  const tabs: { key: Estado; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "stock", label: "En stock" },
    { key: "despachadas", label: "Despachadas" },
  ];

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
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Seguimiento de bultos</h1>
        <a href="/api/consultas/export" download style={styles.excel}>
          Descargar Excel
        </a>
      </div>

      <div style={styles.kpis}>
        <div style={styles.kpi}>
          <b style={styles.kpiNum}>{totalIngresadas.toLocaleString("es-AR")}</b>
          <span style={styles.kpiLabel}>ingresadas</span>
        </div>
        <div style={styles.kpi}>
          <b style={styles.kpiNum}>{totalDespachadas.toLocaleString("es-AR")}</b>
          <span style={styles.kpiLabel}>despachadas</span>
        </div>
        <div style={styles.kpi}>
          <b style={styles.kpiNum}>
            {Math.max(totalIngresadas - totalDespachadas, 0).toLocaleString("es-AR")}
          </b>
          <span style={styles.kpiLabel}>en stock</span>
        </div>
      </div>

      <div style={styles.filters}>
        <div style={styles.seg}>
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={filterHref(t.key)}
              style={{
                ...styles.segItem,
                ...(estado === t.key ? styles.segItemOn : {}),
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form method="get" style={styles.search}>
          {estado !== "todas" && <input type="hidden" name="estado" value={estado} />}
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Buscar etiqueta…"
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            Buscar
          </button>
        </form>
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error.message}</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.group, borderColor: "var(--accent)" }} colSpan={4}>
                Ingreso
              </th>
              <th style={{ ...styles.group, borderColor: "var(--out)" }} colSpan={4}>
                Salida
              </th>
              <th style={styles.th}></th>
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
              <th style={styles.th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((l) => {
              const out = l.despacho_etiquetas;
              const despacho = out?.despachos ?? null;
              return (
                <tr key={l.ean13}>
                  <td style={{ ...styles.td, fontFamily: "monospace" }}>{l.ean13}</td>
                  <td style={styles.td}>{l.pallets?.pallet_number ?? "-"}</td>
                  <td style={styles.td}>{l.pallets?.profiles?.username ?? "-"}</td>
                  <td style={styles.td}>
                    {l.pallets?.status === "open"
                      ? "Abierto"
                      : formatDateTime(l.pallets?.closed_at)}
                  </td>
                  <td style={styles.td}>{despacho ? despacho.numero : "-"}</td>
                  <td style={styles.td}>{despacho?.profiles?.username ?? "-"}</td>
                  <td style={styles.td}>{out ? formatDateTime(out.scanned_at) : "-"}</td>
                  <td style={styles.td}>
                    {despacho
                      ? despacho.closed_at
                        ? formatDateTime(despacho.closed_at)
                        : "Abierto"
                      : "-"}
                  </td>
                  <td style={styles.td}>
                    <span style={out ? styles.chipOut : styles.chipStock}>
                      {out ? "Despachada" : "En stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager basePath="/consultas/seguimiento" page={page} total={count ?? 0} params={pagerParams} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  excel: {
    padding: "0.6rem 1rem",
    borderRadius: 8,
    background: "var(--accent)",
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  kpis: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  kpi: {
    display: "flex",
    flexDirection: "column",
    padding: "0.5rem 0.9rem",
    border: "1px solid var(--border)",
    borderRadius: 8,
    background: "var(--surface)",
  },
  kpiNum: {
    fontSize: "1.2rem",
    fontVariantNumeric: "tabular-nums",
  },
  kpiLabel: {
    fontSize: "0.8rem",
    color: "var(--text-dim)",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  seg: {
    display: "inline-flex",
    border: "1px solid var(--border)",
    borderRadius: 8,
    overflow: "hidden",
  },
  segItem: {
    padding: "0.4rem 0.9rem",
    color: "var(--text-dim)",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  segItemOn: {
    background: "var(--surface-2)",
    color: "var(--text)",
  },
  search: {
    display: "flex",
    gap: "0.5rem",
  },
  searchInput: {
    padding: "0.4rem 0.7rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    minWidth: 200,
  },
  searchButton: {
    padding: "0.4rem 0.9rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 980,
  },
  group: {
    textAlign: "center",
    padding: "0.4rem",
    borderBottom: "2px solid var(--border)",
    fontSize: "0.85rem",
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
    whiteSpace: "nowrap",
  },
  chipOut: {
    padding: "0.1rem 0.6rem",
    borderRadius: 999,
    background: "rgba(20, 184, 166, 0.2)",
    color: "var(--out)",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  chipStock: {
    padding: "0.1rem 0.6rem",
    borderRadius: 999,
    background: "rgba(37, 99, 235, 0.2)",
    color: "#93b4ff",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
};
