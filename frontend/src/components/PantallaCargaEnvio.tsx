import Image from "next/image";

export default function PantallaCargaEnvio() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-off-white/95 backdrop-blur-sm"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full animate-spin"
          style={{ animationDuration: "1.1s" }}
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#A4A49B"
            strokeOpacity={0.25}
            strokeWidth={6}
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#FE2800"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="90 236.7"
          />
        </svg>
        <Image
          src="/pista8-rocket.png"
          alt=""
          width={44}
          height={54}
          priority
        />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-heading text-lg text-gris-oscuro">
          Procesando tu diagnóstico
        </p>
        <p className="text-sm text-gris-medio">
          Esto toma solo unos segundos...
        </p>
      </div>
    </div>
  );
}
