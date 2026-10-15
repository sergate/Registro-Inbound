"use client";

import Modal from "./Modal";

// Aviso bloqueante con boton Continuar, para cuando una etiqueta se rechaza.
export default function ScanAlert({
  title,
  children,
  onContinue,
}: {
  title: string;
  children: React.ReactNode;
  onContinue: () => void;
}) {
  return (
    <Modal>
      <h2 style={{ marginTop: 0, color: "var(--danger)" }}>{title}</h2>
      <p style={{ color: "var(--text-dim)" }}>{children}</p>
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
