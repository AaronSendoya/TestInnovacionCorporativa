"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Lightbulb,
  Loader2,
  Rocket,
  Scale,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  enviarDiagnostico,
  type DiagnosticoPayload,
  type DiagnosticoResultado,
} from "@/services/diagnostico";
import PantallaCargaEnvio from "@/components/PantallaCargaEnvio";
import {
  AR,
  BO,
  BR,
  CA,
  CL,
  CN,
  CO,
  CR,
  CU,
  DE,
  DO,
  EC,
  ES,
  FR,
  GB,
  GT,
  HN,
  IN,
  IT,
  JP,
  MX,
  NI,
  PA,
  PE,
  PR,
  PT,
  PY,
  SV,
  UY,
  VE,
} from "country-flag-icons/react/3x2";

const CARGOS = [
  "CEO / Gerente General",
  "Director/a",
  "Gerente de Innovación",
  "Gerente de Área",
  "Subgerente",
  "Jefe de Proyecto",
  "Coordinador/a",
  "Analista",
  "Consultor/a",
  "Otro",
];

const SECTORES = [
  "Agroindustria",
  "Alimentos",
  "Automotriz",
  "Banca y Finanzas",
  "Construcción",
  "Educación",
  "Energía",
  "Gobierno / Sector Público",
  "Inmobiliario",
  "Logística",
  "Manufactura",
  "Minería",
  "Retail",
  "Salud",
  "Seguros",
  "Tecnología",
  "Telecomunicaciones",
  "Textil",
  "Transporte",
  "Turismo",
  "Otro",
];

const FOCOS_EMPRESA = [
  "Eficiencia operativa",
  "Nuevos productos",
  "Experiencia del cliente",
  "Sostenibilidad",
  "Transformación digital",
  "Expansión de mercado",
  "Reducción de costos",
  "Desarrollo de talento",
  "Automatización de procesos",
  "Inteligencia artificial y datos",
  "Alianzas estratégicas",
  "Cadena de suministro",
];

interface Pais {
  nombre: string;
  iso2: string;
  dial: string;
}

const PAISES: Pais[] = [
  { nombre: "Bolivia", iso2: "BO", dial: "+591" },
  { nombre: "Argentina", iso2: "AR", dial: "+54" },
  { nombre: "Brasil", iso2: "BR", dial: "+55" },
  { nombre: "Chile", iso2: "CL", dial: "+56" },
  { nombre: "Colombia", iso2: "CO", dial: "+57" },
  { nombre: "Costa Rica", iso2: "CR", dial: "+506" },
  { nombre: "Cuba", iso2: "CU", dial: "+53" },
  { nombre: "Ecuador", iso2: "EC", dial: "+593" },
  { nombre: "El Salvador", iso2: "SV", dial: "+503" },
  { nombre: "España", iso2: "ES", dial: "+34" },
  { nombre: "Estados Unidos", iso2: "US", dial: "+1" },
  { nombre: "Guatemala", iso2: "GT", dial: "+502" },
  { nombre: "Honduras", iso2: "HN", dial: "+504" },
  { nombre: "México", iso2: "MX", dial: "+52" },
  { nombre: "Nicaragua", iso2: "NI", dial: "+505" },
  { nombre: "Panamá", iso2: "PA", dial: "+507" },
  { nombre: "Paraguay", iso2: "PY", dial: "+595" },
  { nombre: "Perú", iso2: "PE", dial: "+51" },
  { nombre: "Puerto Rico", iso2: "PR", dial: "+1" },
  { nombre: "República Dominicana", iso2: "DO", dial: "+1" },
  { nombre: "Uruguay", iso2: "UY", dial: "+598" },
  { nombre: "Venezuela", iso2: "VE", dial: "+58" },
  { nombre: "Canadá", iso2: "CA", dial: "+1" },
  { nombre: "Reino Unido", iso2: "GB", dial: "+44" },
  { nombre: "Francia", iso2: "FR", dial: "+33" },
  { nombre: "Alemania", iso2: "DE", dial: "+49" },
  { nombre: "Italia", iso2: "IT", dial: "+39" },
  { nombre: "Portugal", iso2: "PT", dial: "+351" },
  { nombre: "China", iso2: "CN", dial: "+86" },
  { nombre: "Japón", iso2: "JP", dial: "+81" },
  { nombre: "India", iso2: "IN", dial: "+91" },
];

