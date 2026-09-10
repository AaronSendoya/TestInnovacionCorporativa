"use client";

import { useEffect, useState } from "react";

interface ContadorNumeroProps {
  valorFinal: number;
  duracionMs?: number;
}

export default function ContadorNumero({
  valorFinal,
  duracionMs = 1400,
}: ContadorNumeroProps) {
  const [valor, setValor] = useState(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return valorFinal;
    }
    return 0;
  });
  useEffect(() => {
    const prefiereMenosMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefiereMenosMovimiento) {
      return;
    }

    const inicio = performance.now();

    function animar(ahora: number) {
      const progreso = Math.min((ahora - inicio) / duracionMs, 1);
      const facilitado = 1 - Math.pow(1 - progreso, 3);
      setValor(Math.round(facilitado * valorFinal));
      if (progreso < 1) {
        requestAnimationFrame(animar);
      }
    }

    const cuadro = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(cuadro);
  }, [valorFinal, duracionMs]);

  return <>{valor}</>;
}
