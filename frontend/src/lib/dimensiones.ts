import {
  Handshake,
  Lightbulb,
  Rocket,
  Scale,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DiagnosticoAdmin } from "@/services/adminDiagnosticos";

export const ORDEN_DIMENSIONES = [
  "cultura",
  "equipos",
  "proyectos",
  "toma_decisiones",
  "colaboracion_externa",
  "estrategia_portafolio",
];

export const ETIQUETAS_DIMENSION: Record<string, string> = {
  cultura: "Cultura",
  equipos: "Equipos",
  proyectos: "Proyectos",
  toma_decisiones: "Toma de Decisiones",
  colaboracion_externa: "Colaboración Externa",
  estrategia_portafolio: "Estrategia & Portafolio",
};

export const ICONOS_DIMENSION: Record<string, LucideIcon> = {
  cultura: Lightbulb,
  equipos: Users,
  proyectos: Rocket,
  toma_decisiones: Scale,
  colaboracion_externa: Handshake,
  estrategia_portafolio: Target,
};

export const ROL_DIMENSION: Record<string, string> = {
  cultura: "Crea las condiciones para innovar",
  equipos: "Aporta la capacidad para ejecutar",
  proyectos: "Convierte ideas en resultados reales",
  toma_decisiones: "Determina la velocidad para avanzar",
  colaboracion_externa: "Escala la innovación con aliados externos",
  estrategia_portafolio: "Da dirección y propósito a la innovación",
};

export const COLOR_NIVEL: Record<string, string> = {
  Alto: "#00344C",
  Medio: "#FF8C12",
  Bajo: "#BE1E2D",
};

export const CLASES_BADGE_NIVEL: Record<string, string> = {
  Alto: "bg-azul/10 text-azul",
  Medio: "bg-naranja/10 text-naranja",
  Bajo: "bg-rojo-oscuro/10 text-rojo-oscuro",
};

export const SEMAFORO_COLOR: Record<string, string> = {
  Alto: "#16a34a",
  Medio: "#f59e0b",
  Bajo: "#ef4444",
};

// Une las etiquetas de una o mas dimensiones (empates) en un texto legible:
// "Cultura", "Cultura y Equipos", "Cultura, Equipos y Proyectos".
export function unirEtiquetasDimension(claves: string[]): string {
  const nombres = claves.map((clave) => ETIQUETAS_DIMENSION[clave]);
  if (nombres.length <= 1) {
    return nombres[0] ?? "";
  }
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

interface AcentoColor {
  bg: string;
  text: string;
  tint: string;
  hex: string;
}

export const PALETA_ACENTOS: AcentoColor[] = [
  { bg: "bg-rojo-brillante", text: "text-rojo-brillante", tint: "bg-rojo-brillante/10", hex: "#FE2800" },
  { bg: "bg-azul", text: "text-azul", tint: "bg-azul/10", hex: "#00344C" },
  { bg: "bg-naranja", text: "text-naranja", tint: "bg-naranja/10", hex: "#FF8C12" },
  { bg: "bg-rojo-oscuro", text: "text-rojo-oscuro", tint: "bg-rojo-oscuro/10", hex: "#BE1E2D" },
];

export function nivelDeScoreTotal(score: number): string {
  if (score >= 75) return "Alto";
  if (score >= 50) return "Medio";
  return "Bajo";
}

// Mismos umbrales que nivelDeScore en lib/server/diagnosticoEngine.ts, para
// escala 1-4 por dimension. Se duplica aqui (solo bucketing de presentacion,
// no calculo de dominio) porque ese modulo es server-only.
export function nivelDeScoreDimension(score: number): string {
  if (score >= 3) return "Alto";
  if (score >= 2) return "Medio";
  return "Bajo";
}

export function sectorDe(registro: DiagnosticoAdmin): string | undefined {
  return registro.empresa?.sector === "Otro"
    ? registro.empresa?.sector_otro
    : registro.empresa?.sector;
}

export function fechaLocalYMD(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}
