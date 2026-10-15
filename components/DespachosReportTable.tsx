"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/datetime";

interface Caja {
  id: string;
  ean13: string;
  scanned_at: string;
}

interface DespachoRow {
  id: string;
  numero: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  operario: string;
  destino: string | null;
  referencia: string | null;
  cajas: Caja[];
}

export default function DespachosReportTable({
  despachos,
  isAdmin,
}: {
  despachos: DespachoRow[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function remove(url: string, busyKey: string, confirmText: string) {
    if (!confirm(confirmText)) return;
    setBusyId(busyKey);
    setError(null);
    const res = await fetch(url, { method: "DELETE" });
    const body = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setError(body.error ?? "No se pudo borrar");
      return;
    }
    router.refresh();
  }

  function deleteDespacho(e: React.MouseEvent, id: string, numero: number) {
    e.stopPropagation();
    return remove(
      `/api/admin/despachos/${id}`,
      id,
      `¿Borrar el pallet de salida #${numero}? Sus cajas vuelven a estar en stock. Esta acción no se puede deshacer.`
    );
  }

  function deleteCaja(id: string, ean13: string) {
    return remove(
      `/api/admin/despacho-etiquetas/${id}`,
      id,
      `¿Quitar la caja ${ean13} de este pallet de salida? Vuelve a estar en stock.`
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {error && <p style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>{error}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}></th>
            <th style={styles.th}>Salida #</th>
            <th style={styles.th}>Operario</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Cajas</th>
            <th style={styles.th}>Destino / Ref.</th>
            <th style={styles.th}>Apertura</th>
            <th style={styles.th}>Cierre</th>
            {isAdmin && <th style={styles.th}></th>}
          </tr>
        </thead>
        <tbody>
          {despachos.map((d) => (
            <Fragment key={d.id}>
              <tr onClick={() => toggle(d.id)} style={styles.row}>
                <td style={styles.td}>{expanded.has(d.id) ? "▾" : "▸"}</td>
                <td style={styles.td}>{d.numero}</td>
                <td style={styles.td}>{d.operario}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      color: d.status === "open" ? "var(--accent)" : "var(--text-dim)",
                    }}
                  >
                    {d.status === "open" ? "Abierto" : "Cerrado"}
                  </span>
                </td>
                <td style={styles.td}>{d.cajas.length}</td>
                <td style={styles.td}>
                  {[d.destino, d.referencia].filter(Boolean).join(" · ") || "-"}
                </td>
                <td style={styles.td}>{formatDateTime(d.opened_at)}</td>
                <td style={styles.td}>{formatDateTime(d.closed_at)}</td>
                {isAdmin && (
                  <td style={styles.td}>
                    <button
                      disabled={busyId === d.id}
                      onClick={(e) => deleteDespacho(e, d.id, d.numero)}
                      style={styles.delete}
                    >
                      Borrar
                    </button>
                  </td>
                )}
              </tr>
              {expanded.has(d.id) && (
                <tr>
                  <td style={styles.tdDetail}></td>
                  <td style={styles.tdDetail} colSpan={isAdmin ? 8 : 7}>
                    {d.cajas.length === 0 ? (
                      <span style={{ color: "var(--text-dim)" }}>Sin cajas cargadas.</span>
                    ) : (
                      <ul style={styles.labelList}>
                        {d.cajas.map((c) => (
                          <li key={c.id} style={styles.labelItem}>
                            <span style={{ fontFamily: "monospace" }}>{c.ean13}</span>
                            <span style={{ color: "var(--text-dim)" }}>
                              {formatDateTime(c.scanned_at)}
                            </span>
                            {isAdmin && (
                              <button
                                disabled={busyId === c.id}
                                onClick={() => deleteCaja(c.id, c.ean13)}
                                style={styles.deleteLabel}
                              >
                                Borrar
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 820,
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
  row: {
    cursor: "pointer",
  },
  tdDetail: {
    padding: "0.5rem 0.5rem 0.75rem 2rem",
    background: "var(--surface-2)",
  },
  labelList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  labelItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    maxWidth: 420,
    fontSize: "0.85rem",
  },
  delete: {
    padding: "0.3rem 0.6rem",
    borderRadius: 6,
    border: "1px solid var(--danger)",
    background: "transparent",
    color: "var(--danger)",
    fontSize: "0.8rem",
  },
  deleteLabel: {
    padding: "0.2rem 0.5rem",
    borderRadius: 6,
    border: "1px solid var(--danger)",
    background: "transparent",
    color: "var(--danger)",
    fontSize: "0.75rem",
  },
};
