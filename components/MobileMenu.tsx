"use client";

import Link from "next/link";

export default function MobileMenu() {
  return (
    <main style={styles.wrapper}>
      <Link href="/app/ingresar" style={styles.inButton}>
        Ingresar Pallet
      </Link>
      <Link href="/app/despachar" style={styles.outButton}>
        Despachar Pallet
      </Link>
    </main>
  );
}

const buttonBase: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: 320,
  textAlign: "center",
  padding: "1.2rem 2rem",
  fontSize: "1.2rem",
  fontWeight: 600,
  borderRadius: 12,
  border: "none",
  textDecoration: "none",
};

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
  inButton: {
    ...buttonBase,
    background: "var(--accent)",
    color: "#fff",
  },
  outButton: {
    ...buttonBase,
    background: "var(--out)",
    color: "var(--out-ink)",
  },
};
