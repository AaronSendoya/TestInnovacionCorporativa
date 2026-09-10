"use client";

import {
  Bar,
  BarChart,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Compass,
  MessageCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { DiagnosticoResultado } from "@/services/diagnostico";
import RadarTickDimension from "@/components/RadarTickDimension";
import {
  CLASES_BADGE_NIVEL,
  COLOR_NIVEL,
  ETIQUETAS_DIMENSION,
  ICONOS_DIMENSION,
  ORDEN_DIMENSIONES,
  ROL_DIMENSION,
} from "@/lib/dimensiones";

const WHATSAPP_URL = "https://wa.me/59162458885?text=Hola";

const SEMAFORO_COLOR: Record<string, string> = {
  Alto: "#16a34a",
  Medio: "#f59e0b",
  Bajo: "#ef4444",
};

interface DashboardResultadosProps {
  resultado: DiagnosticoResultado;
  onReiniciar?: () => void;
}

export default function DashboardResultados({
  resultado,
  onReiniciar,
}: DashboardResultadosProps) {
  const datosRadar = ORDEN_DIMENSIONES.map((clave) => ({
    dimension: ETIQUETAS_DIMENSION[clave],
    score: resultado.scoresPorDimension[clave] ?? 0,
  }));

  const dimensionesOrdenadas = [...ORDEN_DIMENSIONES].sort(
    (a, b) =>
      (resultado.scoresPorDimension[b] ?? 0) -
      (resultado.scoresPorDimension[a] ?? 0)
  );

  const datosRanking = dimensionesOrdenadas.map((clave) => ({
    dimension: ETIQUETAS_DIMENSION[clave],
    score: resultado.scoresPorDimension[clave] ?? 0,
    nivel: resultado.nivelesPorDimension[clave] ?? "Medio",
  }));

  const scoreMaximo = Math.max(
    ...ORDEN_DIMENSIONES.map((clave) => resultado.scoresPorDimension[clave] ?? 0)
  );
  const dimensionesFortaleza = ORDEN_DIMENSIONES.filter(
    (clave) => resultado.scoresPorDimension[clave] === scoreMaximo
  );
  const dimensionesOportunidad = [...dimensionesOrdenadas]
    .reverse()
    .slice(0, 2);
  const segundaCritica =
    dimensionesOportunidad.find(
      (clave) => clave !== resultado.dimensionCritica
    ) ?? dimensionesOportunidad[0];

  const quickWinsCritica =
    resultado.playbookPorDimension[resultado.dimensionCritica] ?? [];
  const quickWinsSegunda =
    resultado.playbookPorDimension[segundaCritica] ?? [];

  const tituloCritica = ETIQUETAS_DIMENSION[resultado.dimensionCritica];
  const tituloFortalezaPrincipal = ETIQUETAS_DIMENSION[dimensionesFortaleza[0]];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 pb-28 sm:px-6 lg:px-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-3xl text-gris-oscuro">
          {resultado.arquetipo}
        </h1>
        <p className="font-heading text-5xl text-rojo-brillante">
          {resultado.scoreTotal100}
          <span className="text-lg text-gris-medio"> /100</span>
        </p>
        <p className="font-heading text-2xl text-gris-oscuro">
          Nivel de Madurez
        </p>
        <p className="max-w-xl text-sm text-gris-medio">
          {resultado.diagnostico}
        </p>

        <dl className="mt-4 flex w-full max-w-2xl flex-col divide-y divide-gris-verde/20 rounded-2xl border border-gris-verde/30 bg-white sm:flex-row sm:divide-x sm:divide-y-0">
          <div className="flex flex-col items-center gap-0.5 px-6 py-4">
            <dt className="text-xs font-bold uppercase tracking-widest text-rojo-brillante">
              Empresa
            </dt>
            <dd className="font-heading text-base text-gris-oscuro">
              {resultado.empresa.nombre}
            </dd>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-6 py-4">
            <dt className="text-xs font-bold uppercase tracking-widest text-rojo-brillante">
              Responde
            </dt>
            <dd className="font-heading text-base text-gris-oscuro">
              {resultado.perfil.nombre}
            </dd>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-6 py-4">
            <dt className="text-xs font-bold uppercase tracking-widest text-rojo-brillante">
              Cargo
            </dt>
            <dd className="font-heading text-base text-gris-oscuro">
              {resultado.perfil.cargo === "Otro"
                ? resultado.perfil.cargo_otro
                : resultado.perfil.cargo}
            </dd>
          </div>
        </dl>
      </header>



      <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
        <h2 className="mb-4 font-heading text-xl text-gris-oscuro">
          Síntesis Ejecutiva
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rojo-brillante">
              Dimensión crítica
            </p>
            <p className="mt-1 text-sm text-gris-oscuro">
              <span className="font-semibold">{tituloCritica}</span> —{" "}
              {ROL_DIMENSION[resultado.dimensionCritica]}. Es la dimensión que
              hoy más limita el sistema.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rojo-brillante">
              Dimensiones Potenciales
            </p>
            <p className="mt-1 text-sm text-gris-oscuro">
              <span className="font-semibold">{tituloFortalezaPrincipal}</span>{" "}
              — úsala como base para destrabar el resto.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rojo-brillante">
              Movimiento prioritario
            </p>
            <p className="mt-1 text-sm text-gris-oscuro">
              {resultado.intervencion}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-off-white px-3 py-2 text-sm text-gris-oscuro">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-naranja"
            aria-hidden="true"
          />
          <span>
            <span className="font-semibold">Riesgo principal: </span>
            {resultado.riesgo}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h2 className="mb-4 font-heading text-xl text-gris-oscuro">
            Perfil por Dimensión
          </h2>
          <div className="h-72 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={datosRadar}
                outerRadius="62%"
                margin={{ top: 24, right: 36, bottom: 24, left: 36 }}
              >
                <PolarGrid stroke="#A4A49B" />
                <PolarAngleAxis dataKey="dimension" tick={<RadarTickDimension />} />
                <PolarRadiusAxis
                  domain={[0, 4]}
                  tick={{ fill: "#676E69", fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#FE2800"
                  fill="#FE2800"
                  fillOpacity={0.35}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h2 className="mb-4 font-heading text-xl text-gris-oscuro">
            Ranking de Dimensiones
          </h2>
          <div className="h-72 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosRanking}
                layout="vertical"
                margin={{ left: 24 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 4]}
                  tick={{ fill: "#676E69", fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="dimension"
                  width={110}
                  tick={{ fill: "#425051", fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {datosRanking.map((fila) => (
                    <Cell
                      key={fila.dimension}
                      fill={COLOR_NIVEL[fila.nivel] ?? "#676E69"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
        <h2 className="mb-4 font-heading text-xl text-gris-oscuro">
          Resultados por Dimensión
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDEN_DIMENSIONES.map((clave) => {
            const Icono = ICONOS_DIMENSION[clave];
            const nivel = resultado.nivelesPorDimension[clave] ?? "Medio";
            const recomendacion =
              resultado.playbookPorDimension[clave]?.[0] ?? "";
            return (
              <div
                key={clave}
                className="flex flex-col gap-2 rounded-xl border border-gris-verde/30 bg-off-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icono
                      className="h-4 w-4 text-rojo-brillante"
                      aria-hidden="true"
                    />
                    <p className="font-heading text-sm text-gris-oscuro">
                      {ETIQUETAS_DIMENSION[clave]}
                    </p>
                  </div>
                  <p className="font-heading text-lg text-gris-oscuro">
                    {resultado.scoresPorDimension[clave]}
                    <span className="text-xs text-gris-medio">/4</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: SEMAFORO_COLOR[nivel] ?? "#676E69" }}
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    aria-label={nivel}
                  />
                  <span className="text-xs font-semibold text-gris-oscuro">
                    {nivel}
                  </span>
                </div>
                <p className="text-xs italic text-gris-medio">
                  {ROL_DIMENSION[clave]}
                </p>
                <p className="text-sm text-gris-oscuro">{recomendacion}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp
              className="h-5 w-5 text-azul"
              aria-hidden="true"
            />
            <h2 className="font-heading text-xl text-gris-oscuro">
              Capacidades más desarrolladas
            </h2>
          </div>
          <ul className="flex flex-col gap-3">
            {dimensionesFortaleza.map((clave) => (
              <li key={clave} className="text-sm text-gris-oscuro">
                <span className="font-semibold">
                  {ETIQUETAS_DIMENSION[clave]}
                </span>{" "}
                ({resultado.scoresPorDimension[clave]}/4).{" "}
                <span className="text-gris-medio">
                  {ROL_DIMENSION[clave]}.
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border-t-4 border-t-naranja border-x border-b border-gris-verde/40 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown
              className="h-5 w-5 text-rojo-oscuro"
              aria-hidden="true"
            />
            <h2 className="font-heading text-xl text-gris-oscuro">
              Oportunidades prioritarias
            </h2>
          </div>
          <ul className="flex flex-col gap-3">
            {dimensionesOportunidad.map((clave) => (
              <li key={clave} className="text-sm text-gris-oscuro">
                <span className="font-semibold">
                  {ETIQUETAS_DIMENSION[clave]}
                </span>{" "}
                ({resultado.scoresPorDimension[clave]}/4
                {clave === resultado.dimensionCritica ? " · bloqueador" : ""}
                ).{" "}
                <span className="text-gris-medio">
                  {resultado.playbookPorDimension[clave]?.[0]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Compass className="h-5 w-5 text-rojo-brillante" aria-hidden="true" />
          <h2 className="font-heading text-xl text-gris-oscuro">
            Hoja de Ruta Sugerida
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2 border-t-2 border-rojo-brillante pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gris-oscuro">
              Acciones inmediatas
            </p>
            {quickWinsCritica[0] && (
              <div>
                <p className="text-xs font-semibold uppercase text-gris-medio">
                  {tituloCritica}
                </p>
                <p className="text-sm text-gris-oscuro">
                  {quickWinsCritica[0]}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t-2 border-naranja pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gris-oscuro">
              Corto plazo
            </p>
            {quickWinsCritica[1] && (
              <div>
                <p className="text-xs font-semibold uppercase text-gris-medio">
                  {tituloCritica}
                </p>
                <p className="text-sm text-gris-oscuro">
                  {quickWinsCritica[1]}
                </p>
              </div>
            )}
            {quickWinsSegunda[0] && (
              <div>
                <p className="text-xs font-semibold uppercase text-gris-medio">
                  {ETIQUETAS_DIMENSION[segundaCritica]}
                </p>
                <p className="text-sm text-gris-oscuro">
                  {quickWinsSegunda[0]}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t-2 border-gris-verde pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gris-oscuro">
              Capacidades a construir
            </p>
            {quickWinsCritica[2] && (
              <div>
                <p className="text-xs font-semibold uppercase text-gris-medio">
                  {tituloCritica} ·{" "}
                  {resultado.nivelesPorDimension[resultado.dimensionCritica]}
                </p>
                <p className="text-sm text-gris-oscuro">
                  {quickWinsCritica[2]}
                </p>
              </div>
            )}
            {quickWinsSegunda[1] && (
              <div>
                <p className="text-xs font-semibold uppercase text-gris-medio">
                  {ETIQUETAS_DIMENSION[segundaCritica]} ·{" "}
                  {resultado.nivelesPorDimension[segundaCritica]}
                </p>
                <p className="text-sm text-gris-oscuro">
                  {quickWinsSegunda[1]}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-gris-oscuro p-8 text-center">
        <h2 className="font-heading text-2xl text-off-white">
          Tu próximo paso con Pista 8
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-off-white/70">
          Este resultado es una primera lectura de la madurez de innovación
          de tu organización. Pista 8 puede ayudarte a profundizar las
          oportunidades identificadas y convertirlas en una hoja de ruta
          práctica.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="animate-pulso mt-6 inline-flex items-center gap-2 rounded-full bg-rojo-brillante px-6 py-3 font-heading text-sm text-off-white transition-transform hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Conversar con Pista 8
        </a>
      </section>

      {onReiniciar && (
        <button
          type="button"
          onClick={onReiniciar}
          className="self-center text-sm font-medium text-gris-medio underline underline-offset-4 hover:text-gris-oscuro"
        >
          Realizar otro diagnóstico
        </button>
      )}

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-rojo-brillante px-5 py-3 font-heading text-sm text-off-white shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Conversar con Pista 8
      </a>
    </div>
  );
}
