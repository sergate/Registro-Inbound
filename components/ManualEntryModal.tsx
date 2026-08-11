"use client";

import { useState } from "react";
import Modal from "./Modal";

export default function ManualEntryModal({
  onSubmit,
  onCancel,
  busy,
}: {
  onSubmit: (ean13: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = value.trim();
    if (!code) return;
    onSubmit(code);
    setValue("");
  }

  return (
    <Modal>
      <h2 style={{ marginTop: 0 }}>Cargar etiqueta manualmente</h2>
      <p style={{ color: "var(--text-dim)" }}>
        Usá esto solo cuando la etiqueta esté rota o no se pueda escanear.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Número de etiqueta"
          style={styles.input}
        />
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button type="button" onClick={onCancel} style={styles.cancel}>
            Cancelar
          </button>
          <button type="submit" disabled={busy || !value.trim()} style={styles.confirm}>
            Agregar
          </button>
        </div>
      </form>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  input: {
    width: "100%",
    fontSize: "1.1rem",
    padding: "0.75rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--text)",
  },
  cancel: {
    flex: 1,
    padding: "0.9rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
  },
  confirm: {
    flex: 1,
    padding: "0.9rem",
    borderRadius: 8,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontWeight: 600,
  },
};
