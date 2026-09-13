import type { DiagnosticoAdmin } from "@/services/adminDiagnosticos";
import {
  ETIQUETAS_DIMENSION,
  ORDEN_DIMENSIONES,
  nivelDeScoreDimension,
  nivelDeScoreTotal,
  sectorDe,
} from "@/lib/dimensiones";

const COLOR_AZUL = "FF00344C";
const COLOR_GRIS_OSCURO = "FF425051";
const COLOR_OFF_WHITE = "FFF2F3EE";
const COLOR_BLANCO = "FFFFFFFF";
const COLOR_BORDE = "FFE0E0DA";

const TINTE_NIVEL: Record<string, { fill: string; font: string }> = {
  Alto: { fill: "FFDCE8F0", font: "FF00344C" },
  Medio: { fill: "FFFCEBD5", font: "FF9A5B0F" },
  Bajo: { fill: "FFFBDFDC", font: "FFBE1E2D" },
};

const FONT_NIVEL_DIMENSION: Record<string, string> = {
  Alto: "FF00344C",
  Medio: "FFB35900",
  Bajo: "FFBE1E2D",
};

interface ColumnaExcel {
  key: string;
  header: string;
  width: number;
  numFmt?: string;
}

const COLUMNAS: ColumnaExcel[] = [
  { key: "empresa", header: "Empresa", width: 24 },
  { key: "sector", header: "Sector", width: 16 },
  { key: "contacto", header: "Contacto", width: 20 },
  { key: "email", header: "Email", width: 28 },
  { key: "cargo", header: "Cargo", width: 18 },
  { key: "telefono", header: "Teléfono", width: 16 },
  { key: "score", header: "Score (0-100)", width: 12, numFmt: "0.0" },
  { key: "nivel", header: "Nivel", width: 10 },
  { key: "arquetipo", header: "Arquetipo", width: 28 },
  { key: "nivelInnovacion", header: "Nivel de innovación", width: 17 },
  ...ORDEN_DIMENSIONES.map((clave) => ({
    key: clave,
    header: ETIQUETAS_DIMENSION[clave],
    width: 12,
    numFmt: "0.00",
  })),
  { key: "fecha", header: "Fecha", width: 18, numFmt: "dd/mm/yyyy hh:mm" },
];

const TOTAL_COLUMNAS = COLUMNAS.length;

function telefonoDe(registro: DiagnosticoAdmin): string {
  if (!registro.perfil?.telefono) return "";
  const codigo = registro.perfil.codigoPais ?? "";
  return `${codigo} ${registro.perfil.telefono}`.trim();
}

function cargoDe(registro: DiagnosticoAdmin): string {
  return registro.perfil?.cargo === "Otro"
    ? registro.perfil?.cargo_otro ?? ""
    : registro.perfil?.cargo ?? "";
}

function filaDe(registro: DiagnosticoAdmin) {
  const scores = registro.scoresPorDimension ?? {};
  const fila: Record<string, string | number | Date | undefined> = {
    empresa: registro.empresa?.nombre ?? "",
    sector: sectorDe(registro) ?? "",
    contacto: registro.perfil?.nombre ?? "",
    email: registro.perfil?.email ?? "",
    cargo: cargoDe(registro),
    telefono: telefonoDe(registro),
    score: registro.scoreTotal100 ?? 0,
    nivel: nivelDeScoreTotal(registro.scoreTotal100 ?? 0),
    arquetipo: registro.arquetipo ?? "",
    nivelInnovacion: registro.nivelInnovacion ?? "",
    fecha: registro.creadoEn ? new Date(registro.creadoEn) : undefined,
  };
  for (const clave of ORDEN_DIMENSIONES) {
    fila[clave] = scores[clave] ?? 0;
  }
  return fila;
}