interface BanderaPaisProps {
  iso2: string;
  className?: string;
}

function BanderaPais({ iso2, className }: BanderaPaisProps) {
  const Bandera = BANDERAS[iso2];
  if (!Bandera) {
    return null;
  }
  return (
    <span
      className={clsx(
        "inline-block shrink-0 overflow-hidden rounded-[2px]",
        className
      )}
    >
      <Bandera className="h-full w-full object-cover" />
    </span>
  );
}

const BANDERAS: Record<string, typeof BO> = {
  AR,
  BO,
  BR,
  CA,
  CL,
  CN,
  CO,
  CR,
  CU,
  DE,
  DO,
  EC,
  ES,
  FR,
  GB,
  GT,
  HN,
  IN,
  IT,
  JP,
  MX,
  NI,
  PA,
  PE,
  PR,
  PT,
  PY,
  SV,
  UY,
  VE,
};

const TELEFONO_REGEX = /^[0-9]{6,12}$/;

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

function pareceTextoAleatorio(texto: string): boolean {
  const palabras = texto.trim().split(/\s+/);
  return palabras.some(
    (palabra) =>
      tieneVocalesInsuficientes(palabra) ||
      tieneBigramaRepetido(palabra) ||
      tienePatronCorto(palabra)
  );
}

const dimensionRespuestasSchema = z
  .array(z.number().int().min(1).max(4))
  .length(3, "Debes responder las 3 preguntas de esta dimensión.");

const respuestasSchema = z.object({
  cultura: dimensionRespuestasSchema,
  equipos: dimensionRespuestasSchema,
  proyectos: dimensionRespuestasSchema,
  toma_decisiones: dimensionRespuestasSchema,
  colaboracion_externa: dimensionRespuestasSchema,
  estrategia_portafolio: dimensionRespuestasSchema,
});

const perfilSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "Mínimo 2 caracteres.")
      .max(50, "Máximo 50 caracteres.")
      .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Solo se permiten letras y espacios.")
      .refine(
        (valor) => !pareceTextoAleatorio(valor),
        "Ingresa un nombre válido."
      ),
    email: z.string().email("Ingresa un email válido."),
    pais: z.string().optional(),
    codigoPais: z.string().optional(),
    telefono: z
      .string()
      .max(12, "Máximo 12 dígitos.")
      .regex(/^[0-9]*$/, "Solo se permiten números.")
      .optional(),
    cargo: z.string().min(1, "Selecciona un cargo."),
    cargo_otro: z.string().max(50, "Máximo 50 caracteres.").optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.cargo === "Otro") {
      const cargoOtro = datos.cargo_otro?.trim();
      if (!cargoOtro) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cargo_otro"],
          message: "Especifica tu cargo.",
        });
      } else if (pareceTextoAleatorio(cargoOtro)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cargo_otro"],
          message: "Ingresa un cargo válido.",
        });
      }
    }

    if (datos.telefono?.trim()) {
      if (!TELEFONO_REGEX.test(datos.telefono.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["telefono"],
          message: "Ingresa entre 6 y 12 dígitos.",
        });
      }
      if (!datos.pais || !datos.codigoPais) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pais"],
          message: "Selecciona el país del teléfono.",
        });
      }
    }
  });

const empresaSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "Mínimo 2 caracteres.")
      .max(100, "Máximo 100 caracteres.")
      .refine(
        (valor) => !pareceTextoAleatorio(valor),
        "Ingresa un nombre de empresa válido."
      ),
    sector: z.string().min(1, "Selecciona un sector."),
    sector_otro: z.string().max(30, "Máximo 30 caracteres.").optional(),
    focos: z
      .array(z.string())
      .min(1, "Selecciona al menos 1 foco.")
      .max(3, "Selecciona máximo 3 focos."),
  })
  .superRefine((datos, ctx) => {
    if (datos.sector === "Otro") {
      const sectorOtro = datos.sector_otro?.trim();
      if (!sectorOtro) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sector_otro"],
          message: "Especifica tu sector.",
        });
      } else if (pareceTextoAleatorio(sectorOtro)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sector_otro"],
          message: "Ingresa un sector válido.",
        });
      }
    }
  });

