"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/database";

export default function NewUserPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("operario");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "No se pudo crear el usuario");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main style={{ padding: "1rem", maxWidth: 400 }}>
      <h1 style={{ fontSize: "1.2rem" }}>Nuevo usuario</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Usuario
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            autoCapitalize="none"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />
        </label>
        <label>
          Rol
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            style={styles.input}
          >
            <option value="operario">Operario</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  input: {
    display: "block",
    width: "100%",
    marginTop: "0.25rem",
    padding: "0.6rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.8rem",
    borderRadius: 8,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontWeight: 600,
  },
};
