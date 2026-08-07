"use client";

export default function Modal({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.box}>{children}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "1.5rem",
  },
  box: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "1.5rem",
    width: "100%",
    maxWidth: 360,
  },
};
