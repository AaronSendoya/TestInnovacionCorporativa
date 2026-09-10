"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import {
  obtenerDiagnosticos,
  type CursorPagina,
  type DiagnosticoAdmin,
} from "@/services/adminDiagnosticos";
import DetalleDiagnosticoModal from "@/components/admin/DetalleDiagnosticoModal";

const TAMANOS_PAGINA = [10, 50, 100];

export default function RegistrosTabla() {
  const [tamanoPagina, setTamanoPagina] = useState(10);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaActiva, setBusquedaActiva] = useState("");
  const [cursorStack, setCursorStack] = useState<(CursorPagina | null)[]>([]);
  const [cursorActual, setCursorActual] = useState<CursorPagina | null>(null);
  const [registros, setRegistros] = useState<DiagnosticoAdmin[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<DiagnosticoAdmin | null>(
    null
  );

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const pagina = await obtenerDiagnosticos({
          limite: tamanoPagina,
          busqueda: busquedaActiva || undefined,
          cursor: cursorActual,
        });
        if (cancelado) return;
        setRegistros(pagina.diagnosticos);
        setHasMore(pagina.hasMore);
        setTotal(pagina.total);
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
  }, [tamanoPagina, busquedaActiva, cursorActual]);

  function irSiguiente() {
    if (!hasMore || registros.length === 0) return;
    const ultimo = registros[registros.length - 1];
    setCursorStack((pila) => [...pila, cursorActual]);
    setCursorActual({ creadoEn: ultimo.creadoEn, id: ultimo.id });
  }

  function irAnterior() {
    setCursorStack((pila) => {
      if (pila.length === 0) return pila;
      const nuevaPila = pila.slice(0, -1);
      setCursorActual(pila[pila.length - 1]);
      return nuevaPila;
    });
  }

  function cambiarTamanoPagina(nuevo: number) {
    setTamanoPagina(nuevo);
    setCursorStack([]);
    setCursorActual(null);
  }

  function ejecutarBusqueda(evento: React.FormEvent) {
    evento.preventDefault();
    setBusquedaActiva(busquedaInput.trim());
    setCursorStack([]);
    setCursorActual(null);
  }

  const paginaActual = cursorStack.length + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));
  const desde = total === 0 ? 0 : (paginaActual - 1) * tamanoPagina + 1;
  const hasta = desde + registros.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-gris-oscuro">Registros</h1>
        <p className="text-sm text-gris-medio">
          {total} diagnósticos · haz clic en una fila para ver el detalle
          completo.
        </p>
      </div>

      <form onSubmit={ejecutarBusqueda} className="relative flex max-w-sm items-center">
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4 text-gris-medio"
          aria-hidden="true"
        />
        <input
          type="text"
          value={busquedaInput}
          onChange={(evento) => setBusquedaInput(evento.target.value)}
          placeholder="Buscar por nombre de empresa (Enter)..."
          className="w-full rounded-lg border border-gris-medio py-2 pl-9 pr-3 text-sm text-gris-oscuro outline-none focus:border-azul focus:ring-2 focus:ring-azul/30"
        />
      </form>

      {error && (
        <div className="rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-4 py-3 text-sm text-rojo-oscuro">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gris-verde/40 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-off-white text-gris-oscuro">
            <tr>
              <th className="px-4 py-3 font-heading font-normal">Empresa</th>
              <th className="px-4 py-3 font-heading font-normal">Contacto</th>
              <th className="px-4 py-3 font-heading font-normal">Sector</th>
              <th className="px-4 py-3 font-heading font-normal">Score</th>
              <th className="px-4 py-3 font-heading font-normal">
                Arquetipo
              </th>
              <th className="px-4 py-3 font-heading font-normal">
                Fecha y hora
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gris-medio">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Cargando diagnósticos...
                  </span>
                </td>
              </tr>
            ) : registros.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-gris-medio"
                >
                  No hay diagnósticos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              registros.map((registro) => {
                const fecha = registro.creadoEn
                  ? new Date(registro.creadoEn)
                  : null;
                return (
                  <tr
                    key={registro.id}
                    onClick={() => setSeleccionado(registro)}
                    className="cursor-pointer border-t border-gris-verde/20 transition-colors hover:bg-rojo-brillante/5"
                  >
                    <td className="px-4 py-3 font-medium text-gris-oscuro">
                      {registro.empresa?.nombre ?? "Sin especificar"}
                    </td>
                    <td className="px-4 py-3 text-gris-oscuro">
                      {registro.perfil?.nombre ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gris-medio">
                      {registro.empresa?.sector ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-rojo-brillante">
                      {registro.scoreTotal100 ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gris-oscuro">
                      {registro.arquetipo ?? "-"}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-gris-verde">
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
            onChange={(evento) => cambiarTamanoPagina(Number(evento.target.value))}
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
          · Página {paginaActual} de {totalPaginas}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={irAnterior}
            disabled={cursorStack.length === 0 || cargando}
            className="flex items-center gap-1 rounded-full border border-gris-medio px-4 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </button>
          <button
            type="button"
            onClick={irSiguiente}
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
    </div>
  );
}
