import Link from "next/link";
import UsersTable from "@/components/UsersTable";

export default function AdminPage() {
  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Usuarios</h1>
        <Link
          href="/admin/users/new"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          + Nuevo usuario
        </Link>
      </div>
      <UsersTable />
    </main>
  );
}
