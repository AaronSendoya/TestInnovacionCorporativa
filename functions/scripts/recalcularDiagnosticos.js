/**
 * Recalcula los campos derivados de cada diagnostico ya guardado en Firestore
 * (dimensionCritica, dimensionesCriticas, arquetipo, nivelInnovacion, quickWins,
 * niveles por dimension, etc.) usando las reglas de negocio ACTUALES, a partir
 * de scoresPorDimension (que si esta presente desde el primer diagnostico).
 *
 * Uso: node functions/scripts/recalcularDiagnosticos.js
 * Requiere el emulador de Firestore corriendo (npm run emulators).
 */

process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085";

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const DIMENSIONES_PREGUNTAS = {
  cultura: 3,
  equipos: 3,
  proyectos: 3,
  toma_decisiones: 3,
  colaboracion_externa: 3,
  estrategia_portafolio: 3,
};

const PESOS_NIVEL_INNOVACION = {
  cultura: 0.14,
  equipos: 0.12,
  proyectos: 0.22,
  toma_decisiones: 0.18,
  colaboracion_externa: 0.12,
  estrategia_portafolio: 0.22,
};

const PLAYBOOK_INTERVENCIONES = {
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

function resolverNivelInnovacion(scores) {
  const scorePonderado = Object.entries(PESOS_NIVEL_INNOVACION).reduce(
    (acc, [dimension, peso]) => acc + (scores[dimension] || 0) * peso,
    0
  );
  const score100 = scorePonderado * 25;
  if (score100 <= 44.0) return "Reactiva";
  if (score100 <= 64.0) return "Operativa";
  if (score100 <= 84.0) return "Estructurada";
  return "Ecosistémica";
}

function calcularVariablesDerivadas(scores) {
  const valoresScores = Object.values(scores);
  const score_minimo = Math.min(...valoresScores);
  const score_maximo = Math.max(...valoresScores);
  const brecha = parseFloat((score_maximo - score_minimo).toFixed(2));

  let bloqueadores_activos = 0;
  const dimension_critica = [];
  const fortalezas = [];

  for (const [dimension, score] of Object.entries(scores)) {
    if (score < 2.0) bloqueadores_activos++;
    if (score === score_minimo) dimension_critica.push(dimension);
    if (score === score_maximo) fortalezas.push(dimension);
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

function resolverArquetipo(variables) {
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

function nivelDeScore(score) {
  if (score >= 3) return "Alto";
  if (score >= 2) return "Medio";
  return "Bajo";
}

async function main() {
  const app = initializeApp({ projectId: "diagnosticoimnovacion" });
  const db = getFirestore(app);

  const snapshot = await db.collection("diagnosticos").get();
  console.log(`Encontrados ${snapshot.size} diagnósticos.`);

  let actualizados = 0;
  let omitidos = 0;
  const cambios = [];

  const batch = db.batch();
  let operacionesEnBatch = 0;

  for (const doc of snapshot.docs) {
    const datos = doc.data();
    const scores = datos.scoresPorDimension;

    if (!scores || Object.keys(DIMENSIONES_PREGUNTAS).some((d) => typeof scores[d] !== "number")) {
      omitidos++;
      console.warn(`- Omitido ${doc.id} (${datos.empresa?.nombre ?? "sin nombre"}): scoresPorDimension inválido o ausente.`);
      continue;
    }

    const variables = calcularVariablesDerivadas(scores);
    const arquetipoInfo = resolverArquetipo(variables);
    const nivelInnovacion = resolverNivelInnovacion(scores);
    const dimensionCritica = variables.dimension_critica[0];
    const quickWins = PLAYBOOK_INTERVENCIONES[dimensionCritica] || [];

    const dimensionesArray = Object.values(scores);
    const sumaDimensiones = dimensionesArray.reduce((a, b) => a + b, 0);
    const scorePonderado = parseFloat(
      (sumaDimensiones / (dimensionesArray.length || 1)).toFixed(2)
    );
    const scoreTotal100 = parseFloat(((scorePonderado / 4.0) * 100).toFixed(2));

    const nivelesPorDimension = {};
    for (const [dimension, val] of Object.entries(scores)) {
      nivelesPorDimension[dimension] = nivelDeScore(val);
    }

    const actualizacion = {
      dimensionCritica,
      dimensionesCriticas: variables.dimension_critica,
      nivelInnovacion,
      brecha: variables.brecha,
      arquetipo: arquetipoInfo.arquetipo,
      diagnostico: arquetipoInfo.diagnostico,
      riesgo: arquetipoInfo.riesgo,
      intervencion: arquetipoInfo.intervencion,
      quickWins,
      nivelesPorDimension,
      scorePonderado,
      scoreTotal100,
      playbookPorDimension: PLAYBOOK_INTERVENCIONES,
    };

    if ("contexto" in datos) {
      actualizacion.contexto = FieldValue.delete();
    }

    const huboCambio = Object.entries(actualizacion).some(([campo, valor]) => {
      if (campo === "contexto") return true;
      return JSON.stringify(datos[campo]) !== JSON.stringify(valor);
    });

    if (!huboCambio) {
      continue;
    }

    batch.update(doc.ref, actualizacion);
    operacionesEnBatch++;
    actualizados++;
    cambios.push({
      id: doc.id,
      empresa: datos.empresa?.nombre ?? "sin nombre",
      arquetipoAntes: datos.arquetipo,
      arquetipoDespues: arquetipoInfo.arquetipo,
      nivelInnovacionAntes: datos.nivelInnovacion ?? null,
      nivelInnovacionDespues: nivelInnovacion,
      teniaContexto: "contexto" in datos,
    });

    if (operacionesEnBatch === 400) {
      await batch.commit();
      operacionesEnBatch = 0;
    }
  }

  if (operacionesEnBatch > 0) {
    await batch.commit();
  }

  console.log(`\nActualizados: ${actualizados}. Omitidos (sin scores válidos): ${omitidos}.`);
  console.log("\nDetalle de cambios:");
  console.log(JSON.stringify(cambios, null, 2));
}

main().catch((err) => {
  console.error("FALLO:", err);
  process.exit(1);
});
