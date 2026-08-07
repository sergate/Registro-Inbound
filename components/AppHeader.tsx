import LogoutButton from "./LogoutButton";

export default function AppHeader({
  username,
  roleLabel,
}: {
  username: string;
  roleLabel: string;
}) {
  return (
    <header style={styles.header}>
      <div>
        <div style={styles.username}>{username}</div>
        <div style={styles.role}>{roleLabel}</div>
      </div>
      <LogoutButton />
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
};
