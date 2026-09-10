export const TELEFONO_REGEX = /^[0-9]{6,12}$/;
export const CODIGO_PAIS_REGEX = /^\+[0-9]{1,4}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NOMBRE_REGEX = /^[A-Za-zÀ-ÿ\s'-]+$/;

export const DIMENSIONES_PREGUNTAS: Record<string, number> = {
  cultura: 3,
  equipos: 3,
  proyectos: 3,
  toma_decisiones: 3,
  colaboracion_externa: 3,
  estrategia_portafolio: 3,
};

export const PLAYBOOK_INTERVENCIONES: Record<string, string[]> = {
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

interface ArquetipoInfo {
  arquetipo: string;
  diagnostico: string;
  riesgo: string;
  intervencion: string;
}

export function resolverArquetipo(
  dimensionCritica: string,
  scores: Record<string, number>
): ArquetipoInfo {
  if (dimensionCritica === "toma_decisiones") {
    return {
      arquetipo: "Innovación Bloqueada",
      diagnostico:
        "La empresa cuenta con condiciones parciales para innovar, pero " +
        "la toma de decisiones limita la velocidad y continuidad de las " +
        "iniciativas.",
      riesgo:
        "La innovación puede quedar atrapada en aprobaciones, " +
        "burocracia o falta de priorización.",
      intervencion:
        "Rediseñar la gobernanza de innovación, definir criterios de " +
        "priorización y establecer ciclos rápidos de decisión.",
    };
  }
  if (dimensionCritica === "estrategia_portafolio") {
    return {
      arquetipo: "Innovación Operativa",
      diagnostico:
        "La empresa ejecuta iniciativas y moviliza equipos, pero aún " +
        "necesita mayor dirección estratégica y lógica de portafolio.",
      riesgo:
        "Puede haber esfuerzo e inversión dispersa, sin foco claro ni " +
        "escalabilidad.",
      intervencion:
        "Diseñar un portafolio de innovación, conectar proyectos con " +
        "prioridades estratégicas y definir métricas de impacto.",
    };
  }
  if (
    scores.cultura >= 3 &&
    scores.estrategia_portafolio >= 3 &&
    scores.proyectos < 2.5
  ) {
    return {
      arquetipo: "Innovación Discursiva",
      diagnostico:
        "Existe una narrativa favorable hacia la innovación, pero " +
        "todavía no se traduce en proyectos, pilotos o aprendizajes " +
        "sistemáticos.",
      riesgo:
        "La innovación puede quedarse como discurso estratégico sin " +
        "impacto visible en el negocio.",
      intervencion:
        "Construir un pipeline de iniciativas, lanzar pilotos de baja " +
        "complejidad y medir aprendizajes tempranos.",
    };
  }
  if (scores.colaboracion_externa >= 3 && scores.estrategia_portafolio >= 3) {
    return {
      arquetipo: "Innovación Ecosistémica Emergente",
      diagnostico:
        "La empresa muestra señales de un sistema de innovación " +
        "conectado con la estrategia y con actores externos del " +
        "ecosistema.",
      riesgo:
        "El principal riesgo es no capturar todo el valor por falta de " +
        "escalamiento o gestión sistemática del portafolio.",
      intervencion:
        "Escalar mecanismos de innovación abierta, fortalecer alianzas " +
        "estratégicas y explorar modelos como venture clienting o " +
        "pilotos con startups.",
    };
  }
  return {
    arquetipo: "Innovación en Transición",
    diagnostico:
      "La empresa muestra avances parciales, pero todavía no presenta " +
      "un patrón dominante claro de madurez en innovación.",
    riesgo:
      "El riesgo es avanzar de forma fragmentada, sin una prioridad " +
      "clara de intervención.",
    intervencion:
      "Identificar la dimensión crítica, ordenar capacidades internas y " +
      "definir una hoja de ruta de innovación priorizada.",
  };
}

export function nivelDeScore(score: number): string {
  if (score >= 3) {
    return "Alto";
  }
  if (score >= 2) {
    return "Medio";
  }
  return "Bajo";
}

export function esObjetoValido(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function esTextoValido(valor: unknown, min: number, max: number): valor is string {
  return (
    typeof valor === "string" &&
    valor.trim().length >= min &&
    valor.trim().length <= max
  );
}

export function validarPayload(
  perfil: unknown,
  empresa: unknown,
  contexto: unknown,
  respuestas: unknown
): string | null {
  if (!esObjetoValido(perfil)) {
    return "El objeto 'perfil' es requerido.";
  }
  if (!esObjetoValido(empresa)) {
    return "El objeto 'empresa' es requerido.";
  }
  if (!esObjetoValido(contexto)) {
    return "El objeto 'contexto' es requerido.";
  }
  if (!esObjetoValido(respuestas)) {
    return "El objeto 'respuestas' es requerido.";
  }

  if (!esTextoValido(perfil.nombre, 2, 50)) {
    return "El campo 'perfil.nombre' debe tener entre 2 y 50 caracteres.";
  }
  if (!NOMBRE_REGEX.test((perfil.nombre as string).trim())) {
    return "El campo 'perfil.nombre' solo admite letras y espacios.";
  }
  if (
    typeof perfil.email !== "string" ||
    !EMAIL_REGEX.test(perfil.email.trim())
  ) {
    return "El campo 'perfil.email' debe ser un correo válido.";
  }
  if (!esTextoValido(perfil.cargo, 1, 100)) {
    return "El campo 'perfil.cargo' es requerido.";
  }
  const esOtroCargo = (perfil.cargo as string).trim() === "Otro";
  if (esOtroCargo && !esTextoValido(perfil.cargo_otro, 1, 50)) {
    return (
      "El campo 'perfil.cargo_otro' es requerido cuando el cargo es " +
      "'Otro'."
    );
  }
  if (!esTextoValido(perfil.relacion_decisiones, 1, 100)) {
    return "El campo 'perfil.relacion_decisiones' es requerido.";
  }

  if (perfil.telefono) {
    if (!TELEFONO_REGEX.test(perfil.telefono as string)) {
      return "El teléfono debe contener entre 6 y 12 dígitos numéricos.";
    }
    if (
      !perfil.codigoPais ||
      !CODIGO_PAIS_REGEX.test(perfil.codigoPais as string)
    ) {
      return "Selecciona un código de país válido para el teléfono.";
    }
  }

  if (!esTextoValido(empresa.nombre, 2, 100)) {
    return "El campo 'empresa.nombre' debe tener entre 2 y 100 caracteres.";
  }
  if (!esTextoValido(empresa.sector, 1, 100)) {
    return "El campo 'empresa.sector' es requerido.";
  }
  if (!esTextoValido(empresa.tamano, 1, 50)) {
    return "El campo 'empresa.tamano' es requerido.";
  }
  const focos = empresa.focos;
  if (!Array.isArray(focos) || focos.length < 1 || focos.length > 2) {
    return "El campo 'empresa.focos' debe ser un array de 1 a 2 elementos.";
  }

  for (const campo of ["obstaculo", "prioridad", "impacto", "horizonte"]) {
    if (!esTextoValido((contexto as Record<string, unknown>)[campo], 1, 200)) {
      return `El campo 'contexto.${campo}' es requerido.`;
    }
  }

  for (const [dimension, cantidadEsperada] of Object.entries(
    DIMENSIONES_PREGUNTAS
  )) {
    const valores = (respuestas as Record<string, unknown>)[dimension];

    if (!Array.isArray(valores)) {
      return `Faltan respuestas para la dimensión: ${dimension}`;
    }

    if (valores.length !== cantidadEsperada) {
      return (
        `La dimensión ${dimension} requiere exactamente ` +
        `${cantidadEsperada} respuestas.`
      );
    }

    for (const valor of valores) {
      if (!Number.isInteger(valor) || valor < 1 || valor > 4) {
        return (
          `Valor inválido en la dimensión ${dimension}: debe ser un ` +
          "entero entre 1 y 4."
        );
      }
    }
  }

  return null;
}
