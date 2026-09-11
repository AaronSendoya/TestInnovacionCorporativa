process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085";

const admin = require("firebase-admin");

admin.initializeApp({projectId: "diagnosticoimnovacion"});
const db = admin.firestore();

const DIMENSIONES_PREGUNTAS = {
  "cultura": 3,
  "equipos": 3,
  "proyectos": 3,
  "toma_decisiones": 3,
  "colaboracion_externa": 3,
  "estrategia_portafolio": 3,
};

const PLAYBOOK_INTERVENCIONES = {
  "cultura": [
    "Instalar desafíos internos orientados a problemas",
    "Activar champions de innovación",
    "Diseñar incentivos para experimentación",
  ],
  "equipos": [
    "Crear equipo núcleo con ownership claro",
    "Definir roles para innovación transversal",
    "Fortalecer capacidades en métodos ágiles",
  ],
  "proyectos": [
    "Diseñar pipeline de pilotos",
    "Implementar lógica de experimentación",
    "Medir aprendizaje e impacto de iniciativas",
  ],
  "toma_decisiones": [
    "Establecer comité ágil de innovación",
    "Definir criterios de priorización",
    "Reducir tiempos de decisión para pilotos",
  ],
  "colaboracion_externa": [
    "Mapear y activar aliados estratégicos",
    "Lanzar pilotos con actores externos",
    "Diseñar mecanismo de innovación abierta",
  ],
  "estrategia_portafolio": [
    "Definir focos estratégicos de innovación",
    "Construir portafolio balanceado",
    "Conectar innovación con crecimiento",
  ],
};

function resolverArquetipo(dimensionCritica, scores) {
  if (dimensionCritica === "toma_decisiones") {
    return {
      arquetipo: "Innovación Bloqueada",
      diagnostico: "La empresa cuenta con condiciones parciales para " +
        "innovar, pero la toma de decisiones limita la velocidad y " +
        "continuidad de las iniciativas.",
      riesgo: "La innovación puede quedar atrapada en aprobaciones, " +
        "burocracia o falta de priorización.",
      intervencion: "Rediseñar la gobernanza de innovación, definir " +
        "criterios de priorización y establecer ciclos rápidos de " +
        "decisión.",
    };
  }
  if (dimensionCritica === "estrategia_portafolio") {
    return {
      arquetipo: "Innovación Operativa",
      diagnostico: "La empresa ejecuta iniciativas y moviliza equipos, " +
        "pero aún necesita mayor dirección estratégica y lógica de " +
        "portafolio.",
      riesgo: "Puede haber esfuerzo e inversión dispersa, sin foco " +
        "claro ni escalabilidad.",
      intervencion: "Diseñar un portafolio de innovación, conectar " +
        "proyectos con prioridades estratégicas y definir métricas de " +
        "impacto.",
    };
  }
  if (
    scores.cultura >= 3 &&
    scores.estrategia_portafolio >= 3 &&
    scores.proyectos < 2.5
  ) {
    return {
      arquetipo: "Innovación Discursiva",
      diagnostico: "Existe una narrativa favorable hacia la innovación, " +
        "pero todavía no se traduce en proyectos, pilotos o " +
        "aprendizajes sistemáticos.",
      riesgo: "La innovación puede quedarse como discurso estratégico " +
        "sin impacto visible en el negocio.",
      intervencion: "Construir un pipeline de iniciativas, lanzar " +
        "pilotos de baja complejidad y medir aprendizajes tempranos.",
    };
  }
  if (scores.colaboracion_externa >= 3 && scores.estrategia_portafolio >= 3) {
    return {
      arquetipo: "Innovación Ecosistémica Emergente",
      diagnostico: "La empresa muestra señales de un sistema de " +
        "innovación conectado con la estrategia y con actores " +
        "externos del ecosistema.",
      riesgo: "El principal riesgo es no capturar todo el valor por " +
        "falta de escalamiento o gestión sistemática del portafolio.",
      intervencion: "Escalar mecanismos de innovación abierta, " +
        "fortalecer alianzas estratégicas y explorar modelos como " +
        "venture clienting o pilotos con startups.",
    };
  }
  return {
    arquetipo: "Innovación en Transición",
    diagnostico: "La empresa muestra avances parciales, pero todavía " +
      "no presenta un patrón dominante claro de madurez en innovación.",
    riesgo: "El riesgo es avanzar de forma fragmentada, sin una " +
      "prioridad clara de intervención.",
    intervencion: "Identificar la dimensión crítica, ordenar " +
      "capacidades internas y definir una hoja de ruta de innovación " +
      "priorizada.",
  };
}

