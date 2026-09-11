"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertOctagon,
  Award,
  Building2,
  ClipboardList,
  Lightbulb,
  Loader2,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DiagnosticoAdmin } from "@/services/adminDiagnosticos";
import { obtenerDiagnosticos } from "@/services/adminDiagnosticos";
import {
  CLASES_BADGE_NIVEL,
  COLOR_NIVEL,
  ETIQUETAS_DIMENSION,
  ICONOS_DIMENSION,
  ORDEN_DIMENSIONES,
  PALETA_ACENTOS,
} from "@/lib/dimensiones";
import GaugeMadurez from "@/components/admin/GaugeMadurez";
import RadarTickDimension from "@/components/RadarTickDimension";
import DetalleDiagnosticoModal from "@/components/admin/DetalleDiagnosticoModal";
import type { SeccionAdmin } from "@/components/admin/AdminSidebar";

const LIMITE_RESUMEN = 500;

const RANGOS_SCORE = [
  { min: 0, max: 20, etiqueta: "0-20" },
  { min: 21, max: 40, etiqueta: "21-40" },
  { min: 41, max: 60, etiqueta: "41-60" },
  { min: 61, max: 80, etiqueta: "61-80" },
  { min: 81, max: 100, etiqueta: "81-100" },
];

function nivelDeScore(score: number): string {
  if (score >= 3) return "Alto";
  if (score >= 2) return "Medio";
  return "Bajo";
}

function nivelDeScoreTotal(score: number): string {
  if (score >= 75) return "Alto";
  if (score >= 50) return "Medio";
  return "Bajo";
}

function nivelNarrativo(score: number): string {
  if (score <= 20) return "inicial";
  if (score <= 40) return "temprano";
  if (score <= 60) return "intermedio";
  if (score <= 80) return "avanzado";
  return "de excelencia";
}

type SeccionEnfocable = Exclude<SeccionAdmin, "resumen" | "registros">;

interface ResumenGeneralProps {
  seccionEnfocada?: SeccionEnfocable | null;
  navKey?: number;
  onVerRegistros?: () => void;
}

