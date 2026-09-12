import Image from "next/image";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import ContadorNumero from "@/components/ContadorNumero";

const PALETA_ACENTOS = [
  { fondo: "bg-rojo-brillante/10", texto: "text-rojo-brillante" },
  { fondo: "bg-azul/10", texto: "text-azul" },
  { fondo: "bg-naranja/15", texto: "text-naranja" },
  { fondo: "bg-rojo-oscuro/10", texto: "text-rojo-oscuro" },
];

const PASOS_PROCESO = [
  {
    numero: "01",
    titulo: "Responde el cuestionario",
    descripcion: "En 10 minutos responde las 18 preguntas.",
  },
  {
    numero: "02",
    titulo: "Recibe un diagnóstico de la empresa",
    descripcion:
      "El documento incluye score de madurez, arquetipo de innovación y perfil por dimensión.",
  },
  {
    numero: "03",
    titulo: "Activa un plan de acción",
    descripcion: "Identifica acciones concretas para desplegarlas.",
  },
];

const DIMENSIONES = [
  {
    letra: "A",
    titulo: "Cultura",
    descripcion: "Prioridad estratégica y tolerancia al error.",
  },
  {
    letra: "B",
    titulo: "Equipos",
    descripcion: "Estructuras multidisciplinarias con mandato claro.",
  },
  {
    letra: "C",
    titulo: "Proyectos",
    descripcion: "Procesos de pilotaje y medición de impacto.",
  },
  {
    letra: "D",
    titulo: "Toma de Decisiones",
    descripcion: "Agilidad, criterios y presupuesto para innovar.",
  },
  {
    letra: "E",
    titulo: "Colaboración Externa",
    descripcion: "Alianzas, scouting e innovación abierta.",
  },
  {
    letra: "F",
    titulo: "Estrategia & Portafolio",
    descripcion: "Vínculo con el plan estratégico y balance de horizontes.",
  },
];

