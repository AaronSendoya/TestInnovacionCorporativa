"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Search,
  X,
} from "lucide-react";
import {
  obtenerDiagnosticos,
  type DiagnosticoAdmin,
} from "@/services/adminDiagnosticos";
import {
  CLASES_BADGE_NIVEL,
  COLOR_NIVEL,
  PALETA_ACENTOS,
  SECTORES,
  fechaLocalYMD,
  nivelDeScoreTotal,
  sectorDe,
} from "@/lib/dimensiones";
import { generarLibroExcelRegistros } from "@/lib/exportarExcel";

const TAMANO_VISTA_PREVIA = 25;
const TAMANO_LOTE_EXPORTACION = 200;
const LIMITE_MAXIMO_EXPORTACION = 5000;
const DEMORA_DEBOUNCE_MS = 350;

function inicialDe(nombre?: string): string {
  return nombre?.trim()?.[0]?.toUpperCase() ?? "?";
}

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
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [sectorFiltro, setSectorFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagina, setPagina] = useState(1);

  const [registros, setRegistros] = useState<DiagnosticoAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [yaCargoUnaVez, setYaCargoUnaVez] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exportando, setExportando] = useState(false);
  const [progresoExportacion, setProgresoExportacion] = useState(0);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusqueda(busquedaInput.trim());
      setPagina(1);
    }, DEMORA_DEBOUNCE_MS);
    return () => clearTimeout(temporizador);
  }, [busquedaInput]);

  const errorFechas =
    fechaDesde && fechaHasta && fechaDesde > fechaHasta
      ? "La fecha 'Desde' no puede ser posterior a 'Hasta'."
      : null;

  // Firestore no permite combinar en una consulta un rango de fechas con la
  // busqueda de texto (serian dos filtros de rango en campos distintos).
  const fechaDeshabilitada = Boolean(busquedaInput.trim());
  const busquedaDeshabilitada = Boolean(fechaDesde || fechaHasta);

  // Solo trae una vista previa acotada del servidor: nunca descarga todos
  // los diagnosticos para abrir esta seccion (eso es lo que se optimiza).
  useEffect(() => {
    if (!activo && !yaCargoUnaVez) return;

    let cancelado = false;
    async function cargar() {
      setCargando(true);
      if (!yaCargoUnaVez) setError(null);
      try {
        const respuesta = await obtenerDiagnosticos({
          pagina,
          tamanoPagina: TAMANO_VISTA_PREVIA,
          busqueda: busquedaDeshabilitada ? "" : busqueda,
          sector: sectorFiltro,
          fechaDesde: fechaDeshabilitada ? "" : fechaDesde,
          fechaHasta: fechaDeshabilitada ? "" : fechaHasta,
        });
        if (cancelado) return;
        setRegistros(respuesta.diagnosticos);
        setTotal(respuesta.total);
        setHasMore(respuesta.hasMore);
        setError(null);
      } catch (err) {
        if (cancelado) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar diagnósticos."
        );
      } finally {
        if (!cancelado) {
          setCargando(false);
          setYaCargoUnaVez(true);
        }
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activo,
    pagina,
    busqueda,
    sectorFiltro,
    fechaDesde,
    fechaHasta,
    busquedaDeshabilitada,
    fechaDeshabilitada,
  ]);

  const hayFiltrosActivos = Boolean(
    busquedaInput.trim() || sectorFiltro || fechaDesde || fechaHasta
  );

  function limpiarFiltros() {
    setBusquedaInput("");
    setBusqueda("");
    setSectorFiltro("");
    setFechaDesde("");
    setFechaHasta("");
    setPagina(1);
  }

  async function exportar() {
    setExportando(true);
    setErrorExportar(null);
    setProgresoExportacion(0);
    try {
      if (total > LIMITE_MAXIMO_EXPORTACION) {
        throw new Error(
          `Hay ${total} diagnósticos que coinciden con estos filtros. Afina la búsqueda a menos de ${LIMITE_MAXIMO_EXPORTACION} para exportar.`
        );
      }

      const todosLosCoincidentes: DiagnosticoAdmin[] = [];
      let paginaLote = 1;
      let siguienteHasMore = true;
      while (siguienteHasMore) {
        const respuesta = await obtenerDiagnosticos({
          pagina: paginaLote,
          tamanoPagina: TAMANO_LOTE_EXPORTACION,
          busqueda: busquedaDeshabilitada ? "" : busqueda,
          sector: sectorFiltro,
          fechaDesde: fechaDeshabilitada ? "" : fechaDesde,
          fechaHasta: fechaDeshabilitada ? "" : fechaHasta,
        });
        todosLosCoincidentes.push(...respuesta.diagnosticos);
        setProgresoExportacion(todosLosCoincidentes.length);
        siguienteHasMore = respuesta.hasMore;
        paginaLote += 1;
      }

      const blob = await generarLibroExcelRegistros(todosLosCoincidentes);
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

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANO_VISTA_PREVIA));
  const desde = total === 0 ? 0 : (pagina - 1) * TAMANO_VISTA_PREVIA + 1;
  const hasta = Math.min(desde + registros.length - 1, total);
  const mostrarEsqueletoInicial = cargando && !yaCargoUnaVez;

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
              value={busquedaInput}
              disabled={busquedaDeshabilitada}
              onChange={(evento) => setBusquedaInput(evento.target.value)}
              placeholder="Buscar por empresa o contacto..."
              title={
                busquedaDeshabilitada
                  ? "No se puede combinar con el filtro de fecha"
                  : undefined
              }
              className="w-full rounded-full border border-gris-verde/40 bg-off-white py-2.5 pl-9 pr-3 text-sm text-gris-oscuro outline-none transition-colors focus:border-azul focus:bg-white focus:ring-2 focus:ring-azul/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <Building2
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-medio"
              aria-hidden="true"
            />
            <select
              value={sectorFiltro}
              onChange={(evento) => {
                setSectorFiltro(evento.target.value);
                setPagina(1);
              }}
              aria-label="Filtrar por sector"
              className="rounded-full border border-gris-verde/40 bg-off-white py-2.5 pl-9 pr-8 text-sm text-gris-oscuro outline-none transition-colors focus:border-azul focus:bg-white focus:ring-2 focus:ring-azul/20"
            >
              <option value="">Todos los sectores</option>
              {SECTORES.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div
            className="flex items-center gap-2 rounded-full border border-gris-verde/40 bg-off-white py-1.5 pl-3 pr-2 text-sm has-[:disabled]:opacity-50"
            title={
              fechaDeshabilitada
                ? "No se puede combinar con la búsqueda de texto"
                : undefined
            }
          >
            <CalendarRange
              className="h-4 w-4 shrink-0 text-gris-medio"
              aria-hidden="true"
            />
            <input
              type="date"
              value={fechaDesde}
              disabled={fechaDeshabilitada}
              onChange={(evento) => {
                setFechaDesde(evento.target.value);
                setPagina(1);
              }}
              aria-label="Fecha desde"
              className="bg-transparent text-gris-oscuro outline-none disabled:cursor-not-allowed"
            />
            <span className="text-gris-medio">–</span>
            <input
              type="date"
              value={fechaHasta}
              disabled={fechaDeshabilitada}
              onChange={(evento) => {
                setFechaHasta(evento.target.value);
                setPagina(1);
              }}
              aria-label="Fecha hasta"
              className="bg-transparent text-gris-oscuro outline-none disabled:cursor-not-allowed"
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
        {(fechaDeshabilitada || busquedaDeshabilitada) && (
          <p className="text-xs text-gris-medio">
            La búsqueda por texto y el filtro de fecha no se pueden combinar.
            Sector sí se puede combinar con cualquiera de los dos.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-4 py-3 text-sm text-rojo-oscuro">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-gris-verde/40 bg-white shadow-sm">
        <div className="px-5 pt-4">
          <p className="text-sm font-medium text-gris-oscuro">
            Registros que se incluirán en el archivo
          </p>
        </div>

        <div className="relative overflow-x-auto">
          {cargando && yaCargoUnaVez && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-8">
              <Loader2 className="h-5 w-5 animate-spin text-azul" aria-hidden="true" />
            </div>
          )}
          <table
            className={`w-full min-w-[680px] text-left text-sm transition-opacity ${
              cargando && yaCargoUnaVez ? "opacity-50" : "opacity-100"
            }`}
          >
            <thead>
              <tr className="border-b border-gris-verde/30 bg-off-white">
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Empresa
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Contacto
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Sector
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Score
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Arquetipo
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {mostrarEsqueletoInicial ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gris-medio"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Cargando diagnósticos...
                    </span>
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <p className="text-gris-medio">
                      Ningún diagnóstico coincide con estos filtros.
                    </p>
                    {hayFiltrosActivos && (
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="mt-2 text-sm font-medium text-azul hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                registros.map((registro, indice) => {
                  const fecha = registro.creadoEn
                    ? new Date(registro.creadoEn)
                    : null;
                  const nivel = nivelDeScoreTotal(registro.scoreTotal100 ?? 0);
                  const acento = PALETA_ACENTOS[indice % PALETA_ACENTOS.length];
                  return (
                    <tr
                      key={registro.id}
                      style={{ borderLeftColor: COLOR_NIVEL[nivel] ?? "#A4A49B" }}
                      className="border-b border-l-4 border-gris-verde/15 last:border-b-0"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading text-xs font-semibold ${acento.tint} ${acento.text}`}
                          >
                            {inicialDe(registro.empresa?.nombre)}
                          </span>
                          <span className="font-medium text-gris-oscuro">
                            {registro.empresa?.nombre ?? "Sin especificar"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gris-oscuro">
                        {registro.perfil?.nombre ?? "-"}
                      </td>
                      <td className="px-5 py-3 text-gris-medio">
                        {sectorDe(registro) ?? "-"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            CLASES_BADGE_NIVEL[nivel] ??
                            "bg-gris-verde/20 text-gris-medio"
                          }`}
                        >
                          {registro.scoreTotal100 ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block rounded-full border border-gris-verde/40 bg-off-white px-2.5 py-1 text-xs font-medium text-gris-oscuro">
                          {registro.arquetipo ?? "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gris-medio">
                        {fecha ? fecha.toLocaleDateString("es-ES") : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gris-verde/20 px-5 py-3 sm:flex-row">
            <p className="text-xs text-gris-medio">
              Mostrando {desde}–{hasta} de {total} · Página {pagina} de{" "}
              {totalPaginas}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                disabled={pagina <= 1 || cargando}
                className="flex items-center gap-1 rounded-full border border-gris-medio px-3 py-1.5 text-xs font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPagina((actual) => actual + 1)}
                disabled={!hasMore || cargando}
                className="flex items-center gap-1 rounded-full border border-gris-medio px-3 py-1.5 text-xs font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

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
              {exportando ? (
                <span className="inline-flex items-center gap-2 text-gris-medio">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Preparando archivo... {progresoExportacion} de {total}
                </span>
              ) : (
                `${total} diagnóstico${total === 1 ? "" : "s"} listo${
                  total === 1 ? "" : "s"
                } para exportar`
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
          disabled={cargando || exportando || total === 0}
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
