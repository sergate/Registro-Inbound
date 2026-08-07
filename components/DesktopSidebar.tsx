import Link from "next/link";
import LogoutButton from "./LogoutButton";
import type { UserRole } from "@/types/database";

export default function DesktopSidebar({
  role,
  username,
}: {
  role: UserRole;
  username: string;
}) {
  return (
    <nav style={styles.sidebar}>
      <div>
        <div style={styles.brand}>Registro Inbound</div>
        <div style={styles.user}>
          <div style={styles.username}>{username}</div>
          <div style={styles.role}>{role}</div>
        </div>

        <div style={styles.section}>
          {role === "admin" && (
            <Link href="/admin" style={styles.link}>
              Modo Administrador
            </Link>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>Consultas</div>
          <Link href="/consultas/tareas" style={styles.link}>
            Tareas realizadas
          </Link>
          <Link href="/consultas/seguimiento" style={styles.link}>
            Seguimiento de bultos
          </Link>
        </div>
      </div>

      <LogoutButton style={{ width: "100%" }} />
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 240,
    minHeight: "100dvh",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "1.25rem 1rem",
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
  },
  brand: {
    fontWeight: 700,
    fontSize: "1.1rem",
    marginBottom: "1rem",
  },
  user: {
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--border)",
  },
  username: {
    fontWeight: 600,
  },
  role: {
    fontSize: "0.8rem",
    color: "var(--text-dim)",
    textTransform: "capitalize",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    marginBottom: "1.5rem",
  },
  sectionLabel: {
    fontSize: "0.75rem",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.25rem",
  },
  link: {
    display: "block",
    padding: "0.6rem 0.75rem",
    borderRadius: 8,
    color: "var(--text)",
    textDecoration: "none",
  },
};
