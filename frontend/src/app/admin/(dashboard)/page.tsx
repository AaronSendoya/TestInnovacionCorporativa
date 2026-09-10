"use client";

import { useState } from "react";
import ResumenGeneral from "@/components/admin/ResumenGeneral";
import RegistrosTabla from "@/components/admin/RegistrosTabla";

type Vista = "resumen" | "registros";

export default function AdminPage() {
  const [vista, setVista] = useState<Vista>("resumen");

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-gris-verde/30 bg-white">
        <div className="mx-auto flex max-w-6xl gap-7 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setVista("resumen")}
            className={`border-b-2 py-3.5 text-sm font-semibold transition-colors ${
              vista === "resumen"
                ? "border-rojo-brillante text-rojo-brillante"
                : "border-transparent text-gris-medio hover:text-gris-oscuro"
            }`}
          >
            Resumen general
          </button>
          <button
            type="button"
            onClick={() => setVista("registros")}
            className={`border-b-2 py-3.5 text-sm font-semibold transition-colors ${
              vista === "registros"
                ? "border-rojo-brillante text-rojo-brillante"
                : "border-transparent text-gris-medio hover:text-gris-oscuro"
            }`}
          >
            Registros
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {vista === "resumen" ? <ResumenGeneral /> : <RegistrosTabla />}
      </div>
    </div>
  );
}
