import ExcelJS from "exceljs";
import { formatDateTime } from "./datetime";

export interface ExportPallet {
  id: string;
  pallet_number: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  profiles: { username: string } | null;
}

export interface ExportLabel {
  id: string;
  pallet_id: string;
  ean13: string;
  scanned_at: string;
}

export interface ExportDespacho {
  id: string;
  numero: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  destino: string | null;
  referencia: string | null;
  profiles: { username: string } | null;
}

export interface ExportDespachoEtiqueta {
  despacho_id: string;
  pallet_label_id: string;
  scanned_at: string;
}

function addHeaderStyle(sheet: ExcelJS.Worksheet) {
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columnCount },
  };
}

export async function buildPalletsWorkbook(
  pallets: ExportPallet[],
  labels: ExportLabel[],
  despachos: ExportDespacho[],
  despachoEtiquetas: ExportDespachoEtiqueta[]
): Promise<ExcelJS.Buffer> {
  const labelsByPallet = new Map<string, ExportLabel[]>();
  for (const l of labels) {
    const list = labelsByPallet.get(l.pallet_id);
    if (list) list.push(l);
    else labelsByPallet.set(l.pallet_id, [l]);
  }

  const labelById = new Map(labels.map((l) => [l.id, l]));
  const despachoById = new Map(despachos.map((d) => [d.id, d]));
  const salidaPorEtiqueta = new Map<string, ExportDespachoEtiqueta>();
  const etiquetasPorDespacho = new Map<string, ExportDespachoEtiqueta[]>();
  for (const e of despachoEtiquetas) {
    salidaPorEtiqueta.set(e.pallet_label_id, e);
    const list = etiquetasPorDespacho.get(e.despacho_id);
    if (list) list.push(e);
    else etiquetasPorDespacho.set(e.despacho_id, [e]);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();

  // ---------- Pallets de ingreso ----------
  const resumen = workbook.addWorksheet("Pallets");
  resumen.columns = [
    { header: "Pallet", key: "pallet", width: 10 },
    { header: "Operario", key: "operario", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Cajas", key: "cajas", width: 10 },
    { header: "Apertura", key: "apertura", width: 22 },
    { header: "Cierre", key: "cierre", width: 22 },
  ];

  // ---------- Cajas, con su ingreso y su salida ----------
  const detalle = workbook.addWorksheet("Detalle de cajas");
  detalle.columns = [
    { header: "Pallet", key: "pallet", width: 10 },
    { header: "Operario", key: "operario", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Apertura", key: "apertura", width: 22 },
    { header: "Cierre", key: "cierre", width: 22 },
    { header: "Etiqueta", key: "etiqueta", width: 24 },
    { header: "Fecha escaneo", key: "escaneo", width: 22 },
    { header: "Estado caja", key: "estadoCaja", width: 14 },
    { header: "Pallet salida", key: "palletSalida", width: 14 },
    { header: "Operario salida", key: "operarioSalida", width: 18 },
    { header: "Escaneo salida", key: "escaneoSalida", width: 22 },
    { header: "Cierre salida", key: "cierreSalida", width: 22 },
  ];

  for (const p of pallets) {
    const palletLabels = labelsByPallet.get(p.id) ?? [];
    const operario = p.profiles?.username ?? "-";
    const estado = p.status === "open" ? "Abierto" : "Cerrado";
    const apertura = formatDateTime(p.opened_at);
    const cierre = formatDateTime(p.closed_at);

    resumen.addRow({
      pallet: p.pallet_number,
      operario,
      estado,
      cajas: palletLabels.length,
      apertura,
      cierre,
    });

    for (const l of palletLabels) {
      const salida = salidaPorEtiqueta.get(l.id);
      const despacho = salida ? despachoById.get(salida.despacho_id) : undefined;
      detalle.addRow({
        pallet: p.pallet_number,
        operario,
        estado,
        apertura,
        cierre,
        etiqueta: l.ean13,
        escaneo: formatDateTime(l.scanned_at),
        estadoCaja: salida ? "Despachada" : "En stock",
        palletSalida: despacho ? despacho.numero : "-",
        operarioSalida: despacho?.profiles?.username ?? "-",
        escaneoSalida: salida ? formatDateTime(salida.scanned_at) : "-",
        cierreSalida: despacho ? (despacho.closed_at ? formatDateTime(despacho.closed_at) : "Abierto") : "-",
      });
    }
  }

  // ---------- Pallets de salida ----------
  const salidas = workbook.addWorksheet("Despachos");
  salidas.columns = [
    { header: "Salida", key: "numero", width: 10 },
    { header: "Operario", key: "operario", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Cajas", key: "cajas", width: 10 },
    { header: "Destino", key: "destino", width: 22 },
    { header: "Referencia", key: "referencia", width: 24 },
    { header: "Apertura", key: "apertura", width: 22 },
    { header: "Cierre", key: "cierre", width: 22 },
  ];

  const salidasDetalle = workbook.addWorksheet("Detalle de despachos");
  salidasDetalle.columns = [
    { header: "Salida", key: "numero", width: 10 },
    { header: "Operario", key: "operario", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Destino", key: "destino", width: 22 },
    { header: "Referencia", key: "referencia", width: 24 },
    { header: "Apertura", key: "apertura", width: 22 },
    { header: "Cierre", key: "cierre", width: 22 },
    { header: "Etiqueta", key: "etiqueta", width: 24 },
    { header: "Fecha escaneo", key: "escaneo", width: 22 },
  ];

  for (const d of despachos) {
    const cajas = etiquetasPorDespacho.get(d.id) ?? [];
    const operario = d.profiles?.username ?? "-";
    const estado = d.status === "open" ? "Abierto" : "Cerrado";
    const apertura = formatDateTime(d.opened_at);
    const cierre = formatDateTime(d.closed_at);

    salidas.addRow({
      numero: d.numero,
      operario,
      estado,
      cajas: cajas.length,
      destino: d.destino ?? "-",
      referencia: d.referencia ?? "-",
      apertura,
      cierre,
    });

    for (const e of cajas) {
      salidasDetalle.addRow({
        numero: d.numero,
        operario,
        estado,
        destino: d.destino ?? "-",
        referencia: d.referencia ?? "-",
        apertura,
        cierre,
        etiqueta: labelById.get(e.pallet_label_id)?.ean13 ?? "-",
        escaneo: formatDateTime(e.scanned_at),
      });
    }
  }

  for (const sheet of [resumen, detalle, salidas, salidasDetalle]) addHeaderStyle(sheet);
  // text format so Excel doesn't turn long numeric codes into 1.23E+12
  detalle.getColumn("etiqueta").numFmt = "@";
  salidasDetalle.getColumn("etiqueta").numFmt = "@";

  return workbook.xlsx.writeBuffer();
}
