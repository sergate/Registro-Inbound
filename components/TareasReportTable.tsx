"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/datetime";

interface Label {
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

export default function TareasReportTable({ pallets }: { pallets: PalletRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ overflowX: "auto" }}>
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
              </tr>
              {expanded.has(p.id) && (
                <tr key={`${p.id}-detail`}>
                  <td style={styles.tdDetail}></td>
                  <td style={styles.tdDetail} colSpan={6}>
                    {p.labels.length === 0 ? (
                      <span style={{ color: "var(--text-dim)" }}>
                        Sin etiquetas escaneadas.
                      </span>
                    ) : (
                      <ul style={styles.labelList}>
                        {p.labels.map((l) => (
                          <li key={l.ean13} style={styles.labelItem}>
                            <span style={{ fontFamily: "monospace" }}>{l.ean13}</span>
                            <span style={{ color: "var(--text-dim)" }}>
                              {formatDateTime(l.scanned_at)}
                            </span>
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
    justifyContent: "space-between",
    maxWidth: 320,
    fontSize: "0.85rem",
  },
};