function nivelDeScore(score) {
  if (score >= 3) {
    return "Alto";
  }
  if (score >= 2) {
    return "Medio";
  }
  return "Bajo";
}

function calcularDiagnostico(perfil, empresa, respuestas, diasAtras) {
  const scores = {};
  for (const dimension of Object.keys(DIMENSIONES_PREGUNTAS)) {
    const valores = respuestas[dimension];
    const suma = valores.reduce((acc, curr) => acc + curr, 0);
    scores[dimension] = parseFloat((suma / valores.length).toFixed(2));
  }

  const dimensionesArray = Object.values(scores);
  const sumaDimensiones = dimensionesArray.reduce((a, b) => a + b, 0);
  const scorePonderado = parseFloat(
    (sumaDimensiones / dimensionesArray.length).toFixed(2),
  );
  const score0a100 = parseFloat(((scorePonderado / 4.0) * 100).toFixed(2));

  let dimensionCritica = Object.keys(scores)[0];
  let scoreMin = scores[dimensionCritica];
  let scoreMax = scores[dimensionCritica];

  for (const [dimension, val] of Object.entries(scores)) {
    if (val < scoreMin) {
      scoreMin = val;
      dimensionCritica = dimension;
    }
    if (val > scoreMax) {
      scoreMax = val;
    }
  }

  const brecha = parseFloat((scoreMax - scoreMin).toFixed(2));
  const arquetipoInfo = resolverArquetipo(dimensionCritica, scores);
  const quickWins = PLAYBOOK_INTERVENCIONES[dimensionCritica] || [];

  const nivelesPorDimension = {};
  for (const [dimension, val] of Object.entries(scores)) {
    nivelesPorDimension[dimension] = nivelDeScore(val);
  }

  const creadoEn = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000),
  );

  return {
    perfil,
    empresa,
    scoresPorDimension: scores,
    nivelesPorDimension,
    scorePonderado,
    scoreTotal100: score0a100,
    dimensionCritica,
    brecha,
    arquetipo: arquetipoInfo.arquetipo,
    diagnostico: arquetipoInfo.diagnostico,
    riesgo: arquetipoInfo.riesgo,
    intervencion: arquetipoInfo.intervencion,
    quickWins,
    playbookPorDimension: PLAYBOOK_INTERVENCIONES,
    creadoEn,
  };
}

