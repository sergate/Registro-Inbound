"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function HamburgerNav() {
  const [open, setOpen] = useState(false);
  const [showSoon, setShowSoon] = useState(false);
  const pathname = usePathname();

  function close() {
    setOpen(false);
    setShowSoon(false);
  }

  return (
    <>
      <button
        aria-label="Menú"
        onClick={() => setOpen(true)}
        style={styles.trigger}
      >
        <span style={styles.bar} />
        <span style={styles.bar} />
        <span style={styles.bar} />
      </button>

      {open && (
        <div style={styles.overlay} onClick={close}>
          <nav style={styles.panel} onClick={(e) => e.stopPropagation()}>
            <Link
              href="/app/ingresar"
              style={{
                ...styles.link,
                ...(pathname === "/app/ingresar" ? styles.linkActive : {}),
              }}
              onClick={close}
            >
              Ingresar Pallet
            </Link>
            <button
              type="button"
              style={styles.linkButton}
              onClick={() => setShowSoon(true)}
            >
              Despachar Pallet
            </button>
            {showSoon && (
              <p style={styles.soon}>Próximamente disponible.</p>
            )}
            <div style={styles.divider} />
            <LogoutButton style={{ width: "100%" }} />
          </nav>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  trigger: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    width: 40,
    height: 40,
    padding: 8,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
  },
  bar: {
    display: "block",
    height: 2,
    background: "var(--text)",
    borderRadius: 1,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    zIndex: 100,
    display: "flex",
    justifyContent: "flex-end",
  },
  panel: {
    width: "75%",
    maxWidth: 300,
    minHeight: "100dvh",
    background: "var(--surface)",
    borderLeft: "1px solid var(--border)",
    padding: "1.25rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  link: {
    padding: "0.9rem 0.75rem",
    borderRadius: 8,
    color: "var(--text)",
    textDecoration: "none",
    fontWeight: 600,
  },
  linkActive: {
    background: "var(--surface-2)",
  },
  linkButton: {
    padding: "0.9rem 0.75rem",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "var(--text-dim)",
    fontWeight: 600,
    textAlign: "left",
  },
  soon: {
    padding: "0 0.75rem",
    fontSize: "0.85rem",
    color: "var(--text-dim)",
  },
  divider: {
    height: 1,
    background: "var(--border)",
    margin: "0.5rem 0",
  },
};
