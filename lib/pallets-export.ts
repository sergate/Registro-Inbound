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
  pallet_id: string;
  ean13: string;
  scanned_at: string;
}

export async function buildPalletsWorkbook(
  pallets: ExportPallet[],
  labels: ExportLabel[]
): Promise<ExcelJS.Buffer> {
  const labelsByPallet = new Map<string, ExportLabel[]>();
  for (const l of labels) {
    const list = labelsByPallet.get(l.pallet_id);
    if (list) list.push(l);
    else labelsByPallet.set(l.pallet_id, [l]);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();

  const resumen = workbook.addWorksheet("Pallets");
  resumen.columns = [
    { header: "Pallet", key: "pallet", width: 10 },
    { header: "Operario", key: "operario", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Cajas", key: "cajas", width: 10 },
    { header: "Apertura", key: "apertura", width: 22 },
    { header: "Cierre", key: "cierre", width: 22 },
  ];

  const detalle = workbook.addWorksheet("Detalle de cajas");
  detalle.columns = [
    { header: "Pallet", key: "pallet", width: 10 },
    { header: "Operario", key: "operario", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Apertura", key: "apertura", width: 22 },
    { header: "Cierre", key: "cierre", width: 22 },
    { header: "Etiqueta", key: "etiqueta", width: 24 },
    { header: "Fecha escaneo", key: "escaneo", width: 22 },
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
      detalle.addRow({
        pallet: p.pallet_number,
        operario,
        estado,
        apertura,
        cierre,
        etiqueta: l.ean13,
        escaneo: formatDateTime(l.scanned_at),
      });
    }
  }

  for (const sheet of [resumen, detalle]) {
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columnCount },
    };
  }
  // text format so Excel doesn't turn long numeric codes into 1.23E+12
  detalle.getColumn("etiqueta").numFmt = "@";

  return workbook.xlsx.writeBuffer();
}