export default function ResumenGeneral({
  seccionEnfocada = null,
  navKey = 0,
  onVerRegistros,
}: ResumenGeneralProps) {
  const [registros, setRegistros] = useState<DiagnosticoAdmin[]>([]);
  const [totalReal, setTotalReal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresaEvolucion, setEmpresaEvolucion] = useState("");
  const [seleccionado, setSeleccionado] = useState<DiagnosticoAdmin | null>(
    null
  );

  useEffect(() => {
    async function cargar() {
      try {
        const pagina = await obtenerDiagnosticos({ limite: LIMITE_RESUMEN });
        setRegistros(pagina.diagnosticos);
        setTotalReal(pagina.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar diagnósticos."
        );
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  useEffect(() => {
    if (!seccionEnfocada || cargando) return;
    const elemento = document.getElementById(`resumen-${seccionEnfocada}`);
    elemento?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [seccionEnfocada, navKey, cargando]);

  const datos = useMemo(() => {
    if (registros.length === 0) {
      return null;
    }

    const total = registros.length;
    const empresasUnicas = new Set(
      registros.map((r) => r.empresa?.nombre)
    ).size;
    const madurezPromedio = Math.round(
      registros.reduce((acc, r) => acc + (r.scoreTotal100 ?? 0), 0) / total
    );

    const conteoArquetipos = new Map<string, number>();
    registros.forEach((r) => {
      const arquetipo = r.arquetipo ?? "Sin clasificar";
      conteoArquetipos.set(
        arquetipo,
        (conteoArquetipos.get(arquetipo) ?? 0) + 1
      );
    });
    const arquetiposOrdenados = [...conteoArquetipos.entries()].sort(
      (a, b) => b[1] - a[1]
    );
    const maxArquetipoCant = arquetiposOrdenados[0]?.[1] ?? 1;

    const conteoNiveles = new Map<string, number>();
    registros.forEach((r) => {
      const nivel = r.nivelInnovacion ?? "Sin clasificar";
      conteoNiveles.set(nivel, (conteoNiveles.get(nivel) ?? 0) + 1);
    });
    const nivelesOrdenados = [...conteoNiveles.entries()].sort(
      (a, b) => b[1] - a[1]
    );
    const nivelInnovacionFrecuente = nivelesOrdenados[0]?.[0] ?? "-";

    const conteoCriticas = new Map<string, number>();
    registros.forEach((r) => {
      const dim = r.dimensionCritica;
      conteoCriticas.set(dim, (conteoCriticas.get(dim) ?? 0) + 1);
    });
    const criticasOrdenadas = [...conteoCriticas.entries()].sort(
      (a, b) => b[1] - a[1]
    );
    const dimensionCriticaFrecuente = criticasOrdenadas[0]?.[0];

    const promediosDim: Record<string, number> = {};
    ORDEN_DIMENSIONES.forEach((clave) => {
      const suma = registros.reduce(
        (acc, r) => acc + (r.scoresPorDimension[clave] ?? 0),
        0
      );
      promediosDim[clave] = Math.round((suma / total) * 100) / 100;
    });

    const dimensionesRankeadas = ORDEN_DIMENSIONES.map((clave) => ({
      clave,
      etiqueta: ETIQUETAS_DIMENSION[clave],
      promedio: promediosDim[clave],
    })).sort((a, b) => b.promedio - a.promedio);

    const principalFortaleza = dimensionesRankeadas[0];
    const principalOportunidad =
      dimensionesRankeadas[dimensionesRankeadas.length - 1];

    const dimensionesDebiles = dimensionesRankeadas
      .slice(-2)
      .reverse()
      .map((d) => ({
        ...d,
        frecuenciaCritica: conteoCriticas.get(d.clave) ?? 0,
      }));

    const empresasCriticas = [...registros]
      .filter((r) => (r.scoreTotal100 ?? 0) < 50)
      .sort((a, b) => (a.scoreTotal100 ?? 0) - (b.scoreTotal100 ?? 0))
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        nombre: r.empresa?.nombre ?? "Sin especificar",
        score: r.scoreTotal100 ?? 0,
      }));

    const ultimosDiagnosticos = [...registros]
      .filter((r) => r.creadoEn)
      .sort(
        (a, b) =>
          new Date(b.creadoEn as string).getTime() -
          new Date(a.creadoEn as string).getTime()
      )
      .slice(0, 6);

    const datosRadar = ORDEN_DIMENSIONES.map((clave) => ({
      dimension: ETIQUETAS_DIMENSION[clave],
      score: promediosDim[clave],
    }));

    const distribucionMadurez = RANGOS_SCORE.map((rango, indice) => {
      const cantidad = registros.filter(
        (r) =>
          (r.scoreTotal100 ?? 0) >= rango.min &&
          (r.scoreTotal100 ?? 0) <= rango.max
      ).length;
      return {
        rango: rango.etiqueta,
        cantidad,
        color: `rgba(254, 40, 0, ${0.28 + indice * 0.18})`,
      };
    });

    const distribucionArquetipos = arquetiposOrdenados.map(
      ([nombre, cantidad], indice) => ({
        arquetipo: nombre,
        cantidad,
        pct: (cantidad / maxArquetipoCant) * 100,
        color: PALETA_ACENTOS[indice % PALETA_ACENTOS.length].hex,
      })
    );

    const matrizPrioridad = ORDEN_DIMENSIONES.map((clave) => {
      const freq = conteoCriticas.get(clave) ?? 0;
      const impacto = Math.round((freq / total) * 100);
      const esfuerzo = Math.round(100 - (promediosDim[clave] / 4) * 100);
      return { x: esfuerzo, y: impacto, name: ETIQUETAS_DIMENSION[clave] };
    });

    return {
      total,
      empresasUnicas,
      madurezPromedio,
      arquetipoFrecuente: arquetiposOrdenados[0]?.[0] ?? "-",
      arquetipoFrecuentePct: Math.round(
        ((arquetiposOrdenados[0]?.[1] ?? 0) / total) * 100
      ),
      dimensionCriticaFrecuente: dimensionCriticaFrecuente
        ? ETIQUETAS_DIMENSION[dimensionCriticaFrecuente]
        : "-",
      dimensionCriticaFrecuenteCant: criticasOrdenadas[0]?.[1] ?? 0,
      nivelInnovacionFrecuente,
      dimensionesRankeadas,
      principalFortaleza,
      principalOportunidad,
      dimensionesDebiles,
      empresasCriticas,
      ultimosDiagnosticos,
      datosRadar,
      distribucionMadurez,
      distribucionArquetipos,
      matrizPrioridad,
    };
  }, [registros]);

  const empresasEvolucion = useMemo(() => {
    const nombres = new Set(
      registros
        .map((r) => r.empresa?.nombre?.trim())
        .filter((nombre): nombre is string => Boolean(nombre))
    );
    return [...nombres].sort((a, b) => a.localeCompare(b, "es"));
  }, [registros]);

  const evolucion = useMemo(() => {
    const registrosFiltrados = empresaEvolucion
      ? registros.filter((r) => r.empresa?.nombre === empresaEvolucion)
      : registros;

    return [...registrosFiltrados]
      .filter((r) => r.creadoEn)
      .sort(
        (a, b) =>
          new Date(a.creadoEn as string).getTime() -
          new Date(b.creadoEn as string).getTime()
      )
      .map((r, indice) => ({
        indice: indice + 1,
        fecha: new Date(r.creadoEn as string).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
        }),
        score: r.scoreTotal100 ?? 0,
      }));
  }, [registros, empresaEvolucion]);

  const tendenciaEvolucion =
    evolucion.length >= 2
      ? evolucion[evolucion.length - 1].score - evolucion[0].score
      : null;

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-gris-medio">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Cargando resumen...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-4 py-3 text-sm text-rojo-oscuro">
        {error}
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-gris-verde/40 bg-white p-12 text-center">
        <p className="font-heading text-lg text-gris-oscuro">
          Aún no hay diagnósticos registrados
        </p>
        <p className="text-sm text-gris-medio">
          En cuanto se envíen respuestas desde el cuestionario, aquí verás el
          resumen agregado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-gris-medio">
        Vista agregada de {datos.total} diagnósticos registrados.
        {totalReal > registros.length && (
          <>
            {" "}
            Mostrando los {registros.length} más recientes de {totalReal}{" "}
            totales.
          </>
        )}
      </p>

      <section
        className="animate-entrada flex flex-col gap-5"
        style={{ animationDelay: "0ms" }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-gris-verde/40 bg-white p-4 transition-shadow duration-200 hover:shadow-md">
            <span
              className="absolute inset-x-0 top-0 h-1 bg-rojo-brillante"
              aria-hidden="true"
            />
            <GaugeMadurez valor={datos.madurezPromedio} tamano={92} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-rojo-brillante">
                Madurez promedio
              </p>
              <p className="font-heading text-2xl text-gris-oscuro">
                {datos.madurezPromedio}
                <span className="text-sm font-normal text-gris-medio">
                  /100
                </span>
              </p>
            </div>
          </div>

          <StatCard
            icono={ClipboardList}
            acentoIndice={1}
            etiqueta="Diagnósticos"
            valor={datos.total}
            detalle={`${datos.empresasUnicas} empresas evaluadas`}
          />
          <StatCard
            icono={Award}
            acentoIndice={2}
            etiqueta="Arquetipo más frecuente"
            valor={datos.arquetipoFrecuente}
            valorPequeno
            detalle={`${datos.arquetipoFrecuentePct}% de los casos`}
          />
          <StatCard
            icono={AlertOctagon}
            acentoIndice={3}
            etiqueta="Dimensión más crítica"
            valor={datos.dimensionCriticaFrecuente}
            valorPequeno
            detalle={`Bloqueador en ${datos.dimensionCriticaFrecuenteCant} de ${datos.total} empresas`}
          />
        </div>

        <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h2 className="mb-4 font-heading text-lg text-gris-oscuro">
            Estado de innovación
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <InsightItem
              etiqueta="Nivel general"
              texto={`Madurez promedio en nivel ${nivelNarrativo(
                datos.madurezPromedio
              )}. Nivel de innovación predominante: ${datos.nivelInnovacionFrecuente}.`}
            />
            <InsightItem
              etiqueta="Principal fortaleza"
              texto={`${datos.principalFortaleza.etiqueta} (${datos.principalFortaleza.promedio.toFixed(
                1
              )}/4) es la dimensión mejor desarrollada en promedio.`}
              tono="positivo"
            />
            <InsightItem
              etiqueta="Principal oportunidad"
              texto={`${datos.principalOportunidad.etiqueta} (${datos.principalOportunidad.promedio.toFixed(
                1
              )}/4) concentra el mayor espacio de mejora.`}
              tono="atencion"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-1 font-heading text-base text-gris-oscuro">
              Distribución de madurez
            </h3>
            <p className="mb-3 text-xs text-gris-medio">
              Cantidad de empresas por rango de score.
            </p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datos.distribucionMadurez}>
                  <CartesianGrid stroke="#EEEEE8" vertical={false} />
                  <XAxis
                    dataKey="rango"
                    tick={{ fill: "#425051", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#676E69", fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(valor) => [valor, "Empresas"]}
                    labelFormatter={(etiqueta) => `Score ${etiqueta}`}
                  />
                  <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} barSize={44}>
                    {datos.distribucionMadurez.map((fila) => (
                      <Cell key={fila.rango} fill={fila.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-1 font-heading text-base text-gris-oscuro">
              Distribución por arquetipo
            </h3>
            <p className="mb-3 text-xs text-gris-medio">
              Cantidad de empresas por arquetipo asignado.
            </p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datos.distribucionArquetipos}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: "#676E69", fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="arquetipo"
                    width={150}
                    tick={{ fill: "#425051", fontSize: 10 }}
                  />
                  <Tooltip />
                  <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={18}>
                    {datos.distribucionArquetipos.map((fila) => (
                      <Cell key={fila.arquetipo} fill={fila.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section
        id="resumen-dimensiones"
        className="animate-entrada scroll-mt-20"
        style={{ animationDelay: "70ms" }}
      >
        <SeccionTitulo icono={Target} titulo="Dimensiones" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-3 font-heading text-base text-gris-oscuro">
              Perfil promedio por dimensión
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={datos.datosRadar}
                  outerRadius="60%"
                  margin={{ top: 24, right: 36, bottom: 24, left: 36 }}
                >
                  <PolarGrid stroke="#A4A49B" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={<RadarTickDimension />}
                  />
                  <PolarRadiusAxis
                    domain={[0, 4]}
                    tick={{ fill: "#676E69", fontSize: 9 }}
                  />
                  <Radar
                    dataKey="score"
                    stroke="#FE2800"
                    fill="#FE2800"
                    fillOpacity={0.32}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-1 font-heading text-base text-gris-oscuro">
              Ranking de dimensiones
            </h3>
            <p className="mb-4 text-xs text-gris-medio">
              Promedio por dimensión, de mayor a menor desarrollo.
            </p>
            <div className="flex flex-col gap-4">
              {datos.dimensionesRankeadas.map((d) => (
                <BarraDimension
                  key={d.clave}
                  clave={d.clave}
                  promedio={d.promedio}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="resumen-empresas"
        className="animate-entrada scroll-mt-20"
        style={{ animationDelay: "140ms" }}
      >
        <SeccionTitulo icono={Building2} titulo="Empresas" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-1 font-heading text-base text-gris-oscuro">
              Mapa de calor por empresa
            </h3>
            <p className="mb-3 text-xs text-gris-medio">
              Nivel por dimensión — detecta patrones y focos de riesgo.
            </p>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full border-separate border-spacing-1 text-center text-[11px]">
                <thead>
                  <tr className="text-gris-medio">
                    <th className="text-left font-semibold">Empresa</th>
                    {ORDEN_DIMENSIONES.map((clave) => (
                      <th key={clave} className="font-semibold">
                        {ETIQUETAS_DIMENSION[clave].slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro) => (
                    <tr key={registro.id}>
                      <td className="max-w-[120px] truncate whitespace-nowrap px-1 text-left font-medium text-gris-oscuro">
                        {registro.empresa?.nombre}
                      </td>
                      {ORDEN_DIMENSIONES.map((clave) => {
                        const valor = registro.scoresPorDimension[clave] ?? 0;
                        const nivel = nivelDeScore(valor);
                        return (
                          <td key={clave}>
                            <div
                              className="rounded font-bold"
                              style={{
                                background: COLOR_NIVEL[nivel],
                                color:
                                  nivel === "Medio" ? "#425051" : "#F2F3EE",
                                padding: "4px 2px",
                              }}
                            >
                              {valor.toFixed(1)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gris-medio">
              <LegendPunto color="#00344C" texto="Alto (≥3)" />
              <LegendPunto color="#FF8C12" texto="Medio (2–3)" />
              <LegendPunto color="#BE1E2D" texto="Bajo (<2)" />
            </div>
          </div>

          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base text-gris-oscuro">
                Últimos diagnósticos
              </h3>
              {onVerRegistros && (
                <button
                  type="button"
                  onClick={onVerRegistros}
                  className="text-xs font-semibold text-rojo-brillante hover:underline"
                >
                  Ver todos →
                </button>
              )}
            </div>
            <div className="flex max-h-64 flex-col divide-y divide-gris-verde/15 overflow-y-auto">
              {datos.ultimosDiagnosticos.map((registro) => {
                const fecha = registro.creadoEn
                  ? new Date(registro.creadoEn)
                  : null;
                const nivel = nivelDeScoreTotal(registro.scoreTotal100 ?? 0);
                return (
                  <button
                    key={registro.id}
                    type="button"
                    onClick={() => setSeleccionado(registro)}
                    className="flex items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-off-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gris-oscuro">
                        {registro.empresa?.nombre ?? "Sin especificar"}
                      </p>
                      <p className="truncate text-xs text-gris-medio">
                        {registro.arquetipo ?? "-"}
                        {fecha && ` · ${fecha.toLocaleDateString("es-ES")}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                        CLASES_BADGE_NIVEL[nivel] ??
                        "bg-gris-verde/20 text-gris-medio"
                      }`}
                    >
                      {registro.scoreTotal100 ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="resumen-evolucion"
        className="animate-entrada scroll-mt-20"
        style={{ animationDelay: "210ms" }}
      >
        <SeccionTitulo icono={TrendingUp} titulo="Evolución" />
        <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base text-gris-oscuro">
                Evolución temporal
              </h3>
              {tendenciaEvolucion !== null && tendenciaEvolucion !== 0 && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    tendenciaEvolucion > 0
                      ? "bg-azul/10 text-azul"
                      : "bg-rojo-oscuro/10 text-rojo-oscuro"
                  }`}
                >
                  {tendenciaEvolucion > 0 ? (
                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="h-3 w-3" aria-hidden="true" />
                  )}
                  {tendenciaEvolucion > 0
                    ? `+${tendenciaEvolucion}`
                    : tendenciaEvolucion}{" "}
                  pts
                </span>
              )}
            </div>
            <select
              value={empresaEvolucion}
              onChange={(evento) => setEmpresaEvolucion(evento.target.value)}
              className="rounded-lg border border-gris-verde/40 bg-off-white px-3 py-1.5 text-sm text-gris-oscuro outline-none focus:border-rojo-brillante"
            >
              <option value="">General</option>
              {empresasEvolucion.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="h-56 w-full">
            {evolucion.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gris-medio">
                Sin datos suficientes para esta selección.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucion}>
                  <CartesianGrid stroke="#EEEEE8" vertical={false} />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fill: "#676E69", fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#676E69", fontSize: 10 }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#FE2800"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#FE2800" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section
        id="resumen-oportunidades"
        className="animate-entrada scroll-mt-20"
        style={{ animationDelay: "280ms" }}
      >
        <SeccionTitulo icono={Lightbulb} titulo="Oportunidades" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-1 font-heading text-base text-gris-oscuro">
              Focos de atención
            </h3>
            <p className="mb-4 text-xs text-gris-medio">
              Puntos críticos derivados del conjunto de diagnósticos
              registrados.
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Dimensiones más débiles
                </p>
                <div className="flex flex-col gap-2">
                  {datos.dimensionesDebiles.map((d) => (
                    <div
                      key={d.clave}
                      className="flex items-center justify-between gap-3 rounded-lg bg-rojo-oscuro/5 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-gris-oscuro">
                        {d.etiqueta}
                      </span>
                      <span className="text-right text-xs text-gris-medio">
                        {d.promedio.toFixed(1)}/4 · crítica en{" "}
                        {d.frecuenciaCritica} de {datos.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                  Empresas con score crítico (&lt;50)
                </p>
                {datos.empresasCriticas.length === 0 ? (
                  <p className="text-sm text-gris-medio">
                    Ninguna empresa registrada está por debajo de 50 puntos.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {datos.empresasCriticas.map((empresa) => (
                      <div
                        key={empresa.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-off-white px-3 py-2"
                      >
                        <span className="truncate text-sm font-medium text-gris-oscuro">
                          {empresa.nombre}
                        </span>
                        <span className="shrink-0 rounded-full bg-rojo-oscuro/10 px-2 py-0.5 text-xs font-bold text-rojo-oscuro">
                          {empresa.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-1 font-heading text-base text-gris-oscuro">
              Matriz de prioridad por dimensión
            </h3>
            <p className="mb-3 text-xs text-gris-medio">
              Impacto (frecuencia como dimensión crítica) vs. esfuerzo
              estimado para intervenir.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                >
                  <CartesianGrid stroke="#EEEEE8" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[0, 100]}
                    name="Esfuerzo"
                    tick={{ fill: "#676E69", fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0, 100]}
                    name="Impacto"
                    tick={{ fill: "#676E69", fontSize: 10 }}
                  />
                  <ReferenceLine x={50} stroke="#D8D8D0" strokeDasharray="4 4" />
                  <ReferenceLine y={50} stroke="#D8D8D0" strokeDasharray="4 4" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(valor, nombre) => [
                      valor,
                      nombre === "x" ? "Esfuerzo" : "Impacto",
                    ]}
                  />
                  <Scatter data={datos.matrizPrioridad} fill="#FE2800">
                    {datos.matrizPrioridad.map((punto, indice) => (
                      <Cell
                        key={punto.name}
                        fill={PALETA_ACENTOS[indice % PALETA_ACENTOS.length].hex}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {seleccionado && (
        <DetalleDiagnosticoModal
          registro={seleccionado}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  icono: typeof ClipboardList;
  acentoIndice: number;
  etiqueta: string;
  valor: string | number;
  detalle: string;
  valorPequeno?: boolean;
}

function StatCard({
  icono: Icono,
  acentoIndice,
  etiqueta,
  valor,
  detalle,
  valorPequeno,
}: StatCardProps) {
  const acento = PALETA_ACENTOS[acentoIndice % PALETA_ACENTOS.length];
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-gris-verde/40 bg-white p-4 transition-shadow duration-200 hover:shadow-md">
      <span
        className={`absolute inset-x-0 top-0 h-1 ${acento.bg}`}
        aria-hidden="true"
      />
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${acento.tint} ${acento.text}`}
        >
          <Icono className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gris-medio">
          {etiqueta}
        </p>
      </div>
      <p
        className={`font-heading text-gris-oscuro ${
          valorPequeno ? "text-lg" : "text-2xl"
        }`}
      >
        {valor}
      </p>
      <p className="text-xs text-gris-medio">{detalle}</p>
    </div>
  );
}

function LegendPunto({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      {texto}
    </span>
  );
}

interface SeccionTituloProps {
  icono: typeof ClipboardList;
  titulo: string;
}

function SeccionTitulo({ icono: Icono, titulo }: SeccionTituloProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gris-oscuro/5 text-gris-oscuro">
        <Icono className="h-4 w-4" aria-hidden="true" />
      </span>
      <h2 className="font-heading text-xl text-gris-oscuro">{titulo}</h2>
    </div>
  );
}

interface InsightItemProps {
  etiqueta: string;
  texto: string;
  tono?: "neutro" | "positivo" | "atencion";
}

function InsightItem({ etiqueta, texto, tono = "neutro" }: InsightItemProps) {
  const colorEtiqueta =
    tono === "positivo"
      ? "text-azul"
      : tono === "atencion"
        ? "text-rojo-oscuro"
        : "text-gris-medio";
  return (
    <div>
      <p
        className={`mb-1 text-[11px] font-bold uppercase tracking-wide ${colorEtiqueta}`}
      >
        {etiqueta}
      </p>
      <p className="text-sm leading-relaxed text-gris-oscuro">{texto}</p>
    </div>
  );
}

function BarraDimension({
  clave,
  promedio,
}: {
  clave: string;
  promedio: number;
}) {
  const Icono = ICONOS_DIMENSION[clave];
  const nivel = nivelDeScore(promedio);
  const porcentaje = Math.min(100, (promedio / 4) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gris-oscuro/5 text-gris-oscuro">
        <Icono className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium text-gris-oscuro">
            {ETIQUETAS_DIMENSION[clave]}
          </span>
          <span className="shrink-0 font-bold text-gris-oscuro">
            {promedio.toFixed(1)}
            <span className="font-normal text-gris-medio">/4</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gris-verde/15">
          <div
            className="h-full rounded-full"
            style={{ width: `${porcentaje}%`, background: COLOR_NIVEL[nivel] }}
          />
        </div>
      </div>
    </div>
  );
}
