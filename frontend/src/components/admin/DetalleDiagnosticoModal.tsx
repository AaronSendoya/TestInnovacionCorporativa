"use client";

import { createPortal } from "react-dom";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, ArrowLeft, Compass, Zap } from "lucide-react";
import type { DiagnosticoAdmin } from "@/services/adminDiagnosticos";
import RadarTickDimension from "@/components/RadarTickDimension";
import {
  CLASES_BADGE_NIVEL,
  ETIQUETAS_DIMENSION,
  ICONOS_DIMENSION,
  ORDEN_DIMENSIONES,
  ROL_DIMENSION,
  SEMAFORO_COLOR,
  unirEtiquetasDimension,
} from "@/lib/dimensiones";

interface DetalleDiagnosticoModalProps {
  registro: DiagnosticoAdmin;
  onCerrar: () => void;
}

export default function DetalleDiagnosticoModal({
  registro,
  onCerrar,
}: DetalleDiagnosticoModalProps) {
  const datosRadar = ORDEN_DIMENSIONES.map((clave) => ({
    dimension: ETIQUETAS_DIMENSION[clave],
    score: registro.scoresPorDimension[clave] ?? 0,
  }));

  const fecha = registro.creadoEn ? new Date(registro.creadoEn) : null;

  const dimensionesCriticas =
    registro.dimensionesCriticas ?? [registro.dimensionCritica];
  const tituloCriticaCompleto = unirEtiquetasDimension(dimensionesCriticas);
  const tituloCritica = ETIQUETAS_DIMENSION[registro.dimensionCritica];

  const dimensionesOrdenadas = [...ORDEN_DIMENSIONES].sort(
    (a, b) =>
      (registro.scoresPorDimension[b] ?? 0) -
      (registro.scoresPorDimension[a] ?? 0)
  );

  const scoreMaximo = Math.max(
    ...ORDEN_DIMENSIONES.map((clave) => registro.scoresPorDimension[clave] ?? 0)
  );
  const dimensionesFortaleza = ORDEN_DIMENSIONES.filter(
    (clave) => registro.scoresPorDimension[clave] === scoreMaximo
  );
  const tituloFortalezaPrincipal = unirEtiquetasDimension(dimensionesFortaleza);

  const dimensionesOportunidad = [...dimensionesOrdenadas].reverse().slice(0, 2);
  const segundaCritica =
    dimensionesOportunidad.find(
      (clave) => !dimensionesCriticas.includes(clave)
    ) ?? dimensionesOportunidad[0];

  const quickWinsCritica =
    registro.playbookPorDimension[registro.dimensionCritica] ?? [];
  const quickWinsSegunda = registro.playbookPorDimension[segundaCritica] ?? [];

  const sectorMostrado =
    registro.empresa.sector === "Otro"
      ? registro.empresa.sector_otro ?? registro.empresa.sector
      : registro.empresa.sector;

  const cargoMostrado =
    registro.perfil.cargo === "Otro"
      ? registro.perfil.cargo_otro
      : registro.perfil.cargo;

  const perfilEmpresa = [
    { etiqueta: "Sector", valor: sectorMostrado },
    { etiqueta: "Focos hoy", valor: registro.empresa.focos.join(", ") },
  ];

  return createPortal(
    <div className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-off-white lg:left-64">
      <div className="flex shrink-0 items-center gap-3 border-b border-gris-verde/30 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onCerrar}
          className="flex items-center gap-1.5 rounded-lg py-1.5 pr-2 text-sm font-medium text-gris-oscuro transition-colors hover:text-rojo-brillante"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a Registros
        </button>
        <div className="ml-auto flex min-w-0 items-center gap-3">
          <p className="truncate text-sm font-medium text-gris-oscuro">
            {registro.empresa.nombre}
          </p>
          <p className="shrink-0 font-heading text-lg text-rojo-brillante">
            {registro.scoreTotal100}
            <span className="text-xs font-normal text-gris-medio">/100</span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gris-medio">
            {sectorMostrado}
          </p>
          <h2 className="font-heading text-2xl text-gris-oscuro">
            {registro.empresa.nombre}
          </h2>
          <p className="mt-1 text-xs text-gris-medio">
            {registro.perfil.nombre} · {cargoMostrado} ·{" "}
            {registro.perfil.email}
            {fecha && (
              <>
                {" "}
                · {fecha.toLocaleDateString("es-ES")}{" "}
                {fecha.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </p>
        </div>

        <p className="-mt-2 text-sm text-gris-medio">{registro.diagnostico}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gris-verde/30 bg-white px-4 py-4 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-rojo-brillante">
              Nivel de madurez
            </p>
            <p className="mt-1 font-heading text-2xl text-gris-oscuro">
              {registro.scoreTotal100}
              <span className="text-sm font-normal text-gris-medio">/100</span>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gris-verde/30 bg-white px-4 py-4 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-rojo-brillante">
              Nivel de innovación
            </p>
            <h3 className="mt-1 font-heading text-2xl text-gris-oscuro">
              {registro.nivelInnovacion ?? "—"}
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gris-verde/30 bg-white px-4 py-4 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-rojo-brillante">
              Patrón de innovación
            </p>
            <h3 className="mt-1 font-heading text-2xl text-gris-oscuro">
              {registro.arquetipo}
            </h3>
          </div>
        </div>

        <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h3 className="mb-4 font-heading text-xl text-gris-oscuro">
            Diagnostico General
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rojo-brillante">
                Dimensión crítica
              </p>
              <p className="mt-1 text-sm text-gris-oscuro">
                <span className="font-semibold">
                  {tituloCriticaCompleto || "—"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rojo-brillante">
                Fortalezas principales
              </p>
              <p className="mt-1 text-sm text-gris-oscuro">
                <span className="font-semibold">
                  {tituloFortalezaPrincipal || "—"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rojo-brillante">
                Diagnostico
              </p>
              <p className="mt-1 text-sm text-gris-oscuro">
                {registro.intervencion}
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
              {registro.riesgo}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-4 font-heading text-xl text-gris-oscuro">
              Perfil por Dimensión
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={datosRadar}
                  outerRadius="58%"
                  margin={{ top: 20, right: 32, bottom: 20, left: 32 }}
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
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
            <h3 className="mb-4 font-heading text-xl text-gris-oscuro">
              Nivel por Dimensión
            </h3>
            <div className="flex flex-col gap-2.5">
              {ORDEN_DIMENSIONES.map((clave) => {
                const nivel =
                  registro.nivelesPorDimension?.[clave] ?? "Medio";
                return (
                  <div
                    key={clave}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-gris-oscuro">
                      <span
                        style={{
                          backgroundColor: SEMAFORO_COLOR[nivel] ?? "#676E69",
                        }}
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        aria-label={nivel}
                      />
                      {ETIQUETAS_DIMENSION[clave]}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        CLASES_BADGE_NIVEL[nivel] ??
                        "bg-gris-verde/20 text-gris-medio"
                      }`}
                    >
                      {nivel} · {registro.scoresPorDimension[clave]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h3 className="mb-4 font-heading text-xl text-gris-oscuro">
            Resultados por Dimensión
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ORDEN_DIMENSIONES.map((clave) => {
              const Icono = ICONOS_DIMENSION[clave];
              const nivel = registro.nivelesPorDimension[clave] ?? "Medio";
              const recomendacion =
                registro.playbookPorDimension[clave]?.[0] ?? "";
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
                      {registro.scoresPorDimension[clave]}
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

        <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Compass className="h-5 w-5 text-rojo-brillante" aria-hidden="true" />
            <h3 className="font-heading text-xl text-gris-oscuro">
              Acciones sugeridas
            </h3>
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
                    {registro.nivelesPorDimension[registro.dimensionCritica]}
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
                    {registro.nivelesPorDimension[segundaCritica]}
                  </p>
                  <p className="text-sm text-gris-oscuro">
                    {quickWinsSegunda[1]}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gris-verde/40 bg-white p-5">
          <h3 className="mb-4 font-heading text-lg text-gris-oscuro">
            Perfil de la empresa
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {perfilEmpresa.map((item) => (
              <div
                key={item.etiqueta}
                className="rounded-lg border border-gris-verde/30 bg-off-white p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gris-medio">
                  {item.etiqueta}
                </p>
                <p className="mt-1 text-sm font-medium text-gris-oscuro">
                  {item.valor || "—"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-dashed border-gris-verde/40 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Zap
              className="h-5 w-5 shrink-0 text-rojo-brillante"
              aria-hidden="true"
            />
            <h3 className="font-heading text-lg text-gris-oscuro">
              Quick wins recomendados · {tituloCritica}
            </h3>
            <span className="ml-auto shrink-0 rounded-full bg-gris-verde/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gris-medio">
              Solo admin
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {(registro.quickWins ?? []).map((quickWin) => (
              <p
                key={quickWin}
                className="rounded-lg bg-off-white px-3 py-2 text-sm text-gris-oscuro"
              >
                {quickWin}
              </p>
            ))}
          </div>
        </section>
        </div>
      </div>
    </div>,
    document.body
  );
}