export async function generarLibroExcelRegistros(
  registros: DiagnosticoAdmin[]
): Promise<Blob> {
  const { default: ExcelJS } = await import("exceljs");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Pista8";
  workbook.created = new Date();

  const hoja = workbook.addWorksheet("Registros", {
    views: [{ state: "frozen", ySplit: 3, xSplit: 1 }],
  });
  hoja.columns = COLUMNAS.map((columna) => ({
    key: columna.key,
    width: columna.width,
  }));

  // Fila 1: banda de titulo
  hoja.mergeCells(1, 1, 1, TOTAL_COLUMNAS);
  const celdaTitulo = hoja.getCell(1, 1);
  celdaTitulo.value = "Diagnóstico de Madurez en Innovación · Pista8";
  celdaTitulo.font = { bold: true, size: 13, color: { argb: COLOR_BLANCO } };
  celdaTitulo.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR_AZUL },
  };
  celdaTitulo.alignment = { vertical: "middle", horizontal: "left" };
  hoja.getRow(1).height = 26;

  // Fila 2: banda de subtitulo (fecha de exportacion y conteo)
  hoja.mergeCells(2, 1, 2, TOTAL_COLUMNAS);
  const celdaSubtitulo = hoja.getCell(2, 1);
  const fechaExportacion = new Date().toLocaleString("es-ES");
  celdaSubtitulo.value = `Exportado el ${fechaExportacion} · ${registros.length} diagnóstico${registros.length === 1 ? "" : "s"}`;
  celdaSubtitulo.font = { italic: true, size: 10, color: { argb: COLOR_GRIS_OSCURO } };
  celdaSubtitulo.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR_OFF_WHITE },
  };
  hoja.getRow(2).height = 18;

  // Fila 3: encabezados de columna
  const filaEncabezado = hoja.getRow(3);
  COLUMNAS.forEach((columna, indice) => {
    const celda = filaEncabezado.getCell(indice + 1);
    celda.value = columna.header;
    celda.font = { bold: true, size: 10, color: { argb: COLOR_BLANCO } };
    celda.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_GRIS_OSCURO },
    };
    celda.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    celda.border = {
      top: { style: "thin", color: { argb: COLOR_BORDE } },
      bottom: { style: "thin", color: { argb: COLOR_BORDE } },
    };
  });
  filaEncabezado.height = 28;

  registros.forEach((registro, indice) => {
    const fila = hoja.addRow(filaDe(registro));
    const esImpar = indice % 2 === 1;

    fila.eachCell({ includeEmpty: true }, (celda, numeroColumna) => {
      const columna = COLUMNAS[numeroColumna - 1];
      celda.border = {
        top: { style: "thin", color: { argb: COLOR_BORDE } },
        bottom: { style: "thin", color: { argb: COLOR_BORDE } },
        left: { style: "thin", color: { argb: COLOR_BORDE } },
        right: { style: "thin", color: { argb: COLOR_BORDE } },
      };
      if (columna?.numFmt) {
        celda.numFmt = columna.numFmt;
      }
      if (!celda.fill) {
        celda.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: esImpar ? COLOR_OFF_WHITE : COLOR_BLANCO },
        };
      }
    });

    const celdaNivel = fila.getCell("nivel");
    const tinte = TINTE_NIVEL[celdaNivel.value as string];
    if (tinte) {
      celdaNivel.font = { bold: true, color: { argb: tinte.font } };
      celdaNivel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: tinte.fill } };
      celdaNivel.alignment = { horizontal: "center" };
    }

    const celdaScore = fila.getCell("score");
    celdaScore.font = { bold: true, color: { argb: tinte?.font ?? COLOR_GRIS_OSCURO } };
    celdaScore.alignment = { horizontal: "center" };

    for (const clave of ORDEN_DIMENSIONES) {
      const celda = fila.getCell(clave);
      const valor = typeof celda.value === "number" ? celda.value : 0;
      celda.font = { color: { argb: FONT_NIVEL_DIMENSION[nivelDeScoreDimension(valor)] } };
      celda.alignment = { horizontal: "center" };
    }
  });

  hoja.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3 + registros.length, column: TOTAL_COLUMNAS },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
