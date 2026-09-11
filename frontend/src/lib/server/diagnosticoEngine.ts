export const TELEFONO_REGEX = /^[0-9]{6,12}$/;
export const CODIGO_PAIS_REGEX = /^\+[0-9]{1,4}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NOMBRE_REGEX = /^[A-Za-zÀ-ÿ\s'-]+$/;

const VOCALES = new Set("aeiouyáéíóúAEIOUYÁÉÍÓÚ".split(""));

// Palabra sin ninguna vocal (incluyendo "y") entre 5+ letras: casi imposible
// en un nombre/palabra real, muy común al presionar teclas al azar.
function tieneVocalesInsuficientes(palabra: string): boolean {
  const letras = [...palabra].filter((c) => /[a-zA-ZÀ-ÿ]/.test(c));
  if (letras.length < 5) return false;
  return !letras.some((c) => VOCALES.has(c));
}

// Un mismo par de letras dominando la palabra (ej. "sdsdsd..."): tipico de
// pasar los dedos por teclas vecinas del teclado.
function tieneBigramaRepetido(palabra: string): boolean {
  const normalizada = palabra.toLowerCase();
  if (normalizada.length < 5) return false;
  const conteo = new Map<string, number>();
  for (let i = 0; i < normalizada.length - 1; i++) {
    const bigrama = normalizada.slice(i, i + 2);
    conteo.set(bigrama, (conteo.get(bigrama) ?? 0) + 1);
  }
  const totalBigramas = normalizada.length - 1;
  const maxRepeticiones = Math.max(...conteo.values());
  return maxRepeticiones >= 3 && maxRepeticiones / totalBigramas >= 0.25;
}

// Un patron corto (1 a 3 caracteres) que se repite y cubre casi toda la
// palabra (ej. "asdasdasd", "aaaaaa").
function tienePatronCorto(palabra: string): boolean {
  const normalizada = palabra.toLowerCase();
  if (normalizada.length < 6) return false;
  for (let longitudPatron = 1; longitudPatron <= 3; longitudPatron++) {
    const patron = normalizada.slice(0, longitudPatron);
    let coincidencias = 0;
    for (let i = 0; i + longitudPatron <= normalizada.length; i += longitudPatron) {
      if (normalizada.slice(i, i + longitudPatron) === patron) {
        coincidencias += longitudPatron;
      }
    }
    if (coincidencias / normalizada.length >= 0.7) {
      return true;
    }
  }
  return false;
}

export function pareceTextoAleatorio(texto: string): boolean {
  const palabras = texto.trim().split(/\s+/);
  return palabras.some(
    (palabra) =>
      tieneVocalesInsuficientes(palabra) ||
      tieneBigramaRepetido(palabra) ||
      tienePatronCorto(palabra)
  );
}

export const DIMENSIONES_PREGUNTAS: Record<string, number> = {
  cultura: 3,
  equipos: 3,
  proyectos: 3,
  toma_decisiones: 3,
  colaboracion_externa: 3,
  estrategia_portafolio: 3,
};

// Ponderacion exclusiva para clasificar el Nivel de Innovacion (cualitativo);
// no reemplaza el Score de Madurez (promedio simple, ver calcularVariablesDerivadas).
const PESOS_NIVEL_INNOVACION: Record<string, number> = {
  cultura: 0.14,
  equipos: 0.12,
  proyectos: 0.22,
  toma_decisiones: 0.18,
  colaboracion_externa: 0.12,
  estrategia_portafolio: 0.22,
};

export function resolverNivelInnovacion(scores: Record<string, number>): string {
  const scorePonderado = Object.entries(PESOS_NIVEL_INNOVACION).reduce(
    (acc, [dimension, peso]) => acc + (scores[dimension] || 0) * peso,
    0
  );
  const score100 = scorePonderado * 25;

  if (score100 <= 44.0) {
    return "Reactiva";
  }
  if (score100 <= 64.0) {
    return "Operativa";
  }
  if (score100 <= 84.0) {
    return "Estructurada";
  }
  return "Ecosistémica";
}

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

export interface VariablesDerivadas {
  scores: Record<string, number>;
  score_minimo: number;
  score_maximo: number;
  brecha: number;
  bloqueadores_activos: number;
  dimension_critica: string[];
  fortalezas: string[];
}

export function calcularVariablesDerivadas(respuestas: Record<string, number[]>): VariablesDerivadas {
  const scores: Record<string, number> = {};
  for (const dimension of Object.keys(DIMENSIONES_PREGUNTAS)) {
    const valores = respuestas[dimension] || [];
    const suma = valores.reduce((acc, curr) => acc + curr, 0);
    scores[dimension] = valores.length > 0 ? parseFloat((suma / valores.length).toFixed(2)) : 0;
  }

  const valoresScores = Object.values(scores);
  const score_minimo = Math.min(...valoresScores);
  const score_maximo = Math.max(...valoresScores);
  const brecha = parseFloat((score_maximo - score_minimo).toFixed(2));

  let bloqueadores_activos = 0;
  const dimension_critica: string[] = [];
  const fortalezas: string[] = [];

  for (const [dimension, score] of Object.entries(scores)) {
    if (score < 2.0) {
      bloqueadores_activos++;
    }
    if (score === score_minimo) {
      dimension_critica.push(dimension);
    }
    if (score === score_maximo) {
      fortalezas.push(dimension);
    }
  }

  return {
    scores,
    score_minimo,
    score_maximo,
    brecha,
    bloqueadores_activos,
    dimension_critica,
    fortalezas,
  };
}

export function resolverArquetipo(
  variables: VariablesDerivadas
): ArquetipoInfo {
  const { scores, brecha, bloqueadores_activos } = variables;
  const toma_decisiones = scores.toma_decisiones || 0;
  const cultura = scores.cultura || 0;
  const estrategia_portafolio = scores.estrategia_portafolio || 0;
  const proyectos = scores.proyectos || 0;
  const equipos = scores.equipos || 0;
  const colaboracion_externa = scores.colaboracion_externa || 0;

  if (toma_decisiones < 2.5) {
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
  } else if (proyectos >= 3.0 && equipos >= 3.0 && estrategia_portafolio < 2.8) {
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
  } else if (
    cultura >= 3.2 &&
    estrategia_portafolio >= 3.2 &&
    proyectos < 2.8 &&
    brecha > 1.0
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
  } else if (
    colaboracion_externa >= 3.4 &&
    estrategia_portafolio >= 3.4 &&
    brecha <= 0.6 &&
    bloqueadores_activos === 0
  ) {
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
  } else {
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
  respuestas: unknown
): string | null {
  if (!esObjetoValido(perfil)) {
    return "El objeto 'perfil' es requerido.";
  }
  if (!esObjetoValido(empresa)) {
    return "El objeto 'empresa' es requerido.";
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
  if (pareceTextoAleatorio((perfil.nombre as string).trim())) {
    return "El campo 'perfil.nombre' no parece un nombre válido.";
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
  if (esOtroCargo) {
    if (!esTextoValido(perfil.cargo_otro, 1, 50)) {
      return (
        "El campo 'perfil.cargo_otro' es requerido cuando el cargo es " +
        "'Otro'."
      );
    }
    if (pareceTextoAleatorio((perfil.cargo_otro as string).trim())) {
      return "El campo 'perfil.cargo_otro' no parece un cargo válido.";
    }
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
  if (pareceTextoAleatorio((empresa.nombre as string).trim())) {
    return "El campo 'empresa.nombre' no parece un nombre de empresa válido.";
  }
  if (!esTextoValido(empresa.sector, 1, 100)) {
    return "El campo 'empresa.sector' es requerido.";
  }
  const esOtroSector = (empresa.sector as string).trim() === "Otro";
  if (esOtroSector) {
    if (!esTextoValido(empresa.sector_otro, 1, 30)) {
      return (
        "El campo 'empresa.sector_otro' es requerido cuando el sector es " +
        "'Otro'."
      );
    }
    if (pareceTextoAleatorio((empresa.sector_otro as string).trim())) {
      return "El campo 'empresa.sector_otro' no parece un sector válido.";
    }
  }
  const focos = empresa.focos;
  if (!Array.isArray(focos) || focos.length < 1 || focos.length > 3) {
    return "El campo 'empresa.focos' debe ser un array de 1 a 3 elementos.";
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
