"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/datetime";

interface Label {
  id: string;
  ean13: string;
  scanned_at: string;
}

interface PalletRow {
  id: string;
  pallet_number: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  operario: string;
  labels: Label[];
}

export default function TareasReportTable({
  pallets,
  isAdmin,
}: {
  pallets: PalletRow[];
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

  async function deletePallet(e: React.MouseEvent, palletId: string, palletNumber: number) {
    e.stopPropagation();
    if (
      !confirm(
        `¿Borrar el pallet #${palletNumber} y sus etiquetas escaneadas? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setBusyId(palletId);
    setError(null);
    const res = await fetch(`/api/admin/pallets/${palletId}`, { method: "DELETE" });
    const body = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setError(body.error ?? "No se pudo borrar el pallet");
      return;
    }
    router.refresh();
  }

  async function deleteLabel(labelId: string, ean13: string) {
    if (!confirm(`¿Borrar la etiqueta ${ean13}?`)) return;
    setBusyId(labelId);
    setError(null);
    const res = await fetch(`/api/admin/labels/${labelId}`, { method: "DELETE" });
    const body = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setError(body.error ?? "No se pudo borrar la etiqueta");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {error && <p style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>{error}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}></th>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Operario</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Bultos</th>
            <th style={styles.th}>Apertura</th>
            <th style={styles.th}>Cierre</th>
            {isAdmin && <th style={styles.th}></th>}
          </tr>
        </thead>
        <tbody>
          {pallets.map((p) => (
            <>
              <tr key={p.id} onClick={() => toggle(p.id)} style={styles.row}>
                <td style={styles.td}>{expanded.has(p.id) ? "▾" : "▸"}</td>
                <td style={styles.td}>{p.pallet_number}</td>
                <td style={styles.td}>{p.operario}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      color: p.status === "open" ? "var(--accent)" : "var(--text-dim)",
                    }}
                  >
                    {p.status === "open" ? "Abierto" : "Cerrado"}
                  </span>
                </td>
                <td style={styles.td}>{p.labels.length}</td>
                <td style={styles.td}>{formatDateTime(p.opened_at)}</td>
                <td style={styles.td}>{formatDateTime(p.closed_at)}</td>
                {isAdmin && (
                  <td style={styles.td}>
                    <button
                      disabled={busyId === p.id}
                      onClick={(e) => deletePallet(e, p.id, p.pallet_number)}
                      style={styles.delete}
                    >
                      Borrar
                    </button>
                  </td>
                )}
              </tr>
              {expanded.has(p.id) && (
                <tr key={`${p.id}-detail`}>
                  <td style={styles.tdDetail}></td>
                  <td style={styles.tdDetail} colSpan={isAdmin ? 7 : 6}>
                    {p.labels.length === 0 ? (
                      <span style={{ color: "var(--text-dim)" }}>
                        Sin etiquetas escaneadas.
                      </span>
                    ) : (
                      <ul style={styles.labelList}>
                        {p.labels.map((l) => (
                          <li key={l.id} style={styles.labelItem}>
                            <span style={{ fontFamily: "monospace" }}>{l.ean13}</span>
                            <span style={{ color: "var(--text-dim)" }}>
                              {formatDateTime(l.scanned_at)}
                            </span>
                            {isAdmin && (
                              <button
                                disabled={busyId === l.id}
                                onClick={() => deleteLabel(l.id, l.ean13)}
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
            </>
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
    minWidth: 720,
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
