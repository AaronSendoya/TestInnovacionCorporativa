"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Building2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  eliminarDiagnostico,
  obtenerDiagnosticos,
  type DiagnosticoAdmin,
} from "@/services/adminDiagnosticos";
import {
  CLASES_BADGE_NIVEL,
  COLOR_NIVEL,
  PALETA_ACENTOS,
  SECTORES,
  nivelDeScoreTotal,
  sectorDe,
} from "@/lib/dimensiones";
import DetalleDiagnosticoModal from "@/components/admin/DetalleDiagnosticoModal";

const TAMANOS_PAGINA = [10, 50, 100];
const DEMORA_DEBOUNCE_MS = 350;

function inicialDe(nombre?: string): string {
  return nombre?.trim()?.[0]?.toUpperCase() ?? "?";
}

interface RegistrosTablaProps {
  activo?: boolean;
}

export default function RegistrosTabla({ activo = true }: RegistrosTablaProps) {
  const [tamanoPagina, setTamanoPagina] = useState(10);
  const [pagina, setPagina] = useState(1);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [sectorFiltro, setSectorFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [registros, setRegistros] = useState<DiagnosticoAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [yaCargoUnaVez, setYaCargoUnaVez] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [seleccionado, setSeleccionado] = useState<DiagnosticoAdmin | null>(
    null
  );
  const [aEliminar, setAEliminar] = useState<DiagnosticoAdmin | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [recargaTick, setRecargaTick] = useState(0);

  // La tabla se mantiene montada al cambiar de seccion (evita recargar
  // datos y repetir animaciones); si el usuario navega fuera con un
  // modal abierto, hay que cerrarlo porque el modal usa un portal a
  // document.body y no se ocultaria junto con el resto de esta vista.
  // Se ajusta durante el render (no en un efecto) siguiendo el patron
  // recomendado por React para resetear estado cuando cambia un prop.
  const [activoPrevio, setActivoPrevio] = useState(activo);
  if (activo !== activoPrevio) {
    setActivoPrevio(activo);
    if (!activo) {
      setSeleccionado(null);
      setAEliminar(null);
    }
  }

  // Debounce de la busqueda de texto: evita disparar una consulta a
  // Firestore en cada tecla presionada.
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

  // Firestore no permite combinar en una sola consulta un rango de fechas
  // con la busqueda de texto (serian dos filtros de rango en campos
  // distintos), asi que se excluyen mutuamente: al activar uno se
  // deshabilita el otro en vez de ignorarlo en silencio.
  const fechaDeshabilitada = Boolean(busquedaInput.trim());
  const busquedaDeshabilitada = Boolean(fechaDesde || fechaHasta);

  // Se ejecuta solo cuando la seccion esta o estuvo activa alguna vez:
  // evita leer Firestore para vistas que el admin nunca abrio en la sesion.
  useEffect(() => {
    if (!activo && !yaCargoUnaVez) return;

    let cancelado = false;
    async function cargar() {
      setCargando(true);
      if (!yaCargoUnaVez) setError(null);
      try {
        const respuesta = await obtenerDiagnosticos({
          pagina,
          tamanoPagina,
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
    tamanoPagina,
    busqueda,
    sectorFiltro,
    fechaDesde,
    fechaHasta,
    busquedaDeshabilitada,
    fechaDeshabilitada,
    recargaTick,
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

  function actualizarSector(valor: string) {
    setSectorFiltro(valor);
    setPagina(1);
  }

  function actualizarFechaDesde(valor: string) {
    setFechaDesde(valor);
    setPagina(1);
  }

  function actualizarFechaHasta(valor: string) {
    setFechaHasta(valor);
    setPagina(1);
  }

  function actualizarTamanoPagina(valor: number) {
    setTamanoPagina(valor);
    setPagina(1);
  }

  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));
  const desde = total === 0 ? 0 : (pagina - 1) * tamanoPagina + 1;
  const hasta = Math.min(desde + registros.length - 1, total);

  async function confirmarEliminacion() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminarDiagnostico(aEliminar.id);
      setAEliminar(null);
      // Vuelve a pedir la pagina actual al servidor: tras borrar, puede
      // quedar con menos filas de las esperadas (o vacia).
      setRecargaTick((actual) => actual + 1);
    } catch (err) {
      setErrorEliminar(
        err instanceof Error ? err.message : "No se pudo eliminar el diagnóstico."
      );
    } finally {
      setEliminando(false);
    }
  }

  const mostrarEsqueletoInicial = cargando && !yaCargoUnaVez;

  return (
    <div className="animate-entrada flex flex-col gap-5">
      <p className="text-sm text-gris-medio">
        {hayFiltrosActivos
          ? `${total} diagnóstico${total === 1 ? "" : "s"} coinciden con los filtros.`
          : `${total} diagnóstico${total === 1 ? "" : "s"} · haz clic en una fila para ver el detalle completo.`}
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
              onChange={(evento) => actualizarSector(evento.target.value)}
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
              onChange={(evento) => actualizarFechaDesde(evento.target.value)}
              aria-label="Fecha desde"
              className="bg-transparent text-gris-oscuro outline-none disabled:cursor-not-allowed"
            />
            <span className="text-gris-medio">–</span>
            <input
              type="date"
              value={fechaHasta}
              disabled={fechaDeshabilitada}
              onChange={(evento) => actualizarFechaHasta(evento.target.value)}
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

      <div className="relative overflow-x-auto rounded-2xl border border-gris-verde/40 bg-white shadow-sm">
        {cargando && yaCargoUnaVez && (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-10">
            <Loader2 className="h-5 w-5 animate-spin text-azul" aria-hidden="true" />
          </div>
        )}
        <table
          className={`w-full min-w-[760px] text-left text-sm transition-opacity ${
            cargando && yaCargoUnaVez ? "opacity-50" : "opacity-100"
          }`}
        >
          <thead>
            <tr className="border-b border-gris-verde/30 bg-off-white">
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Empresa
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Contacto
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Sector
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Score
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Arquetipo
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Fecha y hora
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {mostrarEsqueletoInicial ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gris-medio">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Cargando diagnósticos...
                  </span>
                </td>
              </tr>
            ) : registros.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
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
                    onClick={() => setSeleccionado(registro)}
                    style={{ borderLeftColor: COLOR_NIVEL[nivel] ?? "#A4A49B" }}
                    className="cursor-pointer border-b border-l-4 border-gris-verde/15 transition-colors last:border-b-0 hover:bg-off-white"
                  >
                    <td className="px-5 py-3.5">
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
                    <td className="px-5 py-3.5 text-gris-oscuro">
                      {registro.perfil?.nombre ?? "-"}
                    </td>
                    <td className="px-5 py-3.5 text-gris-medio">
                      {sectorDe(registro) ?? "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          CLASES_BADGE_NIVEL[nivel] ??
                          "bg-gris-verde/20 text-gris-medio"
                        }`}
                      >
                        {registro.scoreTotal100 ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded-full border border-gris-verde/40 bg-off-white px-2.5 py-1 text-xs font-medium text-gris-oscuro">
                        {registro.arquetipo ?? "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {fecha ? (
                        <div className="flex flex-col">
                          <span className="text-gris-oscuro">
                            {fecha.toLocaleDateString("es-ES")}
                          </span>
                          <span className="text-xs text-gris-medio">
                            {fecha.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(evento) => {
                            evento.stopPropagation();
                            setErrorEliminar(null);
                            setAEliminar(registro);
                          }}
                          aria-label={`Eliminar diagnóstico de ${
                            registro.empresa?.nombre ?? "esta empresa"
                          }`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gris-verde transition-colors duration-200 hover:bg-rojo-oscuro/10 hover:text-rojo-oscuro"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <ChevronRight
                          className="h-4 w-4 text-gris-verde"
                          aria-hidden="true"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-gris-medio">
          <label htmlFor="tamano-pagina" className="whitespace-nowrap">
            Registros por página:
          </label>
          <select
            id="tamano-pagina"
            value={tamanoPagina}
            onChange={(evento) => actualizarTamanoPagina(Number(evento.target.value))}
            className="rounded-lg border border-gris-medio px-2 py-1.5 text-sm text-gris-oscuro outline-none focus:border-azul"
          >
            {TAMANOS_PAGINA.map((tamano) => (
              <option key={tamano} value={tamano}>
                {tamano}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gris-medio">
          {total === 0
            ? "0 resultados"
            : `Mostrando ${desde}–${hasta} de ${total}`}{" "}
          · Página {pagina} de {totalPaginas}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
            disabled={pagina <= 1 || cargando}
            className="flex items-center gap-1 rounded-full border border-gris-medio px-4 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPagina((actual) => actual + 1)}
            disabled={!hasMore || cargando}
            className="flex items-center gap-1 rounded-full border border-gris-medio px-4 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {seleccionado && (
        <DetalleDiagnosticoModal
          registro={seleccionado}
          onCerrar={() => setSeleccionado(null)}
        />
      )}

      {/* Portal a document.body: este contenedor tiene animate-entrada, cuya
          animacion deja un transform activo (fill-mode both) que rompe el
          centrado de position:fixed si el modal se anida dentro. */}
      {aEliminar &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gris-oscuro/55 p-4"
            onClick={() => !eliminando && setAEliminar(null)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rojo-oscuro/10 text-rojo-oscuro">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-heading text-lg text-gris-oscuro">
                    Eliminar diagnóstico
                  </h2>
                  <p className="mt-1 text-sm text-gris-medio">
                    Se eliminará permanentemente el diagnóstico de{" "}
                    <span className="font-semibold text-gris-oscuro">
                      {aEliminar.empresa?.nombre ?? "esta empresa"}
                    </span>{" "}
                    ({aEliminar.perfil?.nombre ?? "sin contacto"}). Esta
                    acción no se puede deshacer.
                  </p>
                </div>
              </div>

              {errorEliminar && (
                <p className="rounded-lg bg-rojo-oscuro/10 px-3 py-2 text-xs text-rojo-oscuro">
                  {errorEliminar}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAEliminar(null)}
                  disabled={eliminando}
                  className="rounded-full border border-gris-medio px-4 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarEliminacion}
                  disabled={eliminando}
                  className="flex items-center gap-2 rounded-full bg-rojo-oscuro px-4 py-2 text-sm font-medium text-off-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {eliminando ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
