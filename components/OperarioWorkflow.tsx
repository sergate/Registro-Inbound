"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ScanInput, { type ScanInputHandle } from "./ScanInput";
import PalletHeader from "./PalletHeader";
import DuplicateLabelAlert from "./DuplicateLabelAlert";
import ClosePalletConfirm from "./ClosePalletConfirm";
import ReopenPalletPrompt from "./ReopenPalletPrompt";
import ManualEntryModal from "./ManualEntryModal";

interface OpenPallet {
  id: string;
  pallet_number: number;
}

export default function OperarioWorkflow({ userId }: { userId: string }) {
  const supabase = createClient();
  const scanInputRef = useRef<ScanInputHandle>(null);

  const [loading, setLoading] = useState(true);
  const [pallet, setPallet] = useState<OpenPallet | null>(null);
  const [labelCount, setLabelCount] = useState(0);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [duplicateEan, setDuplicateEan] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [reopenPrompt, setReopenPrompt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOpenPallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOpenPallet() {
    setLoading(true);
    const { data: openPallet } = await supabase
      .from("pallets")
      .select("id, pallet_number")
      .eq("opened_by", userId)
      .eq("status", "open")
      .maybeSingle();

    if (openPallet) {
      setPallet(openPallet);
      const { count } = await supabase
        .from("pallet_labels")
        .select("id", { count: "exact", head: true })
        .eq("pallet_id", openPallet.id);
      setLabelCount(count ?? 0);
    } else {
      setPallet(null);
      setLabelCount(0);
    }
    setLoading(false);
  }

  async function startPallet() {
    setBusy(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("pallets")
      .insert({ opened_by: userId })
      .select("id, pallet_number")
      .single();

    if (insertError || !data) {
      setError("No se pudo iniciar el pallet. Reintentá.");
      setBusy(false);
      return;
    }

    setPallet(data);
    setLabelCount(0);
    setLastScanned(null);
    setBusy(false);
    scanInputRef.current?.focus();
  }

  async function handleScan(ean13: string) {
    if (!pallet || busy) return;
    setBusy(true);

    const { error: insertError } = await supabase.from("pallet_labels").insert({
      pallet_id: pallet.id,
      ean13,
      scanned_by: userId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setDuplicateEan(ean13);
      } else {
        setError("Error al registrar la etiqueta. Reintentá.");
      }
      setBusy(false);
      return;
    }

    setLabelCount((c) => c + 1);
    setLastScanned(ean13);
    setBusy(false);
  }

  async function handleManualEntry(ean13: string) {
    await handleScan(ean13);
    setShowManualEntry(false);
    scanInputRef.current?.focus();
  }

  function dismissDuplicate() {
    setDuplicateEan(null);
    scanInputRef.current?.focus();
  }

  async function confirmClosePallet() {
    if (!pallet) return;
    setBusy(true);

    const { error: updateError } = await supabase
      .from("pallets")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", pallet.id);

    setBusy(false);
    setShowCloseConfirm(false);

    if (updateError) {
      setError("No se pudo cerrar el pallet. Reintentá.");
      return;
    }

    setReopenPrompt(pallet.pallet_number);
    setPallet(null);
  }

  async function handleReopenYes() {
    setReopenPrompt(null);
    await startPallet();
  }

  function handleReopenNo() {
    setReopenPrompt(null);
    scanInputRef.current?.focus();
  }

  if (loading) {
    return <p style={{ padding: "1rem", textAlign: "center" }}>Cargando...</p>;
  }

  return (
    <main style={{ minHeight: "calc(100dvh - 60px)", display: "flex", flexDirection: "column" }}>
      {error && (
        <p style={{ color: "var(--danger)", textAlign: "center", padding: "0.5rem" }}>
          {error}
        </p>
      )}

      {!pallet ? (
        <div style={styles.idle}>
          <p style={{ color: "var(--text-dim)" }}>No hay ningún pallet abierto.</p>
          <button disabled={busy} onClick={startPallet} style={styles.primaryButton}>
            Iniciar Pallet
          </button>
        </div>
      ) : (
        <>
          <PalletHeader
            palletNumber={pallet.pallet_number}
            labelCount={labelCount}
            lastScanned={lastScanned}
          />
          <ScanInput ref={scanInputRef} onScan={handleScan} disabled={busy} />
          <div style={styles.manualWrapper}>
            <button
              disabled={busy}
              onClick={() => setShowManualEntry(true)}
              style={styles.manualButton}
            >
              Cargar etiqueta manualmente
            </button>
          </div>
          <div style={styles.closeWrapper}>
            <button
              disabled={busy}
              onClick={() => setShowCloseConfirm(true)}
              style={styles.closeButton}
            >
              Cerrar Pallet
            </button>
          </div>
        </>
      )}

      {duplicateEan && (
        <DuplicateLabelAlert ean13={duplicateEan} onContinue={dismissDuplicate} />
      )}

      {showCloseConfirm && pallet && (
        <ClosePalletConfirm
          palletNumber={pallet.pallet_number}
          labelCount={labelCount}
          onConfirm={confirmClosePallet}
          onCancel={() => {
            setShowCloseConfirm(false);
            scanInputRef.current?.focus();
          }}
        />
      )}

      {showManualEntry && (
        <ManualEntryModal
          busy={busy}
          onSubmit={handleManualEntry}
          onCancel={() => {
            setShowManualEntry(false);
            scanInputRef.current?.focus();
          }}
        />
      )}

      {reopenPrompt !== null && (
        <ReopenPalletPrompt
          closedPalletNumber={reopenPrompt}
          onOpenNew={handleReopenYes}
          onDismiss={handleReopenNo}
        />
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  idle: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    padding: "1.5rem",
  },
  primaryButton: {
    padding: "1.2rem 2rem",
    fontSize: "1.2rem",
    fontWeight: 600,
    borderRadius: 12,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    width: "100%",
    maxWidth: 320,
  },
  manualWrapper: {
    padding: "0 1.5rem",
    textAlign: "center",
  },
  manualButton: {
    padding: "0.7rem 1.2rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
  },
  closeWrapper: {
    padding: "1.5rem",
    marginTop: "auto",
  },
  closeButton: {
    width: "100%",
    padding: "1.1rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    borderRadius: 12,
    border: "none",
    background: "var(--danger)",
    color: "#fff",
  },
};