const ESTADISTICAS = [
  { valor: 18, sufijo: "", etiqueta: "Preguntas" },
  { valor: 6, sufijo: "", etiqueta: "Dimensiones evaluadas" },
  { valor: 10, sufijo: " min", etiqueta: "Tiempo promedio" },
  { valor: 100, sufijo: "%", etiqueta: "Gratuito" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gris-oscuro">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center transition-opacity duration-300 hover:opacity-80">
            <Image
              src="/corporate-innovation-logo-black.png"
              alt="Corporate Innovation - Powered by Pista8"
              width={1534}
              height={639}
              priority
              className="h-11 w-auto sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-10 sm:flex">
            <a
              href="#como-funciona"
              className="group relative text-sm text-off-white/80 transition-colors duration-300 hover:text-off-white"
            >
              Cómo funciona
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-rojo-brillante transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#dimensiones"
              className="group relative text-sm text-off-white/80 transition-colors duration-300 hover:text-off-white"
            >
              Dimensiones
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-rojo-brillante transition-all duration-300 group-hover:w-full" />
            </a>
            <Link
              href="/admin/login"
              className="rounded-full border border-off-white/30 px-5 py-2 text-sm font-medium text-off-white transition-all duration-300 hover:border-off-white hover:bg-off-white hover:text-gris-oscuro"
            >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="como-funciona" className="relative scroll-mt-24 overflow-hidden">
        <svg
          aria-hidden="true"
          className="animate-girar-lento pointer-events-none absolute -right-24 -top-20 origin-center opacity-[0.05]"
          width="560"
          height="680"
          viewBox="0 0 560 680"
          fill="none"
        >
          <path
            d="M280 40 L460 420 L280 330 L100 420 Z"
            stroke="#425051"
            strokeWidth="2"
          />
        </svg>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-28 md:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-32">
          <div className="flex flex-col gap-7">
            <span
              className="animate-entrada text-xs font-bold uppercase tracking-[0.14em] text-gris-medio"
              style={{ animationDelay: "0ms" }}
            >
              Diagnóstico de innovación corporativa
            </span>

            <h1
              className="animate-entrada font-heading text-5xl leading-[1.03] tracking-tight text-gris-oscuro sm:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Claridad absoluta para dar el siguiente {" "}
              <span className="relative whitespace-nowrap">
                gran salto corporativo
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 220 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 7 Q110 -3 220 7"
                    stroke="#FE2800"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p
              className="animate-entrada max-w-md text-lg leading-relaxed text-gris-medio"
              style={{ animationDelay: "160ms" }}
            >
              Una visión clara para identificar oportunidades y tomar decisiones
            </p>

            <div
              className="animate-entrada flex flex-col items-start gap-4 sm:flex-row sm:items-center"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/diagnostico"
                className="animate-pulso rounded-full bg-rojo-brillante px-8 py-3.5 font-heading text-base text-off-white transition-transform duration-300 hover:scale-[1.03]"
              >
                Comenzar diagnóstico →
              </Link>
              <span className="text-sm text-gris-medio">
                10 min · Resultados al instante
              </span>
            </div>
          </div>

          <div
            className="animate-entrada relative"
            style={{ animationDelay: "200ms" }}
          >
            <div className="animate-flotar-suave rotate-1 overflow-hidden rounded-2xl border border-gris-verde/20 bg-white shadow-2xl shadow-gris-oscuro/20 transition-transform duration-500 hover:rotate-0">
              <div className="flex items-center gap-2 border-b border-gris-verde/15 px-5 py-3.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rojo-oscuro/40 transition-colors duration-300 hover:bg-rojo-oscuro" />
                <span className="h-2.5 w-2.5 rounded-full bg-naranja/40 transition-colors duration-300 hover:bg-naranja" />
                <span className="h-2.5 w-2.5 rounded-full bg-gris-verde/60 transition-colors duration-300 hover:bg-gris-verde" />
                <span className="ml-3 text-xs text-gris-verde">
                  pista8.com/diagnostico
                </span>
              </div>

              <div className="flex flex-col gap-5 px-8 py-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-gris-medio">
                    Proceso
                  </span>
                  <h2 className="mt-1 font-heading text-2xl leading-tight text-gris-oscuro">
                    Cómo funciona el diagnóstico
                  </h2>
                </div>

                <div className="flex flex-col">
                  {PASOS_PROCESO.map((paso, indice) => {
                    const acento = PALETA_ACENTOS[indice % PALETA_ACENTOS.length];
                    return (
                      <div
                        key={paso.numero}
                        className={`flex items-start gap-4 py-4 ${
                          indice < PASOS_PROCESO.length - 1
                            ? "border-b border-gris-verde/15"
                            : ""
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-heading text-sm ${acento.fondo} ${acento.texto}`}
                        >
                          {paso.numero}
                        </span>
                        <div>
                          <h3 className="font-heading text-sm text-gris-oscuro">
                            {paso.titulo}
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-gris-medio">
                            {paso.descripcion}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="border-y border-gris-verde/20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-6 py-11 sm:grid-cols-4 lg:px-10">
          {ESTADISTICAS.map((estadistica, indice) => {
            const acento = PALETA_ACENTOS[indice % PALETA_ACENTOS.length];
            return (
              <RevealOnScroll
                key={estadistica.etiqueta}
                retrasoMs={indice * 100}
                className={`px-4 py-4 text-center transition-transform duration-500 hover:-translate-y-1 sm:py-0 ${
                  indice < ESTADISTICAS.length - 1
                    ? "border-b border-gris-verde/20 sm:border-b-0 sm:border-r"
                    : ""
                }`}
              >
                <div className={`font-heading text-4xl ${acento.texto}`}>
                  <ContadorNumero valorFinal={estadistica.valor} />
                  {estadistica.sufijo}
                </div>
                <div className="mt-1 text-sm text-gris-medio">
                  {estadistica.etiqueta}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* 6 dimensiones */}
      <section id="dimensiones" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-6xl px-6 pt-24 lg:px-10 lg:pt-32">
          <RevealOnScroll className="flex items-center justify-center rounded-2xl border-l-4 border-rojo-brillante bg-off-white px-8 py-10 text-center sm:px-10">
            <p className="font-heading text-2xl leading-snug text-gris-oscuro sm:text-3xl">
              Impulsar la innovación a través de capacidades operativas y estratégicas sólidas
            </p>
          </RevealOnScroll>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pb-24 pt-16 lg:grid-cols-[0.75fr_1.25fr] lg:px-10 lg:pb-32 lg:pt-20">
          <RevealOnScroll>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-gris-medio">
              Modelo
            </span>
            <h2 className="mt-3 max-w-xs font-heading text-4xl leading-tight text-gris-oscuro">
              Evaluamos 6 dimensiones clave
            </h2>
            <p className="mt-4 max-w-xs text-gris-medio">
              Cada dimensión revela un aspecto distinto de la madurez en
              innovación.
            </p>
          </RevealOnScroll>

          <div className="flex flex-col">
            {DIMENSIONES.map((dimension, indice) => {
              return (
                <RevealOnScroll
                  key={dimension.letra}
                  retrasoMs={indice * 70}
                  className={`group flex flex-col gap-3 py-5 transition-colors duration-300 hover:bg-off-white sm:flex-row sm:items-center sm:gap-6 sm:px-4 ${
                    indice < DIMENSIONES.length - 1
                      ? "border-b border-gris-verde/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rojo-brillante/10 font-heading text-sm font-semibold text-rojo-brillante transition-transform duration-300 group-hover:scale-110">
                      {dimension.letra}
                    </span>
                    <span className="font-heading text-lg text-gris-oscuro transition-transform duration-300 group-hover:translate-x-1 sm:min-w-[220px]">
                      {dimension.titulo}
                    </span>
                  </div>
                  <span className="pl-[3.25rem] text-sm text-gris-medio sm:pl-0">
                    {dimension.descripcion}
                  </span>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-gris-oscuro">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          aria-hidden="true"
          className="animate-girar-lento origin-center opacity-[0.06]"
          width="640"
          height="640"
          viewBox="0 0 640 640"
          fill="none"
        >
          <path
            d="M320 60 L500 420 L320 340 L140 420 Z"
            stroke="#F2F3EE"
            strokeWidth="2"
          />
        </svg>
        </div>

        <RevealOnScroll className="relative mx-auto max-w-2xl px-6 py-28 text-center lg:px-10">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-off-white/50">
            Empieza hoy
          </span>
          <h2 className="mx-auto mt-4 max-w-lg font-heading text-4xl leading-tight text-off-white sm:text-5xl">
            Conoce el nivel de madurez en innovación
          </h2>
          <p className="mt-4 text-off-white/65">
            Gratis. Resultados al instante.
          </p>
          <Link
            href="/diagnostico"
            className="animate-pulso mt-8 inline-block rounded-full bg-rojo-brillante px-8 py-3.5 font-heading text-base text-off-white transition-transform duration-300 hover:scale-[1.03]"
          >
            Comenzar diagnóstico →
          </Link>
        </RevealOnScroll>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-7 text-sm text-gris-medio lg:px-10">
        <span className="font-heading text-gris-oscuro">PISTA8</span>
        <span>© {new Date().getFullYear()} Pista8. Todos los derechos reservados.</span>
      </footer>
    </div>
  );
}
