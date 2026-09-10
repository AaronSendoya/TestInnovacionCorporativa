import {
  Handshake,
  Lightbulb,
  Rocket,
  Scale,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

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
  cultura: "Habilitador organizacional",
  equipos: "Capacidad instalada",
  proyectos: "Conversión: lleva a valor real",
  toma_decisiones: "Velocidad y asignación: cuello crítico",
  colaboracion_externa: "Escala y expansión",
  estrategia_portafolio: "Dirección: define el para qué",
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
