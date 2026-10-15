// Banda de color que deja claro que se esta en modo SALIDA (despacho),
// para no confundir un pallet de salida con uno de ingreso.
export default function ModeBand() {
  return (
    <div
      style={{
        background: "var(--out)",
        color: "var(--out-ink)",
        fontWeight: 600,
        letterSpacing: "0.1em",
        fontSize: "0.75rem",
        textAlign: "center",
        padding: "0.25rem 0",
      }}
    >
      SALIDA
    </div>
  );
}
