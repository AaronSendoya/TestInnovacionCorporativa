"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { AlertOctagon, Award, ClipboardList } from "lucide-react";
import type { DiagnosticoAdmin } from "@/services/adminDiagnosticos";
import { obtenerDiagnosticos } from "@/services/adminDiagnosticos";
import {
  COLOR_NIVEL,
  ETIQUETAS_DIMENSION,
  ORDEN_DIMENSIONES,
  PALETA_ACENTOS,
} from "@/lib/dimensiones";
import GaugeMadurez from "@/components/admin/GaugeMadurez";
import RadarTickDimension from "@/components/RadarTickDimension";

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

export default function ResumenGeneral() {
  const [registros, setRegistros] = useState<DiagnosticoAdmin[]>([]);
  const [totalReal, setTotalReal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const evolucion = [...registros]
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
      datosRadar,
      distribucionMadurez,
      distribucionArquetipos,
      evolucion,
      matrizPrioridad,
    };
  }, [registros]);

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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-gris-oscuro">
          Resumen general
        </h1>
        <p className="text-sm text-gris-medio">
          Vista agregada de los {datos.total} diagnósticos registrados.
          {totalReal > registros.length && (
            <>
              {" "}
              Mostrando los {registros.length} más recientes de {totalReal}{" "}
              totales.
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-gris-verde/40 bg-white p-4">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h2 className="mb-3 font-heading text-lg text-gris-oscuro">
            Perfil promedio por dimensión
          </h2>
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
          <h2 className="mb-1 font-heading text-lg text-gris-oscuro">
            Mapa de calor por empresa
          </h2>
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
                              color: nivel === "Medio" ? "#425051" : "#F2F3EE",
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
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h2 className="mb-1 font-heading text-lg text-gris-oscuro">
            Distribución de madurez
          </h2>
          <p className="mb-3 text-xs text-gris-medio">
            Cantidad de empresas por rango de score — escala sin importar
            cuántas encuestas haya.
          </p>
          <div className="h-64 w-full">
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
          <h2 className="mb-3 font-heading text-lg text-gris-oscuro">
            Distribución por arquetipo
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos.distribucionArquetipos}
                layout="vertical"
                margin={{ left: 8 }}
              >
                <XAxis type="number" tick={{ fill: "#676E69", fontSize: 10 }} />
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

      <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
        <h2 className="mb-3 font-heading text-lg text-gris-oscuro">
          Evolución temporal
        </h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos.evolucion}>
              <CartesianGrid stroke="#EEEEE8" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fill: "#676E69", fontSize: 10 }} />
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
        </div>
      </div>

      <div className="rounded-2xl border border-gris-verde/40 bg-white p-5">
        <h2 className="mb-1 font-heading text-lg text-gris-oscuro">
          Matriz de prioridad por dimensión
        </h2>
        <p className="mb-3 text-xs text-gris-medio">
          Impacto (frecuencia como dimensión crítica) vs. esfuerzo estimado
          para intervenir.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
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
    <div className="flex flex-col gap-2 rounded-2xl border border-gris-verde/40 bg-white p-4">
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
