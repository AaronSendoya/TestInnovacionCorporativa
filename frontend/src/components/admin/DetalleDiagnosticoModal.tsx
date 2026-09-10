"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { X, Zap } from "lucide-react";
import type { DiagnosticoAdmin } from "@/services/adminDiagnosticos";
import RadarTickDimension from "@/components/RadarTickDimension";
import {
  CLASES_BADGE_NIVEL,
  ETIQUETAS_DIMENSION,
  ORDEN_DIMENSIONES,
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

  const contextoDeclarado = [
    { etiqueta: "Sector", valor: registro.empresa.sector },
    { etiqueta: "Tamaño", valor: registro.empresa.tamano },
    {
      etiqueta: "Relación con decisiones",
      valor: registro.perfil.relacion_decisiones,
    },
    { etiqueta: "Focos hoy", valor: registro.empresa.focos.join(", ") },
    { etiqueta: "Principal obstáculo", valor: registro.contexto.obstaculo },
    { etiqueta: "Prioridad (12 meses)", valor: registro.contexto.prioridad },
    { etiqueta: "Impacto buscado", valor: registro.contexto.impacto },
    { etiqueta: "Horizonte realista", valor: registro.contexto.horizonte },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gris-oscuro/55 p-4 sm:p-6"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col gap-6 overflow-y-auto rounded-2xl bg-white p-6 sm:p-8"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gris-medio">
              {registro.empresa.sector} · {registro.empresa.tamano}
            </p>
            <h2 className="font-heading text-2xl text-gris-oscuro">
              {registro.empresa.nombre}
            </h2>
            <p className="mt-1 text-xs text-gris-medio">
              {registro.perfil.nombre} · {registro.perfil.email}
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
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-heading text-3xl text-rojo-brillante">
                {registro.scoreTotal100}
                <span className="text-sm text-gris-medio">/100</span>
              </p>
              <p className="text-xs font-semibold text-gris-medio">
                {registro.arquetipo}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-off-white text-gris-oscuro transition-colors hover:bg-gris-verde hover:text-off-white"
              aria-label="Cerrar detalle"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-off-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-gris-oscuro">
              Perfil por dimensión
            </h3>
            <div className="h-56 w-full">
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
          </div>

          <div className="rounded-xl bg-off-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gris-oscuro">
              Nivel por dimensión
            </h3>
            <div className="flex flex-col gap-2">
              {ORDEN_DIMENSIONES.map((clave) => {
                const nivel =
                  registro.nivelesPorDimension?.[clave] ?? "Medio";
                return (
                  <div
                    key={clave}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gris-oscuro">
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
          </div>
        </div>

        <div className="rounded-xl bg-off-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gris-oscuro">
            Contexto declarado
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {contextoDeclarado.map((item) => (
              <div key={item.etiqueta} className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gris-medio">
                  {item.etiqueta}
                </p>
                <p className="mt-1 text-sm font-medium text-gris-oscuro">
                  {item.valor || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-off-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-rojo-brillante" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gris-oscuro">
              Quick wins recomendados ·{" "}
              {ETIQUETAS_DIMENSION[registro.dimensionCritica]}
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {(registro.quickWins ?? []).map((quickWin) => (
              <p
                key={quickWin}
                className="rounded-lg bg-white px-3 py-2 text-sm text-gris-oscuro"
              >
                {quickWin}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