const formularioSchema = z.object({
  perfil: perfilSchema,
  empresa: empresaSchema,
  respuestas: respuestasSchema,
});

type FormularioValues = z.infer<typeof formularioSchema>;
type DimensionKey = keyof FormularioValues["respuestas"];

interface OpcionPregunta {
  valor: number;
  texto: string;
}

interface PreguntaDimension {
  texto: string;
  opciones: OpcionPregunta[];
}

interface DimensionConfig {
  key: DimensionKey;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  preguntas: PreguntaDimension[];
}

const DIMENSIONES: DimensionConfig[] = [
  {
    key: "cultura",
    titulo: "Cultura",
    descripcion:
      "Explora cómo la empresa promueve ideas, experimentación y aprendizaje.",
    icono: Lightbulb,
    preguntas: [
      {
        texto: "La innovación es promovida por la alta dirección.",
        opciones: [
          { valor: 1, texto: "No se menciona como prioridad." },
          { valor: 2, texto: "Se menciona ocasionalmente, sin acciones claras." },
          { valor: 3, texto: "Está en la agenda directiva y se comunica formalmente." },
          { valor: 4, texto: "Es prioridad estratégica con seguimiento activo y resultados medibles." },
        ],
      },
      {
        texto: "La organización permite experimentar y aprender del error.",
        opciones: [
          { valor: 1, texto: "El error se penaliza o evita." },
          { valor: 2, texto: "Se tolera informalmente, pero no se promueve." },
          { valor: 3, texto: "Se permite experimentar en ciertos espacios controlados." },
          { valor: 4, texto: "La experimentación está institucionalizada y se documenta el aprendizaje." },
        ],
      },
      {
        texto: "Las personas pueden proponer ideas con seguridad.",
        opciones: [
          { valor: 1, texto: "No existen canales formales." },
          { valor: 2, texto: "Existen buzones o iniciativas esporádicas." },
          { valor: 3, texto: "Hay mecanismos estructurados de ideación." },
          { valor: 4, texto: "La generación de ideas es constante y parte de la cultura organizacional." },
        ],
      },
    ],
  },
  {
    key: "equipos",
    titulo: "Equipos",
    descripcion:
      "Evalúa si existen roles y equipos responsables de impulsar la innovación.",
    icono: Users,
    preguntas: [
      {
        texto: "Existen equipos multidisciplinarios para innovación.",
        opciones: [
          { valor: 1, texto: "No existen." },
          { valor: 2, texto: "Se forman ocasionalmente." },
          { valor: 3, texto: "Existen equipos formales asignados." },
          { valor: 4, texto: "Hay equipos con mandato, recursos y objetivos definidos." },
        ],
      },
      {
        texto: "¿Qué nivel de capacidades en innovación tienen los equipos?",
        opciones: [
          { valor: 1, texto: "No cuentan con herramientas o metodologías." },
          { valor: 2, texto: "Conocen conceptos básicos pero no los aplican." },
          { valor: 3, texto: "Aplican metodologías en algunos proyectos." },
          { valor: 4, texto: "Tienen capacidades instaladas y replicables en la organización." },
        ],
      },
      {
        texto: "¿Cómo trabajan los equipos en torno a desafíos de innovación?",
        opciones: [
          { valor: 1, texto: "Cada área trabaja de forma independiente." },
          { valor: 2, texto: "Existe colaboración puntual entre áreas." },
          { valor: 3, texto: "Se conforman equipos mixtos según proyectos." },
          { valor: 4, texto: "La colaboración transversal es parte del modelo operativo." },
        ],
      },
    ],
  },
  {
    key: "proyectos",
    titulo: "Proyectos",
    descripcion:
      "Analiza cómo se gestionan las ideas y su transformación en proyectos.",
    icono: Rocket,
    preguntas: [
      {
        texto: "Existe un proceso formal desde idea hasta implementación.",
        opciones: [
          { valor: 1, texto: "No existe proceso." },
          { valor: 2, texto: "Se gestiona de forma informal." },
          { valor: 3, texto: "Existe pipeline o metodología definida." },
          { valor: 4, texto: "Existe un proceso estandarizado de innovación." },
        ],
      },
      {
        texto: "Se realizan pilotos antes de escalar iniciativas.",
        opciones: [
          { valor: 1, texto: "No se realizan pruebas." },
          { valor: 2, texto: "Se prueba ocasionalmente." },
          { valor: 3, texto: "El piloto es parte del proceso." },
          { valor: 4, texto: "Existe cultura de experimentación con proceso de pilotaje y métricas claras." },
        ],
      },
      {
        texto: "¿Cómo se mide el impacto de la innovación?",
        opciones: [
          { valor: 1, texto: "No se mide." },
          { valor: 2, texto: "Se mide de forma básica (actividad, número de ideas)." },
          { valor: 3, texto: "Se utilizan algunos indicadores de resultados." },
          { valor: 4, texto: "Se mide impacto en negocio (ingresos, eficiencia, valor generado)." },
        ],
      },
    ],
  },
  {
    key: "toma_decisiones",
    titulo: "Toma de Decisiones",
    descripcion:
      "Explora cómo se priorizan iniciativas y se asignan recursos para innovar.",
    icono: Scale,
    preguntas: [
      {
        texto: "Existen criterios formales para priorizar proyectos.",
        opciones: [
          { valor: 1, texto: "No existen criterios." },
          { valor: 2, texto: "Se decide por intuición." },
          { valor: 3, texto: "Existen criterios definidos." },
          { valor: 4, texto: "Se prioriza en función de impacto estratégico y valor." },
        ],
      },
      {
        texto: "¿Qué tan ágil es la toma de decisiones para avanzar iniciativas?",
        opciones: [
          { valor: 1, texto: "Las decisiones son lentas y jerárquicas." },
          { valor: 2, texto: "Requiere múltiples validaciones." },
          { valor: 3, texto: "Es ágil en ciertos casos." },
          { valor: 4, texto: "Es rápida, clara y habilita la experimentación." },
        ],
      },
      {
        texto: "Existe presupuesto asignado a innovación.",
        opciones: [
          { valor: 1, texto: "No existe presupuesto específico." },
          { valor: 2, texto: "Se asigna caso por caso." },
          { valor: 3, texto: "Existe presupuesto anual definido." },
          { valor: 4, texto: "Existe fondo estructurado con gobernanza clara." },
        ],
      },
    ],
  },
  {
    key: "colaboracion_externa",
    titulo: "Colaboración Externa",
    descripcion:
      "Evalúa el nivel de colaboración con actores externos del ecosistema.",
    icono: Handshake,
    preguntas: [
      {
        texto: "La empresa colabora con actores externos para innovar.",
        opciones: [
          { valor: 1, texto: "No existe colaboración externa." },
          { valor: 2, texto: "Se colabora ocasionalmente en eventos." },
          { valor: 3, texto: "Tiene colaboraciones activas." },
          { valor: 4, texto: "Cuenta con una estrategia de innovación abierta." },
        ],
      },
      {
        texto: "Existen mecanismos formales de scouting o convocatoria externa.",
        opciones: [
          { valor: 1, texto: "No existen." },
          { valor: 2, texto: "Se realizan esporádicamente." },
          { valor: 3, texto: "Existen convocatorias o procesos definidos." },
          { valor: 4, texto: "Existe modelo continuo de búsqueda e integración externa." },
        ],
      },
      {
        texto: "Se han implementado soluciones provenientes del ecosistema externo.",
        opciones: [
          { valor: 1, texto: "Nunca." },
          { valor: 2, texto: "Casos aislados." },
          { valor: 3, texto: "Se han implementado varias iniciativas." },
          { valor: 4, texto: "La innovación externa es parte del modelo de crecimiento." },
        ],
      },
    ],
  },
  {
    key: "estrategia_portafolio",
    titulo: "Estrategia & Portafolio",
    descripcion:
      "Analiza cómo la innovación se integra en la estrategia de la empresa.",
    icono: Target,
    preguntas: [
      {
        texto: "La innovación está vinculada al plan estratégico.",
        opciones: [
          { valor: 1, texto: "No está vinculada." },
          { valor: 2, texto: "Se menciona en visión general." },
          { valor: 3, texto: "Existen objetivos estratégicos asociados." },
          { valor: 4, texto: "Está integrada en metas y KPIs estratégicos." },
        ],
      },
      {
        texto: "Se gestiona un portafolio balanceado (corto, mediano, largo plazo).",
        opciones: [
          { valor: 1, texto: "No existe portafolio." },
          { valor: 2, texto: "Solo iniciativas de corto plazo." },
          { valor: 3, texto: "Existe cierta diversificación." },
          { valor: 4, texto: "Se gestiona activamente por horizontes de innovación." },
        ],
      },
      {
        texto: "Se diferencian tipos de innovación (incremental, adyacente, disruptiva).",
        opciones: [
          { valor: 1, texto: "No se diferencian." },
          { valor: 2, texto: "Se distinguen informalmente." },
          { valor: 3, texto: "Se clasifican formalmente." },
          { valor: 4, texto: "Se gestionan estratégicamente por categoría." },
        ],
      },
    ],
  },
];

