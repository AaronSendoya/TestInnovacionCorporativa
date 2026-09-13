// Copia estatica de solo lectura para la pantalla de Ayuda. El calculo real
// vive en frontend/src/lib/server/diagnosticoEngine.ts (backend); este
// archivo no se importa desde ahi ni al reves, para no mezclar logica de
// dominio con texto de presentacion en el cliente.

export interface NivelDimensionInfo {
  nivel: string;
  descripcion: string;
  color: string;
}

export const NIVELES_DIMENSION: NivelDimensionInfo[] = [
  {
    nivel: "Alto",
    descripcion: "Score de dimensión mayor o igual a 3.0 sobre 4.0.",
    color: "#00344C",
  },
  {
    nivel: "Medio",
    descripcion: "Score de dimensión entre 2.0 y 2.99 sobre 4.0.",
    color: "#FF8C12",
  },
  {
    nivel: "Bajo",
    descripcion: "Score de dimensión menor a 2.0 sobre 4.0.",
    color: "#BE1E2D",
  },
];

export interface NivelInnovacionInfo {
  nivel: string;
  rango: string;
  hasta: number;
}

export const NIVELES_INNOVACION: NivelInnovacionInfo[] = [
  { nivel: "Reactiva", rango: "0 – 44", hasta: 44 },
  { nivel: "Operativa", rango: "45 – 64", hasta: 64 },
  { nivel: "Estructurada", rango: "65 – 84", hasta: 84 },
  { nivel: "Ecosistémica", rango: "85 – 100", hasta: 100 },
];

export interface ArquetipoInfo {
  orden: number;
  nombre: string;
  condicion: string;
  diagnostico: string;
  riesgo: string;
  intervencion: string;
}

export const ARQUETIPOS_INFO: ArquetipoInfo[] = [
  {
    orden: 1,
    nombre: "Innovación Bloqueada",
    condicion: "La Toma de Decisiones es la dimensión más baja.",
    diagnostico:
      "La empresa cuenta con condiciones parciales para innovar, pero la " +
      "toma de decisiones limita la velocidad y continuidad de las " +
      "iniciativas.",
    riesgo:
      "La innovación puede quedar atrapada en aprobaciones, burocracia o " +
      "falta de priorización.",
    intervencion:
      "Rediseñar la gobernanza de innovación, definir criterios de " +
      "priorización y establecer ciclos rápidos de decisión.",
  },
  {
    orden: 2,
    nombre: "Innovación Operativa",
    condicion:
      "Proyectos y Equipos altos, pero Estrategia & Portafolio débil.",
    diagnostico:
      "La empresa ejecuta iniciativas y moviliza equipos, pero aún " +
      "necesita mayor dirección estratégica y lógica de portafolio.",
    riesgo:
      "Puede haber esfuerzo e inversión dispersa, sin foco claro ni " +
      "escalabilidad.",
    intervencion:
      "Diseñar un portafolio de innovación, conectar proyectos con " +
      "prioridades estratégicas y definir métricas de impacto.",
  },
  {
    orden: 3,
    nombre: "Innovación Discursiva",
    condicion: "Cultura y Estrategia altas, Proyectos bajo y con brecha amplia.",
    diagnostico:
      "Existe una narrativa favorable hacia la innovación, pero todavía " +
      "no se traduce en proyectos, pilotos o aprendizajes sistemáticos.",
    riesgo:
      "La innovación puede quedarse como discurso estratégico sin impacto " +
      "visible en el negocio.",
    intervencion:
      "Construir un pipeline de iniciativas, lanzar pilotos de baja " +
      "complejidad y medir aprendizajes tempranos.",
  },
  {
    orden: 4,
    nombre: "Innovación Ecosistémica Emergente",
    condicion:
      "Colaboración Externa y Estrategia altas, sin bloqueadores activos.",
    diagnostico:
      "La empresa muestra señales de un sistema de innovación conectado " +
      "con la estrategia y con actores externos del ecosistema.",
    riesgo:
      "El principal riesgo es no capturar todo el valor por falta de " +
      "escalamiento o gestión sistemática del portafolio.",
    intervencion:
      "Escalar mecanismos de innovación abierta, fortalecer alianzas " +
      "estratégicas y explorar modelos como venture clienting o pilotos " +
      "con startups.",
  },
  {
    orden: 5,
    nombre: "Innovación en Transición",
    condicion: "Arquetipo por defecto si no aplica ninguna condición anterior.",
    diagnostico:
      "La empresa muestra avances parciales, pero todavía no presenta un " +
      "patrón dominante claro de madurez en innovación.",
    riesgo:
      "El riesgo es avanzar de forma fragmentada, sin una prioridad clara " +
      "de intervención.",
    intervencion:
      "Identificar la dimensión crítica, ordenar capacidades internas y " +
      "definir una hoja de ruta de innovación priorizada.",
  },
];

export const PLAYBOOK_QUICK_WINS: Record<string, string[]> = {
  cultura: [
    "Instalar desafíos internos orientados a problemas",
    "Activar champions de innovación",
    "Diseñar incentivos para experimentación",
  ],
  equipos: [
    "Crear equipo núcleo con ownership claro",
    "Definir roles para innovación transversal",
    "Fortalecer capacidades en métodos ágiles",
  ],
  proyectos: [
    "Diseñar pipeline de pilotos",
    "Implementar lógica de experimentación",
    "Medir aprendizaje e impacto de iniciativas",
  ],
  toma_decisiones: [
    "Establecer comité ágil de innovación",
    "Definir criterios de priorización",
    "Reducir tiempos de decisión para pilotos",
  ],
  colaboracion_externa: [
    "Mapear y activar aliados estratégicos",
    "Lanzar pilotos con actores externos",
    "Diseñar mecanismo de innovación abierta",
  ],
  estrategia_portafolio: [
    "Definir focos estratégicos de innovación",
    "Construir portafolio balanceado",
    "Conectar innovación con crecimiento",
  ],
};

export const PERFIL_EJEMPLO_RADAR: Record<string, number> = {
  cultura: 3.3,
  equipos: 2.7,
  proyectos: 2.0,
  toma_decisiones: 2.3,
  colaboracion_externa: 3.0,
  estrategia_portafolio: 3.6,
};
