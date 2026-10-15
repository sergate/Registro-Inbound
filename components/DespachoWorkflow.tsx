"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/datetime";
import ScanInput, { type ScanInputHandle } from "./ScanInput";
import PalletHeader from "./PalletHeader";
import ScanAlert from "./ScanAlert";
import ClosePalletConfirm from "./ClosePalletConfirm";
import ReopenPalletPrompt from "./ReopenPalletPrompt";
import ManualEntryModal from "./ManualEntryModal";
import ModeBand from "./ModeBand";

const DEFAULT_DESTINO = "CD Nave 4";
const DEFAULT_REFERENCIA = "salida de deposito";

interface OpenDespacho {
  id: string;
  numero: number;
  destino: string | null;
  referencia: string | null;
}

type Rechazo =
  | { tipo: "no_ingresada"; ean13: string }
  | {
      tipo: "ya_despachada";
      ean13: string;
      despachoNumero: number;
      operario: string;
      fecha: string;
    }
  | { tipo: "ingreso_abierto"; ean13: string; palletNumero: number };

export default function DespachoWorkflow({ userId }: { userId: string }) {
  const supabase = createClient();
  const scanInputRef = useRef<ScanInputHandle>(null);

  const [loading, setLoading] = useState(true);
  const [despacho, setDespacho] = useState<OpenDespacho | null>(null);
  const [labelCount, setLabelCount] = useState(0);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [rechazo, setRechazo] = useState<Rechazo | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [reopenPrompt, setReopenPrompt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destino, setDestino] = useState(DEFAULT_DESTINO);
  const [referencia, setReferencia] = useState(DEFAULT_REFERENCIA);

  useEffect(() => {
    loadOpenDespacho();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOpenDespacho() {
    setLoading(true);
    const { data: open } = await supabase
      .from("despachos")
      .select("id, numero, destino, referencia")
      .eq("opened_by", userId)
      .eq("status", "open")
      .maybeSingle();

    if (open) {
      setDespacho(open);
      const { count } = await supabase
        .from("despacho_etiquetas")
        .select("id", { count: "exact", head: true })
        .eq("despacho_id", open.id);
      setLabelCount(count ?? 0);
    } else {
      setDespacho(null);
      setLabelCount(0);
    }
    setLoading(false);
  }

  async function startDespacho() {
    setBusy(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("despachos")
      .insert({
        opened_by: userId,
        destino: destino.trim() || null,
        referencia: referencia.trim() || null,
      })
      .select("id, numero, destino, referencia")
      .single();

    if (insertError || !data) {
      if (insertError?.code === "23505") {
        // ya tenia uno abierto (otra pestana o doble toque): lo retomamos
        await loadOpenDespacho();
      } else {
        setError("No se pudo iniciar el pallet de salida. Reintentá.");
      }
      setBusy(false);
      return;
    }

    setDespacho(data);
    setLabelCount(0);
    setLastScanned(null);
    setBusy(false);
    scanInputRef.current?.focus();
  }

  async function handleScan(ean13: string) {
    if (!despacho || busy) return;
    setBusy(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("despachar_etiqueta", {
      p_despacho_id: despacho.id,
      p_ean13: ean13,
    });
    setBusy(false);

    if (rpcError || !data) {
      setError("Error al registrar la caja. Reintentá.");
      return;
    }

    switch (data.resultado) {
      case "ok":
        setLabelCount((c) => c + 1);
        setLastScanned(ean13);
        break;
      case "no_ingresada":
        setRechazo({ tipo: "no_ingresada", ean13 });
        break;
      case "ya_despachada":
        setRechazo({
          tipo: "ya_despachada",
          ean13,
          despachoNumero: data.despacho_numero,
          operario: data.operario,
          fecha: data.fecha,
        });
        break;
      case "ingreso_abierto":
        setRechazo({ tipo: "ingreso_abierto", ean13, palletNumero: data.pallet_numero });
        break;
      case "despacho_invalido":
        setError("Este pallet de salida ya no está abierto.");
        await loadOpenDespacho();
        break;
    }
  }

  async function handleManualEntry(ean13: string) {
    await handleScan(ean13);
    setShowManualEntry(false);
    scanInputRef.current?.focus();
  }

  function dismissRechazo() {
    setRechazo(null);
    scanInputRef.current?.focus();
  }

  async function confirmCloseDespacho() {
    if (!despacho) return;
    setBusy(true);

    const { error: updateError } = await supabase
      .from("despachos")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", despacho.id);

    setBusy(false);
    setShowCloseConfirm(false);

    if (updateError) {
      setError("No se pudo cerrar el pallet de salida. Reintentá.");
      return;
    }

    setReopenPrompt(despacho.numero);
    setDespacho(null);
  }

  async function handleReopenYes() {
    setReopenPrompt(null);
    await startDespacho();
  }

  function handleReopenNo() {
    setReopenPrompt(null);
  }

  if (loading) {
    return <p style={{ padding: "1rem", textAlign: "center" }}>Cargando...</p>;
  }

  return (
    <>
      <ModeBand />
      <main style={{ minHeight: "calc(100dvh - 85px)", display: "flex", flexDirection: "column" }}>
        {error && (
          <p style={{ color: "var(--danger)", textAlign: "center", padding: "0.5rem" }}>
            {error}
          </p>
        )}

        {!despacho ? (
          <div style={styles.idle}>
            <p style={{ color: "var(--text-dim)" }}>No hay ningún pallet de salida abierto.</p>
            <div style={styles.field}>
              <label htmlFor="destino" style={styles.label}>
                Destino
              </label>
              <input
                id="destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label htmlFor="referencia" style={styles.label}>
                Referencia
              </label>
              <input
                id="referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                style={styles.input}
              />
            </div>
            <button disabled={busy} onClick={startDespacho} style={styles.primaryButton}>
              Iniciar Pallet de salida
            </button>
          </div>
        ) : (
          <>
            <PalletHeader
              palletNumber={despacho.numero}
              labelCount={labelCount}
              lastScanned={lastScanned}
              kindLabel="Pallet de salida"
              countLabel="cajas cargadas"
            >
              {(despacho.destino || despacho.referencia) && (
                <div style={styles.meta}>
                  {[despacho.destino, despacho.referencia].filter(Boolean).join(" · ")}
                </div>
              )}
            </PalletHeader>
            <ScanInput
              ref={scanInputRef}
              onScan={handleScan}
              disabled={
                busy ||
                showManualEntry ||
                showCloseConfirm ||
                rechazo !== null ||
                reopenPrompt !== null
              }
            />
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
                Cerrar Pallet de salida
              </button>
            </div>
          </>
        )}

        {rechazo?.tipo === "no_ingresada" && (
          <ScanAlert title="Etiqueta no ingresada" onContinue={dismissRechazo}>
            El código <strong style={styles.strong}>{rechazo.ean13}</strong> no figura en ningún
            pallet de ingreso. Revisá el código o cargalo a mano.
          </ScanAlert>
        )}

        {rechazo?.tipo === "ya_despachada" && (
          <ScanAlert title="Etiqueta ya despachada" onContinue={dismissRechazo}>
            El código <strong style={styles.strong}>{rechazo.ean13}</strong> salió en el pallet de
            salida #{rechazo.despachoNumero}, cargado por {rechazo.operario} (
            {formatDateTime(rechazo.fecha)}).
          </ScanAlert>
        )}

        {rechazo?.tipo === "ingreso_abierto" && (
          <ScanAlert title="Pallet de ingreso abierto" onContinue={dismissRechazo}>
            La etiqueta <strong style={styles.strong}>{rechazo.ean13}</strong> está en el pallet de
            ingreso #{rechazo.palletNumero}, que todavía está abierto. Cerralo antes de
            despacharla.
          </ScanAlert>
        )}

        {showCloseConfirm && despacho && (
          <ClosePalletConfirm
            palletNumber={despacho.numero}
            labelCount={labelCount}
            kindLabel="pallet de salida"
            unitLabel="cajas"
            onConfirm={confirmCloseDespacho}
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
            kindLabel="pallet de salida"
            onOpenNew={handleReopenYes}
            onDismiss={handleReopenNo}
          />
        )}
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  idle: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "1.5rem",
  },
  field: {
    width: "100%",
    maxWidth: 320,
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.8rem",
    color: "var(--text-dim)",
  },
  input: {
    fontSize: "1rem",
    padding: "0.7rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
  },
  primaryButton: {
    marginTop: "0.5rem",
    padding: "1.2rem 2rem",
    fontSize: "1.2rem",
    fontWeight: 600,
    borderRadius: 12,
    border: "none",
    background: "var(--out)",
    color: "var(--out-ink)",
    width: "100%",
    maxWidth: 320,
  },
  meta: {
    marginTop: "0.75rem",
    fontSize: "0.85rem",
    color: "var(--text-dim)",
  },
  strong: {
    color: "var(--text)",
    fontWeight: 600,
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
