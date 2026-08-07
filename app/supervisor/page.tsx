import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

export default async function SupervisorPage() {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "supervisor" && profile.role !== "admin")) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: pallets } = await supabase
    .from("pallet_summary")
    .select("*")
    .order("pallet_number", { ascending: false });

  const openerIds = Array.from(new Set((pallets ?? []).map((p) => p.opened_by)));
  const { data: profiles } = openerIds.length
    ? await supabase.from("profiles").select("id, username").in("id", openerIds)
    : { data: [] as { id: string; username: string }[] };

  const usernameById = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  return (
    <div>
      <AppHeader username={profile.username} roleLabel="Supervisor" />
      <main style={{ padding: "1rem", overflowX: "auto" }}>
        <h1 style={{ fontSize: "1.2rem" }}>Pallets</h1>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Operario</th>
              <th style={styles.th}>Bultos</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Abierto</th>
              <th style={styles.th}>Cerrado</th>
            </tr>
          </thead>
          <tbody>
            {(pallets ?? []).map((p) => (
              <tr key={p.id}>
                <td style={styles.td}>{p.pallet_number}</td>
                <td style={styles.td}>{usernameById.get(p.opened_by) ?? "-"}</td>
                <td style={styles.td}>{p.label_count}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      color: p.status === "open" ? "var(--accent)" : "var(--text-dim)",
                    }}
                  >
                    {p.status === "open" ? "Abierto" : "Cerrado"}
                  </span>
                </td>
                <td style={styles.td}>{new Date(p.opened_at).toLocaleString()}</td>
                <td style={styles.td}>
                  {p.closed_at ? new Date(p.closed_at).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 640,
    marginTop: "1rem",
  },
  th: {
    textAlign: "left",
    padding: "0.5rem",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-dim)",
    fontSize: "0.85rem",
  },
  td: {
    padding: "0.5rem",
    borderBottom: "1px solid var(--border)",
    fontSize: "0.9rem",
  },
};
