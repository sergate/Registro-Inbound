import Link from "next/link";

export default function ConsultasPage() {
  return (
    <main style={{ padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Consultas</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 420 }}>
        <Link href="/consultas/tareas" style={cardStyle}>
          <div style={titleStyle}>Tareas realizadas</div>
          <div style={descStyle}>
            Pallets abiertos y cerrados por cada operario, con las etiquetas
            escaneadas.
          </div>
        </Link>
        <Link href="/consultas/seguimiento" style={cardStyle}>
          <div style={titleStyle}>Seguimiento de bultos</div>
          <div style={descStyle}>
            Cada etiqueta escaneada, su pallet de ingreso y (a futuro) su
            salida.
          </div>
        </Link>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  display: "block",
  padding: "1rem",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  textDecoration: "none",
  color: "var(--text)",
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: "0.25rem",
};

const descStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--text-dim)",
};
