"use client";

import Modal from "./Modal";

export default function ReopenPalletPrompt({
  closedPalletNumber,
  onOpenNew,
  onDismiss,
  kindLabel = "pallet",
}: {
  closedPalletNumber: number;
  onOpenNew: () => void;
  onDismiss: () => void;
  kindLabel?: string;
}) {
  return (
    <Modal>
      <h2 style={{ marginTop: 0, color: "var(--success)" }}>
        {kindLabel.charAt(0).toUpperCase() + kindLabel.slice(1)} #{closedPalletNumber} cerrado
      </h2>
      <p style={{ color: "var(--text-dim)" }}>
        ¿Querés abrir un nuevo {kindLabel}?
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button onClick={onDismiss} style={styles.no}>
          No
        </button>
        <button onClick={onOpenNew} style={styles.yes}>
          Sí, abrir nuevo
        </button>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  no: {
    flex: 1,
    padding: "0.9rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
  },
  yes: {
    flex: 1,
    padding: "0.9rem",
    borderRadius: 8,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontWeight: 600,
  },
};