type CampoPaso = "perfil" | "empresa" | `respuestas.${DimensionKey}`;

interface PasoConfig {
  id: string;
  titulo: string;
  descripcion: string;
  campos: CampoPaso[];
}

const PASOS: PasoConfig[] = [
  {
    id: "datos-generales",
    titulo: "Datos generales",
    descripcion:
      "Cuéntanos quién eres y sobre tu organización. Toma menos de un minuto.",
    campos: ["perfil", "empresa"],
  },
  ...DIMENSIONES.map((dimension) => ({
    id: dimension.key,
    titulo: dimension.titulo,
    descripcion: dimension.descripcion,
    campos: [`respuestas.${dimension.key}`] as CampoPaso[],
  })),
];

const VALORES_INICIALES: FormularioValues = {
  perfil: {
    nombre: "",
    email: "",
    pais: "",
    codigoPais: "",
    telefono: "",
    cargo: "",
    cargo_otro: "",
  },
  empresa: {
    nombre: "",
    sector: "",
    sector_otro: "",
    focos: [],
  },
  respuestas: {
    cultura: [],
    equipos: [],
    proyectos: [],
    toma_decisiones: [],
    colaboracion_externa: [],
    estrategia_portafolio: [],
  },
};

function esRespuestaDimensionValida(valores: unknown): valores is number[] {
  return (
    Array.isArray(valores) &&
    valores.length === 3 &&
    valores.every(
      (valor) => typeof valor === "number" && valor >= 1 && valor <= 4
    )
  );
}

