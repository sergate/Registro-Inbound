"use client";

export default function PalletHeader({
  palletNumber,
  labelCount,
  lastScanned,
}: {
  palletNumber: number;
  labelCount: number;
  lastScanned: string | null;
}) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.palletNumber}>Pallet #{palletNumber}</div>
      <div style={styles.count}>{labelCount}</div>
      <div style={styles.countLabel}>bultos escaneados</div>
      {lastScanned && (
        <div style={styles.lastScanned}>Último: {lastScanned}</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    textAlign: "center",
    padding: "2rem 1rem",
  },
  palletNumber: {
    fontSize: "1.1rem",
    color: "var(--text-dim)",
  },
  count: {
    fontSize: "4rem",
    fontWeight: 700,
    lineHeight: 1.1,
  },
  countLabel: {
    color: "var(--text-dim)",
  },
  lastScanned: {
    marginTop: "1rem",
    fontSize: "0.9rem",
    color: "var(--text-dim)",
  },
};