const CASOS_MOCK = [
  // Innovación Bloqueada (toma_decisiones crítica)
  {
    empresa: {
      nombre: "Andes Retail S.A.",
      sector: "Retail",
      focos: ["Experiencia del cliente", "Eficiencia operativa"],
    },
    diasAtras: 2,
    r: {
      cultura: [3, 3, 3],
      equipos: [3, 3, 3],
      proyectos: [3, 3, 3],
      toma_decisiones: [1, 1, 2],
      colaboracion_externa: [3, 3, 3],
      estrategia_portafolio: [3, 3, 3],
    },
  },
  {
    empresa: {
      nombre: "Manufacturas del Sur Ltda.",
      sector: "Manufactura",
      focos: ["Eficiencia operativa"],
    },
    diasAtras: 5,
    r: {
      cultura: [4, 3, 4],
      equipos: [3, 4, 3],
      proyectos: [3, 3, 4],
      toma_decisiones: [1, 2, 1],
      colaboracion_externa: [3, 4, 3],
      estrategia_portafolio: [4, 3, 3],
    },
  },
  {
    empresa: {
      nombre: "Grupo Financiero Austral",
      sector: "Servicios Financieros",
      focos: ["Transformación digital", "Nuevos productos"],
    },
    diasAtras: 9,
    r: {
      cultura: [2, 3, 3],
      equipos: [3, 3, 2],
      proyectos: [3, 2, 3],
      toma_decisiones: [2, 1, 1],
      colaboracion_externa: [3, 3, 2],
      estrategia_portafolio: [2, 3, 3],
    },
  },

  // Innovación Operativa (estrategia_portafolio crítica)
  {
    empresa: {
      nombre: "Logística Cordillera SpA",
      sector: "Logística",
      focos: ["Eficiencia operativa"],
    },
    diasAtras: 1,
    r: {
      cultura: [3, 3, 3],
      equipos: [3, 3, 3],
      proyectos: [3, 3, 3],
      toma_decisiones: [3, 3, 3],
      colaboracion_externa: [3, 3, 3],
      estrategia_portafolio: [1, 1, 2],
    },
  },
  {
    empresa: {
      nombre: "Constructora Vientos Ltda.",
      sector: "Construcción",
      focos: ["Sostenibilidad"],
    },
    diasAtras: 6,
    r: {
      cultura: [4, 4, 3],
      equipos: [3, 4, 4],
      proyectos: [4, 3, 4],
      toma_decisiones: [3, 4, 3],
      colaboracion_externa: [4, 3, 4],
      estrategia_portafolio: [2, 1, 1],
    },
  },
  {
    empresa: {
      nombre: "Textiles Patagonia",
      sector: "Textil",
      focos: ["Nuevos productos", "Expansión de mercado"],
    },
    diasAtras: 12,
    r: {
      cultura: [2, 3, 3],
      equipos: [3, 2, 3],
      proyectos: [3, 3, 2],
      toma_decisiones: [3, 3, 2],
      colaboracion_externa: [2, 3, 3],
      estrategia_portafolio: [1, 2, 1],
    },
  },

  // Innovación Discursiva (cultura y estrategia altas, proyectos bajo)
  {
    empresa: {
      nombre: "Servicios Digitales Norte",
      sector: "Tecnología",
      focos: ["Transformación digital"],
    },
    diasAtras: 3,
    r: {
      cultura: [3, 4, 3],
      equipos: [3, 3, 3],
      proyectos: [2, 2, 2],
      toma_decisiones: [3, 3, 3],
      colaboracion_externa: [3, 2, 3],
      estrategia_portafolio: [3, 3, 4],
    },
  },
  {
    empresa: {
      nombre: "Aseguradora Continental",
      sector: "Seguros",
      focos: ["Experiencia del cliente"],
    },
    diasAtras: 8,
    r: {
      cultura: [4, 3, 4],
      equipos: [3, 4, 3],
      proyectos: [2, 1, 2],
      toma_decisiones: [3, 4, 3],
      colaboracion_externa: [3, 3, 2],
      estrategia_portafolio: [4, 3, 3],
    },
  },
  {
    empresa: {
      nombre: "Farmacéutica del Pacífico",
      sector: "Salud",
      focos: ["Nuevos productos", "Sostenibilidad"],
    },
    diasAtras: 15,
    r: {
      cultura: [3, 3, 4],
      equipos: [2, 3, 3],
      proyectos: [2, 2, 1],
      toma_decisiones: [3, 3, 4],
      colaboracion_externa: [2, 3, 2],
      estrategia_portafolio: [3, 4, 3],
    },
  },

  // Innovación Ecosistémica Emergente (colaboración y estrategia altas)
  {
    empresa: {
      nombre: "AgroTech Valle Central",
      sector: "Agroindustria",
      focos: ["Transformación digital", "Sostenibilidad"],
    },
    diasAtras: 4,
    r: {
      cultura: [2, 3, 2],
      equipos: [2, 2, 2],
      proyectos: [3, 3, 3],
      toma_decisiones: [3, 3, 3],
      colaboracion_externa: [4, 3, 4],
      estrategia_portafolio: [3, 4, 3],
    },
  },
  {
    empresa: {
      nombre: "Minera Altiplano S.A.",
      sector: "Minería",
      focos: ["Sostenibilidad"],
    },
    diasAtras: 10,
    r: {
      cultura: [2, 2, 3],
      equipos: [3, 2, 2],
      proyectos: [2, 3, 3],
      toma_decisiones: [3, 3, 3],
      colaboracion_externa: [3, 4, 4],
      estrategia_portafolio: [4, 3, 4],
    },
  },
  {
    empresa: {
      nombre: "EnergíaViva Renovables",
      sector: "Energía",
      focos: ["Sostenibilidad", "Expansión de mercado"],
    },
    diasAtras: 18,
    r: {
      cultura: [2, 3, 3],
      equipos: [2, 3, 2],
      proyectos: [3, 2, 3],
      toma_decisiones: [3, 3, 2],
      colaboracion_externa: [4, 4, 3],
      estrategia_portafolio: [3, 3, 4],
    },
  },

  // Innovación en Transición (default, sin patrón dominante)
  {
    empresa: {
      nombre: "Editorial Horizonte",
      sector: "Editorial",
      focos: ["Nuevos productos"],
    },
    diasAtras: 7,
    r: {
      cultura: [2, 3, 2],
      equipos: [3, 2, 3],
      proyectos: [3, 3, 2],
      toma_decisiones: [3, 2, 3],
      colaboracion_externa: [2, 2, 1],
      estrategia_portafolio: [2, 3, 2],
    },
  },
  {
    empresa: {
      nombre: "TransportesUnidos Ltda.",
      sector: "Transporte",
      focos: ["Eficiencia operativa"],
    },
    diasAtras: 14,
    r: {
      cultura: [3, 2, 2],
      equipos: [2, 3, 3],
      proyectos: [3, 2, 3],
      toma_decisiones: [2, 3, 3],
      colaboracion_externa: [3, 2, 2],
      estrategia_portafolio: [2, 2, 3],
    },
  },
  {
    empresa: {
      nombre: "Hotelera Costa Azul",
      sector: "Turismo",
      focos: ["Experiencia del cliente", "Expansión de mercado"],
    },
    diasAtras: 20,
    r: {
      cultura: [2, 2, 3],
      equipos: [3, 3, 2],
      proyectos: [2, 3, 3],
      toma_decisiones: [3, 2, 3],
      colaboracion_externa: [2, 3, 2],
      estrategia_portafolio: [3, 2, 2],
    },
  },
];

async function main() {
  const batch = db.batch();

  CASOS_MOCK.forEach((caso, index) => {
    const perfil = {
      nombre: `Contacto Demo ${index + 1}`,
      email: `contacto${index + 1}@empresa-demo.cl`,
      cargo: "Gerente de Innovación",
      ...(index % 5 !== 0 && {telefono: `+56 9 1234 ${1000 + index}`}),
    };
    const documento = calcularDiagnostico(
      perfil,
      caso.empresa,
      caso.r,
      caso.diasAtras,
    );
    const docRef = db.collection("diagnosticos").doc();
    batch.set(docRef, documento);
  });

  await batch.commit();
  console.log(
    `Se insertaron ${CASOS_MOCK.length} diagnósticos de prueba ` +
    "en el emulador de Firestore.",
  );
}

main().catch((error) => {
  console.error("Error al sembrar datos mock:", error);
  process.exit(1);
});
