"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AppHeader({
  username,
  roleLabel,
}: {
  username: string;
  roleLabel: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header style={styles.header}>
      <div>
        <div style={styles.username}>{username}</div>
        <div style={styles.role}>{roleLabel}</div>
      </div>
      <button style={styles.logout} onClick={handleLogout}>
        Salir
      </button>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
  },
  username: {
    fontWeight: 600,
  },
  role: {
    fontSize: "0.8rem",
    color: "var(--text-dim)",
    textTransform: "capitalize",
  },
  logout: {
    padding: "0.5rem 1rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
  },
};
