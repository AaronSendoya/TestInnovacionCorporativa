"use client";

import { useState } from "react";
import Header from "@/components/Header";
import FormularioDiagnostico from "@/components/FormularioDiagnostico";
import DashboardResultados from "@/components/DashboardResultados";
import type { DiagnosticoResultado } from "@/services/diagnostico";

export default function DiagnosticoPage() {
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(
    null
  );

  return (
    <>
      <Header mostrarLogin={false} />
      {resultado ? (
        <DashboardResultados
          resultado={resultado}
          onReiniciar={() => setResultado(null)}
        />
      ) : (
        <FormularioDiagnostico onDiagnosticoCompletado={setResultado} />
      )}
    </>
  );
}
