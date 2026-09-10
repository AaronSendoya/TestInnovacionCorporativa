"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error inesperado en la aplicación:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-off-white px-6 text-center">
      <AlertTriangle className="h-10 w-10 text-rojo-brillante" aria-hidden="true" />
      <h1 className="font-heading text-2xl text-gris-oscuro">
        Ocurrió un error inesperado
      </h1>
      <p className="max-w-sm text-sm text-gris-medio">
        Algo salió mal al cargar esta página. Puedes intentar de nuevo o
        volver al inicio.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-rojo-brillante px-6 py-2.5 font-heading text-sm text-off-white transition-transform duration-300 hover:scale-105"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-gris-oscuro/20 px-6 py-2.5 text-sm font-medium text-gris-oscuro transition-colors duration-300 hover:bg-gris-oscuro hover:text-off-white"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
