"use client";

export default function PalletHeader({
  palletNumber,
  labelCount,
  lastScanned,
  kindLabel = "Pallet",
  countLabel = "bultos escaneados",
  children,
}: {
  palletNumber: number;
  labelCount: number;
  lastScanned: string | null;
  kindLabel?: string;
  countLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.palletNumber}>
        {kindLabel} #{palletNumber}
      </div>
      <div style={styles.count}>{labelCount}</div>
      <div style={styles.countLabel}>{countLabel}</div>
      {lastScanned && (
        <div style={styles.lastScanned}>Último: {lastScanned}</div>
      )}
      {children}
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
