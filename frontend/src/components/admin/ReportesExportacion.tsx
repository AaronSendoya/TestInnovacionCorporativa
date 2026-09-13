"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarRange,
  FileSpreadsheet,
  Loader2,
  Search,
  X,
} from "lucide-react";
import {
  obtenerDiagnosticos,
  type DiagnosticoAdmin,
} from "@/services/adminDiagnosticos";
import { fechaLocalYMD } from "@/lib/dimensiones";
import { generarLibroExcelRegistros } from "@/lib/exportarExcel";

const LIMITE_TODOS = 500;

function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

interface ReportesExportacionProps {
  activo?: boolean;
}

export default function ReportesExportacion({
  activo = true,
}: ReportesExportacionProps) {
  const [busqueda, setBusqueda] = useState("");
  const [sectorFiltro, setSectorFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [todos, setTodos] = useState<DiagnosticoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const pagina = await obtenerDiagnosticos({ limite: LIMITE_TODOS });
        if (cancelado) return;
        setTodos(pagina.diagnosticos);
      } catch (err) {
        if (cancelado) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar diagnósticos."
        );
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const sectoresDisponibles = useMemo(() => {
    const nombres = new Set(
      todos
        .map((registro) => registro.empresa?.sector)
        .filter((s): s is string => Boolean(s?.trim()))
    );
    return [...nombres].sort((a, b) => {
      if (a === "Otro") return 1;
      if (b === "Otro") return -1;
      return a.localeCompare(b, "es");
    });
  }, [todos]);

  const errorFechas =
    fechaDesde && fechaHasta && fechaDesde > fechaHasta
      ? "La fecha 'Desde' no puede ser posterior a 'Hasta'."
      : null;

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return todos.filter((registro) => {
      if (texto) {
        const coincideTexto =
          registro.empresa?.nombre?.toLowerCase().includes(texto) ||
          registro.perfil?.nombre?.toLowerCase().includes(texto);
        if (!coincideTexto) return false;
      }

      if (sectorFiltro && registro.empresa?.sector !== sectorFiltro) {
        return false;
      }

      if (!errorFechas && (fechaDesde || fechaHasta)) {
        if (!registro.creadoEn) return false;
        const ymd = fechaLocalYMD(new Date(registro.creadoEn));
        if (fechaDesde && ymd < fechaDesde) return false;
        if (fechaHasta && ymd > fechaHasta) return false;
      }

      return true;
    });
  }, [todos, busqueda, sectorFiltro, fechaDesde, fechaHasta, errorFechas]);

  const hayFiltrosActivos = Boolean(
    busqueda.trim() || sectorFiltro || fechaDesde || fechaHasta
  );

  function limpiarFiltros() {
    setBusqueda("");
    setSectorFiltro("");
    setFechaDesde("");
    setFechaHasta("");
  }

  async function exportar() {
    setExportando(true);
    setErrorExportar(null);
    try {
      const blob = await generarLibroExcelRegistros(filtrados);
      const fecha = fechaLocalYMD(new Date());
      descargarBlob(blob, `registros-innovacion-${fecha}.xlsx`);
    } catch (err) {
      setErrorExportar(
        err instanceof Error ? err.message : "No se pudo generar el archivo."
      );
    } finally {
      setExportando(false);
    }
  }

  if (!activo) return null;

  return (
    <div className="animate-entrada flex flex-col gap-5">
      <p className="text-sm text-gris-medio">
        Genera un archivo Excel (.xlsx) con formato profesional —
        encabezados, colores por nivel y filtros integrados — a partir de
        los diagnósticos registrados. El export respeta los filtros
        aplicados abajo.
      </p>

      <div className="flex flex-col gap-3 rounded-2xl border border-gris-verde/40 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-medio"
              aria-hidden="true"
            />
            <input
              type="text"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por empresa o contacto..."
              className="w-full rounded-full border border-gris-verde/40 bg-off-white py-2.5 pl-9 pr-3 text-sm text-gris-oscuro outline-none transition-colors focus:border-azul focus:bg-white focus:ring-2 focus:ring-azul/20"
            />
          </div>

          <div className="relative">
            <Building2
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-medio"
              aria-hidden="true"
            />
            <select
              value={sectorFiltro}
              onChange={(evento) => setSectorFiltro(evento.target.value)}
              className="rounded-full border border-gris-verde/40 bg-off-white py-2.5 pl-9 pr-8 text-sm text-gris-oscuro outline-none transition-colors focus:border-azul focus:bg-white focus:ring-2 focus:ring-azul/20"
            >
              <option value="">Todos los sectores</option>
              {sectoresDisponibles.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gris-verde/40 bg-off-white py-1.5 pl-3 pr-2 text-sm">
            <CalendarRange
              className="h-4 w-4 shrink-0 text-gris-medio"
              aria-hidden="true"
            />
            <input
              type="date"
              value={fechaDesde}
              onChange={(evento) => setFechaDesde(evento.target.value)}
              aria-label="Fecha desde"
              className="bg-transparent text-gris-oscuro outline-none"
            />
            <span className="text-gris-medio">–</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(evento) => setFechaHasta(evento.target.value)}
              aria-label="Fecha hasta"
              className="bg-transparent text-gris-oscuro outline-none"
            />
          </div>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-gris-medio transition-colors hover:bg-gris-verde/10 hover:text-gris-oscuro"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpiar filtros
            </button>
          )}
        </div>

        {errorFechas && (
          <p className="flex items-center gap-1.5 text-xs text-rojo-oscuro">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {errorFechas}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-4 py-3 text-sm text-rojo-oscuro">
          {error}
        </div>
      )}

      {errorExportar && (
        <div className="rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-4 py-3 text-sm text-rojo-oscuro">
          {errorExportar}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gris-verde/40 bg-white p-6 shadow-sm sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-azul/10 text-azul">
            <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-base text-gris-oscuro">
              {cargando ? (
                <span className="inline-flex items-center gap-2 text-gris-medio">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Cargando diagnósticos...
                </span>
              ) : (
                `${filtrados.length} de ${todos.length} diagnósticos listos para exportar`
              )}
            </p>
            <p className="text-sm text-gris-medio">
              Incluye empresa, contacto, scores por dimensión, arquetipo y
              nivel de innovación, con colores por nivel para lectura rápida.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={exportar}
          disabled={cargando || exportando || filtrados.length === 0}
          className="flex shrink-0 items-center gap-2 rounded-full bg-rojo-brillante px-6 py-3 text-sm font-medium text-off-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exportando ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          )}
          Exportar a Excel (.xlsx)
        </button>
      </div>
    </div>
  );
}
