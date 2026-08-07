"use client";

import Modal from "./Modal";

export default function DuplicateLabelAlert({
  ean13,
  onContinue,
}: {
  ean13: string;
  onContinue: () => void;
}) {
  return (
    <Modal>
      <h2 style={{ marginTop: 0, color: "var(--danger)" }}>
        Etiqueta ya escaneada
      </h2>
      <p style={{ color: "var(--text-dim)" }}>
        El código <strong style={{ color: "var(--text)" }}>{ean13}</strong> ya
        fue registrado anteriormente en el sistema.
      </p>
      <button onClick={onContinue} style={styles.button}>
        Continuar
      </button>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    width: "100%",
    marginTop: "1rem",
    padding: "0.9rem",
    borderRadius: 8,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
  },
};
