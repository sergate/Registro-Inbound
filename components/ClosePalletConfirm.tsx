"use client";

import Modal from "./Modal";

export default function ClosePalletConfirm({
  palletNumber,
  labelCount,
  onConfirm,
  onCancel,
}: {
  palletNumber: number;
  labelCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal>
      <h2 style={{ marginTop: 0 }}>Cerrar pallet #{palletNumber}</h2>
      <p style={{ color: "var(--text-dim)" }}>
        Se registraron <strong style={{ color: "var(--text)" }}>{labelCount}</strong>{" "}
        bultos en este pallet. ¿Confirmás el cierre?
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button onClick={onCancel} style={styles.cancel}>
          Cancelar
        </button>
        <button onClick={onConfirm} style={styles.confirm}>
          Confirmar cierre
        </button>
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
    background: "var(--danger)",
    color: "#fff",
    fontWeight: 600,
  },
};
