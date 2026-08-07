"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileMenu() {
  const [showSoon, setShowSoon] = useState(false);

  return (
    <main style={styles.wrapper}>
      <Link href="/app/ingresar" style={styles.primaryButton}>
        Ingresar Pallet
      </Link>
      <button
        type="button"
        style={styles.disabledButton}
        onClick={() => setShowSoon(true)}
      >
        Despachar Pallet
      </button>
      {showSoon && (
        <p style={styles.soonText}>Próximamente disponible.</p>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "calc(100dvh - 60px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.25rem",
    padding: "1.5rem",
  },
  primaryButton: {
    display: "block",
    width: "100%",
    maxWidth: 320,
    textAlign: "center",
    padding: "1.2rem 2rem",
    fontSize: "1.2rem",
    fontWeight: 600,
    borderRadius: 12,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    textDecoration: "none",
  },
  disabledButton: {
    width: "100%",
    maxWidth: 320,
    padding: "1.2rem 2rem",
    fontSize: "1.2rem",
    fontWeight: 600,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--text-dim)",
  },
  soonText: {
    color: "var(--text-dim)",
    fontSize: "0.9rem",
  },
};
