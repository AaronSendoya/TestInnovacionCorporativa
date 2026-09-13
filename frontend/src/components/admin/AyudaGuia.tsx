"use client";

import {
  BookOpenCheck,
  Compass,
  ExternalLink,
  Gauge,
  LayoutGrid,
  ListChecks,
  TrendingUp,
  Wrench,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import RadarTickDimension from "@/components/RadarTickDimension";
import {
  ETIQUETAS_DIMENSION,
  ICONOS_DIMENSION,
  ORDEN_DIMENSIONES,
  ROL_DIMENSION,
} from "@/lib/dimensiones";
import {
  ARQUETIPOS_INFO,
  NIVELES_DIMENSION,
  NIVELES_INNOVACION,
  PERFIL_EJEMPLO_RADAR,
  PLAYBOOK_QUICK_WINS,
} from "@/lib/ayudaContenido";

interface TarjetaProps {
  titulo: string;
  icono: React.ElementType;
  children: React.ReactNode;
}

function Tarjeta({ titulo, icono: Icono, children }: TarjetaProps) {
  return (
    <section className="rounded-2xl border border-gris-verde/40 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rojo-brillante/10 text-rojo-brillante">
          <Icono className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-lg text-gris-oscuro sm:text-xl">
          {titulo}
        </h2>
      </div>
      {children}
    </section>
  );
}

interface Tramo {
  etiqueta: string;
  desde: number;
  hasta: number;
  color: string;
}

function BarraEscalonada({ tramos, max }: { tramos: Tramo[]; max: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-off-white">
        {tramos.map((tramo) => (
          <div
            key={tramo.etiqueta}
            style={{
              width: `${((tramo.hasta - tramo.desde) / max) * 100}%`,
              backgroundColor: tramo.color,
            }}
            title={`${tramo.etiqueta}: ${tramo.desde}–${tramo.hasta}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {tramos.map((tramo) => (
          <div key={tramo.etiqueta} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: tramo.color }}
              aria-hidden="true"
            />
            <span className="font-medium text-gris-oscuro">{tramo.etiqueta}</span>
            <span className="text-gris-medio">
              {tramo.desde}–{tramo.hasta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const datosRadarEjemplo = ORDEN_DIMENSIONES.map((clave) => ({
  dimension: ETIQUETAS_DIMENSION[clave],
  score: PERFIL_EJEMPLO_RADAR[clave] ?? 0,
}));

export default function AyudaGuia() {
  return (
    <div className="animate-entrada flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl text-gris-oscuro">
          Guía de interpretación del diagnóstico
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gris-medio">
          Referencia completa de la metodología, las dimensiones, los
          arquetipos y los umbrales que usa el motor de diagnóstico para
          calificar la madurez de innovación de una empresa.
        </p>
      </div>

      <Tarjeta titulo="Metodología del diagnóstico" icono={BookOpenCheck}>
        <div className="flex flex-col gap-4 text-sm text-gris-medio">
          <p>
            El cuestionario evalúa 6 dimensiones con 3 preguntas cada una. Cada
            respuesta se pondera de 1 (capacidad nula) a 4 (capacidad
            sistemática).
          </p>
          <ol className="flex flex-col gap-2 pl-4">
            <li className="list-decimal">
              <span className="font-semibold text-gris-oscuro">
                Score por dimensión:
              </span>{" "}
              promedio simple de las 3 respuestas de esa dimensión (escala
              1.0–4.0).
            </li>
            <li className="list-decimal">
              <span className="font-semibold text-gris-oscuro">
                Score ponderado:
              </span>{" "}
              promedio de los puntajes finales de las 6 dimensiones (escala
              1.0–4.0).
            </li>
            <li className="list-decimal">
              <span className="font-semibold text-gris-oscuro">
                Score de madurez (0–100):
              </span>{" "}
              conversión directa del score ponderado a base 100 — (score
              ponderado / 4.0) × 100.
            </li>
            <li className="list-decimal">
              <span className="font-semibold text-gris-oscuro">
                Dimensión crítica:
              </span>{" "}
              la dimensión con el score más bajo; determina el arquetipo y los
              Quick Wins sugeridos.
            </li>
          </ol>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gris-verde">
              Escala del score de madurez (0–100)
            </p>
            <BarraEscalonada
              max={100}
              tramos={[
                { etiqueta: "Bajo", desde: 0, hasta: 49, color: "#BE1E2D" },
                { etiqueta: "Medio", desde: 50, hasta: 74, color: "#FF8C12" },
                { etiqueta: "Alto", desde: 75, hasta: 100, color: "#00344C" },
              ]}
            />
          </div>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Las 6 dimensiones" icono={LayoutGrid}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDEN_DIMENSIONES.map((clave) => {
            const Icono = ICONOS_DIMENSION[clave];
            return (
              <div
                key={clave}
                className="flex flex-col gap-2 rounded-xl border border-gris-verde/30 bg-off-white p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-azul">
                    <Icono className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="font-heading text-sm text-gris-oscuro">
                    {ETIQUETAS_DIMENSION[clave]}
                  </p>
                </div>
                <p className="text-xs text-gris-medio">
                  {ROL_DIMENSION[clave]}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-gris-verde/20 pt-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gris-verde">
            Ejemplo ilustrativo
          </p>
          <p className="mb-3 text-xs text-gris-medio">
            Así se ve el gráfico de Perfil por Dimensión que recibe el usuario
            final. Los valores de este ejemplo son ficticios, solo para
            explicar cómo leerlo.
          </p>
          <div className="h-72 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={datosRadarEjemplo}
                outerRadius="62%"
                margin={{ top: 24, right: 36, bottom: 24, left: 36 }}
              >
                <PolarGrid stroke="#A4A49B" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={<RadarTickDimension />}
                />
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
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 border-t border-gris-verde/20 pt-5 sm:grid-cols-3">
          {NIVELES_DIMENSION.map((nivel) => (
            <div
              key={nivel.nivel}
              className="flex items-center gap-2 rounded-lg bg-off-white px-3 py-2"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: nivel.color }}
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-gris-oscuro">
                  {nivel.nivel}
                </p>
                <p className="text-[11px] text-gris-medio">
                  {nivel.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Nivel de innovación" icono={TrendingUp}>
        <p className="mb-4 text-sm text-gris-medio">
          Etiqueta cualitativa del score de madurez (0–100), independiente del
          arquetipo, usada para comunicar el resultado de forma simple.
        </p>
        <BarraEscalonada
          max={100}
          tramos={[
            { etiqueta: "Reactiva", desde: 0, hasta: 44, color: "#BE1E2D" },
            { etiqueta: "Operativa", desde: 45, hasta: 64, color: "#FF8C12" },
            {
              etiqueta: "Estructurada",
              desde: 65,
              hasta: 84,
              color: "#00344C",
            },
            {
              etiqueta: "Ecosistémica",
              desde: 85,
              hasta: 100,
              color: "#425051",
            },
          ]}
        />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {NIVELES_INNOVACION.map((nivel) => (
            <div
              key={nivel.nivel}
              className="rounded-lg border border-gris-verde/30 px-3 py-2 text-center"
            >
              <p className="text-xs font-semibold text-gris-oscuro">
                {nivel.nivel}
              </p>
              <p className="text-[11px] text-gris-medio">{nivel.rango}</p>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Arquetipos de innovación" icono={Compass}>
        <p className="mb-4 text-sm text-gris-medio">
          El backend evalúa estas condiciones en orden estricto: la primera
          que se cumple determina el arquetipo, sin evaluar las siguientes.
        </p>
        <div className="flex flex-col gap-3">
          {ARQUETIPOS_INFO.map((arquetipo) => (
            <div
              key={arquetipo.nombre}
              className="rounded-xl border border-gris-verde/30 bg-off-white p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rojo-brillante font-heading text-xs text-off-white">
                  {arquetipo.orden}
                </span>
                <p className="font-heading text-sm text-gris-oscuro">
                  {arquetipo.nombre}
                </p>
                <span className="rounded-full bg-gris-verde/15 px-2 py-0.5 text-[10px] font-medium text-gris-medio">
                  {arquetipo.condicion}
                </span>
              </div>
              <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-gris-verde">
                    Diagnóstico
                  </dt>
                  <dd className="mt-1 text-gris-medio">
                    {arquetipo.diagnostico}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-gris-verde">
                    Riesgo principal
                  </dt>
                  <dd className="mt-1 text-gris-medio">{arquetipo.riesgo}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-gris-verde">
                    Intervención sugerida
                  </dt>
                  <dd className="mt-1 text-gris-medio">
                    {arquetipo.intervencion}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Dimensión crítica y Quick Wins" icono={Wrench}>
        <p className="mb-4 text-sm text-gris-medio">
          El sistema sugiere un plan de acción según cuál dimensión obtuvo el
          score más bajo (la dimensión crítica).
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDEN_DIMENSIONES.map((clave) => {
            const Icono = ICONOS_DIMENSION[clave];
            return (
              <div
                key={clave}
                className="rounded-xl border border-gris-verde/30 bg-off-white p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icono className="h-4 w-4 text-azul" aria-hidden="true" />
                  <p className="font-heading text-sm text-gris-oscuro">
                    {ETIQUETAS_DIMENSION[clave]}
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {PLAYBOOK_QUICK_WINS[clave]?.map((accion) => (
                    <li
                      key={accion}
                      className="flex items-start gap-1.5 text-xs text-gris-medio"
                    >
                      <ListChecks
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gris-verde"
                        aria-hidden="true"
                      />
                      {accion}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Tarjeta>

      <div className="flex items-center gap-3 rounded-2xl border border-gris-verde/40 bg-off-white p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-azul">
          <Gauge className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <p className="text-sm text-gris-medio">
          Consulta <span className="font-semibold text-gris-oscuro">Registros</span> para
          ver el detalle de cada diagnóstico y{" "}
          <span className="font-semibold text-gris-oscuro">Reportes</span> para
          exportarlos a Excel.
          <ExternalLink
            className="ml-1.5 inline h-3.5 w-3.5 text-gris-verde"
            aria-hidden="true"
          />
        </p>
      </div>
    </div>
  );
}