function clasesInput(tieneError?: boolean) {
  return clsx(
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gris-oscuro outline-none transition-colors focus:ring-2",
    tieneError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gris-medio focus:border-azul focus:ring-azul/30"
  );
}

function MensajeError({ mensaje }: { mensaje?: string }) {
  if (!mensaje) {
    return null;
  }
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {mensaje}
    </p>
  );
}

interface SelectorPaisProps {
  valor?: string;
  tieneError?: boolean;
  onSeleccionar: (pais: Pais) => void;
  className?: string;
}

function SelectorPais({
  valor,
  tieneError,
  onSeleccionar,
  className,
}: SelectorPaisProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const paisActual = PAISES.find((pais) => pais.iso2 === valor);

  useEffect(() => {
    function alHacerClicFuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, []);

  return (
    <div ref={contenedorRef} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setAbierto((previo) => !previo)}
        className={clsx(
          clasesInput(tieneError),
          "flex w-full items-center justify-between gap-2 text-left"
        )}
      >
        {paisActual ? (
          <span className="flex min-w-0 items-center gap-2">
            <BanderaPais iso2={paisActual.iso2} className="h-3.5 w-5" />
            <span className="truncate">{paisActual.nombre}</span>
          </span>
        ) : (
          <span className="text-gris-medio">Selecciona un país</span>
        )}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-gris-medio"
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gris-verde/40 bg-white py-1 shadow-lg">
          {PAISES.map((pais) => (
            <li key={pais.iso2}>
              <button
                type="button"
                onClick={() => {
                  onSeleccionar(pais);
                  setAbierto(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-off-white",
                  pais.iso2 === valor && "bg-rojo-brillante/5 text-gris-oscuro"
                )}
              >
                <BanderaPais iso2={pais.iso2} className="h-3.5 w-5" />
                <span className="truncate">{pais.nombre}</span>
                <span className="ml-auto shrink-0 text-xs text-gris-medio">
                  {pais.dial}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FormularioDiagnosticoProps {
  onDiagnosticoCompletado: (resultado: DiagnosticoResultado) => void;
}

export default function FormularioDiagnostico({
  onDiagnosticoCompletado,
}: FormularioDiagnosticoProps) {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormularioValues>({
    resolver: zodResolver(formularioSchema),
    defaultValues: VALORES_INICIALES,
    mode: "onChange",
  });
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [pasoActual, setPasoActual] = useState(0);

  const valoresActuales = watch();
  const cargoSeleccionado = valoresActuales.perfil?.cargo;
  const sectorSeleccionado = valoresActuales.empresa?.sector;
  const focosSeleccionados = valoresActuales.empresa?.focos ?? [];
  const limiteFocosAlcanzado = focosSeleccionados.length >= 3;

  const paso = PASOS[pasoActual];
  const esUltimoPaso = pasoActual === PASOS.length - 1;
  const dimensionActual =
    pasoActual >= 1 ? DIMENSIONES[pasoActual - 1] : undefined;

  const datosGeneralesCompletos = Boolean(
    valoresActuales.perfil?.nombre?.trim() &&
      valoresActuales.perfil?.email?.trim() &&
      valoresActuales.perfil?.cargo &&
      (valoresActuales.perfil?.cargo !== "Otro" ||
        valoresActuales.perfil?.cargo_otro?.trim()) &&
      valoresActuales.empresa?.nombre?.trim() &&
      valoresActuales.empresa?.sector &&
      (valoresActuales.empresa?.sector !== "Otro" ||
        valoresActuales.empresa?.sector_otro?.trim()) &&
      (valoresActuales.empresa?.focos?.length ?? 0) >= 1
  );

  const todasLasDimensionesCompletas = DIMENSIONES.every((dimension) =>
    esRespuestaDimensionValida(valoresActuales.respuestas?.[dimension.key])
  );

  const formularioCompletoManualmente =
    datosGeneralesCompletos && todasLasDimensionesCompletas;

  async function irSiguiente() {
    const esValido = await trigger(paso.campos);

    let pasoCompletoManualmente = true;
    if (pasoActual === 0) {
      pasoCompletoManualmente = datosGeneralesCompletos;
    } else if (dimensionActual) {
      pasoCompletoManualmente = esRespuestaDimensionValida(
        valoresActuales.respuestas?.[dimensionActual.key]
      );
    }

    if (esValido || pasoCompletoManualmente) {
      setPasoActual((actual) => Math.min(actual + 1, PASOS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function irAtras() {
    setPasoActual((actual) => Math.max(actual - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function alEnviar(datos: FormularioValues) {
    setErrorEnvio(null);
    try {
      const resultado = await enviarDiagnostico(datos as DiagnosticoPayload);
      onDiagnosticoCompletado(resultado);
    } catch (err) {
      setErrorEnvio(
        err instanceof Error ? err.message : "Error desconocido al enviar."
      );
    }
  }

  const numeroPaso = String(pasoActual + 1).padStart(2, "0");
  const totalPasos = String(PASOS.length).padStart(2, "0");
  const porcentajeAvance = (pasoActual / (PASOS.length - 1)) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      {isSubmitting && <PantallaCargaEnvio />}
      <div className="sticky top-[72px] z-40 border-b border-gris-verde/30 bg-off-white/95 backdrop-blur sm:top-[88px]">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-heading text-lg text-gris-oscuro sm:text-xl">
                  Diagnóstico de Madurez en Innovación
                </h1>
                <p className="text-xs text-gris-medio sm:text-sm">
                  Evalúa las capacidades de innovación de tu organización
                </p>
              </div>
              <span className="font-heading text-sm tabular-nums text-gris-medio">
                {numeroPaso} / {totalPasos}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold text-gris-oscuro">
                  {paso.titulo}
                </p>
                <p className="font-heading text-xs tabular-nums text-rojo-brillante">
                  {Math.round(porcentajeAvance)}%
                </p>
              </div>
              <div className="relative flex h-3 items-center">
                <div className="absolute inset-x-0 h-1.5 overflow-hidden rounded-full bg-gris-verde/20 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rojo-oscuro to-rojo-brillante transition-all duration-500 ease-out"
                    style={{ width: `${porcentajeAvance}%` }}
                  />
                </div>
                <div className="relative flex w-full items-center justify-between">
                  {PASOS.map((pasoItem, indice) => {
                    const completado = indice < pasoActual;
                    const actual = indice === pasoActual;
                    return (
                      <span
                        key={pasoItem.id}
                        className={clsx(
                          "z-10 block h-3 w-3 rounded-full border-2 bg-white transition-all duration-300",
                          completado && "border-rojo-brillante bg-rojo-brillante",
                          actual &&
                            "scale-125 border-rojo-brillante shadow-[0_0_0_4px_rgba(254,40,0,0.18)]",
                          !completado &&
                            !actual &&
                            "border-gris-verde/40"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      <form
        onSubmit={handleSubmit(alEnviar)}
        className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div
          key={paso.id}
          className="animate-paso-entrada flex flex-col gap-6 rounded-xl border border-gris-verde/40 bg-white p-5"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {dimensionActual && (
                <dimensionActual.icono
                  className="h-6 w-6 text-rojo-brillante"
                  aria-hidden="true"
                />
              )}
              <h2 className="font-heading text-2xl text-gris-oscuro">
                {paso.titulo}
              </h2>
            </div>
            <p className="text-sm text-gris-medio">{paso.descripcion}</p>
          </div>

          {pasoActual === 0 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gris-oscuro">
                  Nombre Completo
                  <input
                    maxLength={50}
                    {...register("perfil.nombre")}
                    className={clasesInput(!!errors.perfil?.nombre)}
                  />
                  <MensajeError mensaje={errors.perfil?.nombre?.message} />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gris-oscuro">
                  Email
                  <input
                    type="email"
                    {...register("perfil.email")}
                    className={clasesInput(!!errors.perfil?.email)}
                  />
                  <MensajeError mensaje={errors.perfil?.email?.message} />
                </label>

                <div className="flex flex-col gap-1 text-sm text-gris-oscuro sm:col-span-2">
                  <span>Teléfono (opcional)</span>
                  <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] gap-2">
                    <SelectorPais
                      valor={valoresActuales.perfil?.pais}
                      tieneError={!!errors.perfil?.pais}
                      onSeleccionar={(pais) => {
                        setValue("perfil.pais", pais.iso2, {
                          shouldValidate: true,
                        });
                        setValue("perfil.codigoPais", pais.dial, {
                          shouldValidate: true,
                        });
                      }}
                    />

                    <input
                      readOnly
                      placeholder="+_"
                      tabIndex={-1}
                      {...register("perfil.codigoPais")}
                      className={clsx(
                        clasesInput(false),
                        "cursor-not-allowed bg-gris-verde/10 px-1 text-center"
                      )}
                    />

                    <input
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="71234567"
                      {...register("perfil.telefono")}
                      className={clasesInput(!!errors.perfil?.telefono)}
                    />
                  </div>
                  <MensajeError
                    mensaje={
                      errors.perfil?.telefono?.message ??
                      errors.perfil?.pais?.message
                    }
                  />
                </div>

                <label className="flex flex-col gap-1 text-sm text-gris-oscuro">
                  Cargo
                  <select
                    {...register("perfil.cargo")}
                    className={clasesInput(!!errors.perfil?.cargo)}
                  >
                    <option value="">Selecciona una opción</option>
                    {CARGOS.map((cargo) => (
                      <option key={cargo} value={cargo}>
                        {cargo}
                      </option>
                    ))}
                  </select>
                  <MensajeError mensaje={errors.perfil?.cargo?.message} />
                </label>

                {cargoSeleccionado === "Otro" && (
                  <label className="flex flex-col gap-1 text-sm text-gris-oscuro sm:col-span-2">
                    Especifica tu cargo
                    <input
                      maxLength={50}
                      {...register("perfil.cargo_otro")}
                      className={clasesInput(!!errors.perfil?.cargo_otro)}
                    />
                    <MensajeError
                      mensaje={errors.perfil?.cargo_otro?.message}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gris-oscuro sm:col-span-2">
                  Nombre de la empresa
                  <input
                    maxLength={100}
                    {...register("empresa.nombre")}
                    className={clasesInput(!!errors.empresa?.nombre)}
                  />
                  <MensajeError mensaje={errors.empresa?.nombre?.message} />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gris-oscuro">
                  Sector
                  <select
                    {...register("empresa.sector")}
                    className={clasesInput(!!errors.empresa?.sector)}
                  >
                    <option value="">Selecciona una opción</option>
                    {SECTORES.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                  <MensajeError mensaje={errors.empresa?.sector?.message} />
                </label>

                {sectorSeleccionado === "Otro" && (
                  <label className="flex flex-col gap-1 text-sm text-gris-oscuro sm:col-span-2">
                    Especifica tu sector
                    <input
                      maxLength={30}
                      {...register("empresa.sector_otro")}
                      className={clasesInput(!!errors.empresa?.sector_otro)}
                    />
                    <MensajeError
                      mensaje={errors.empresa?.sector_otro?.message}
                    />
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gris-oscuro">
                  ¿Cuáles son los principales focos de la empresa hoy? (selecciona máximo 3)
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {FOCOS_EMPRESA.map((foco) => {
                    const seleccionado = focosSeleccionados.includes(foco);
                    const deshabilitado =
                      limiteFocosAlcanzado && !seleccionado;
                    return (
                      <label
                        key={foco}
                        className={clsx(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                          seleccionado
                            ? "border-rojo-brillante bg-rojo-brillante/5 text-gris-oscuro"
                            : "border-gris-verde/40 text-gris-medio",
                          deshabilitado && "cursor-not-allowed opacity-50",
                          !deshabilitado &&
                            "cursor-pointer hover:border-gris-medio"
                        )}
                      >
                        <input
                          type="checkbox"
                          value={foco}
                          disabled={deshabilitado}
                          checked={seleccionado}
                          onChange={() => {
                            const nuevosFocos = seleccionado
                              ? focosSeleccionados.filter(
                                  (valor) => valor !== foco
                                )
                              : [...focosSeleccionados, foco];
                            setValue("empresa.focos", nuevosFocos, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          className="h-4 w-4 accent-rojo-brillante"
                        />
                        {foco}
                      </label>
                    );
                  })}
                </div>
                <MensajeError mensaje={errors.empresa?.focos?.message} />
              </div>
            </div>
          )}

          {dimensionActual && (
            <div className="flex flex-col gap-5">
              {dimensionActual.preguntas.map((pregunta, indice) => (
                <fieldset key={indice} className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-medium text-gris-oscuro">
                    {pregunta.texto}
                  </legend>
                  <div className="flex flex-col gap-2">
                    {pregunta.opciones.map((opcion) => {
                      const seleccionado =
                        valoresActuales.respuestas?.[dimensionActual.key]?.[
                          indice
                        ] === opcion.valor;
                      return (
                        <label
                          key={opcion.valor}
                          className={clsx(
                            "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                            seleccionado
                              ? "border-rojo-brillante bg-rojo-brillante/5 text-gris-oscuro"
                              : "border-gris-verde/40 text-gris-medio hover:border-gris-medio"
                          )}
                        >
                          <input
                            type="radio"
                            name={`respuestas.${dimensionActual.key}.${indice}`}
                            value={opcion.valor}
                            checked={seleccionado}
                            onChange={() =>
                              setValue(
                                `respuestas.${dimensionActual.key}.${indice}` as const,
                                opcion.valor,
                                { shouldValidate: true, shouldDirty: true }
                              )
                            }
                            className="mt-1 h-4 w-4 accent-rojo-brillante"
                          />
                          <span>
                            <span className="font-semibold">
                              {opcion.valor}.
                            </span>{" "}
                            {opcion.texto}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              {errors.respuestas?.[dimensionActual.key] && (
                <MensajeError mensaje="Responde las 3 preguntas de esta sección." />
              )}
            </div>
          )}

        </div>

        {errorEnvio && (
          <div className="flex items-center gap-2 rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-4 py-3 text-sm text-rojo-oscuro">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {errorEnvio}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {pasoActual > 0 ? (
            <button
              type="button"
              onClick={irAtras}
              className="flex items-center gap-1 rounded-full border border-gris-medio px-5 py-2.5 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Atrás
            </button>
          ) : (
            <span />
          )}

          {!esUltimoPaso ? (
            <button
              type="button"
              onClick={irSiguiente}
              className="flex items-center gap-1 rounded-full bg-rojo-brillante px-6 py-2.5 font-heading text-sm text-off-white transition-opacity hover:opacity-90"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={(!isValid && !formularioCompletoManualmente) || isSubmitting}
              className="flex items-center justify-center gap-2 rounded-full bg-rojo-brillante px-6 py-3 font-heading text-base text-off-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                "Ver mi diagnóstico"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
