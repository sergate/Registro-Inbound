"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/types/database";

interface UserRow {
  id: string;
  username: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "Error al cargar usuarios");
      return;
    }
    setUsers(body.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(id: string, updates: Partial<Pick<UserRow, "role" | "active">>) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "No se pudo actualizar el usuario");
    } else {
      await load();
    }
    setBusyId(null);
  }

  async function deleteUser(id: string, username: string) {
    if (!confirm(`¿Borrar el usuario "${username}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "No se pudo borrar el usuario");
    } else {
      await load();
    }
    setBusyId(null);
  }

  if (error) return <p style={{ color: "var(--danger)", padding: "1rem" }}>{error}</p>;
  if (!users) return <p style={{ padding: "1rem" }}>Cargando...</p>;

  return (
    <div style={{ padding: "1rem", overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Usuario</th>
            <th style={styles.th}>Rol</th>
            <th style={styles.th}>Activo</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={styles.td}>{u.username}</td>
              <td style={styles.td}>
                <select
                  value={u.role}
                  disabled={busyId === u.id}
                  onChange={(e) =>
                    updateUser(u.id, { role: e.target.value as UserRole })
                  }
                  style={styles.select}
                >
                  <option value="operario">Operario</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td style={styles.td}>
                <button
                  disabled={busyId === u.id}
                  onClick={() => updateUser(u.id, { active: !u.active })}
                  style={{
                    ...styles.toggle,
                    background: u.active ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {u.active ? "Activo" : "Inactivo"}
                </button>
              </td>
              <td style={styles.td}>
                <button
                  disabled={busyId === u.id}
                  onClick={() => deleteUser(u.id, u.username)}
                  style={styles.delete}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 420,
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
  },
  select: {
    padding: "0.4rem",
    borderRadius: 6,
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
  toggle: {
    padding: "0.4rem 0.75rem",
    borderRadius: 6,
    border: "none",
    color: "#fff",
    fontSize: "0.85rem",
  },
  delete: {
    padding: "0.4rem 0.75rem",
    borderRadius: 6,
    border: "1px solid var(--danger)",
    background: "transparent",
    color: "var(--danger)",
    fontSize: "0.85rem",
  },
};
