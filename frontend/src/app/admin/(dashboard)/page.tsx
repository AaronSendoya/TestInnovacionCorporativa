"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminSidebar, { type SeccionAdmin } from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ResumenGeneral from "@/components/admin/ResumenGeneral";
import RegistrosTabla from "@/components/admin/RegistrosTabla";

const TITULOS_SECCION: Record<SeccionAdmin, { titulo: string; subtitulo: string }> = {
  resumen: {
    titulo: "Resumen general",
    subtitulo: "Vista ejecutiva del diagnóstico",
  },
  registros: {
    titulo: "Registros",
    subtitulo: "Historial completo de diagnósticos",
  },
  dimensiones: {
    titulo: "Dimensiones",
    subtitulo: "Perfil y comparación por dimensión",
  },
  empresas: {
    titulo: "Empresas",
    subtitulo: "Mapa de calor y últimos diagnósticos",
  },
  evolucion: {
    titulo: "Evolución",
    subtitulo: "Tendencia temporal de madurez",
  },
  oportunidades: {
    titulo: "Oportunidades",
    subtitulo: "Alertas y focos de mejora prioritarios",
  },
};

export default function AdminPage() {
  const router = useRouter();
  const [navegacion, setNavegacion] = useState<{
    seccion: SeccionAdmin;
    key: number;
  }>({ seccion: "resumen", key: 0 });
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  function navegarA(seccion: SeccionAdmin) {
    setNavegacion((actual) => ({ seccion, key: actual.key + 1 }));
    setSidebarAbierto(false);
  }

  async function cerrarSesion() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      router.replace("/admin/login");
    }
  }

  const vista: "resumen" | "registros" =
    navegacion.seccion === "registros" ? "registros" : "resumen";
  const seccionEnfocada =
    navegacion.seccion !== "resumen" && navegacion.seccion !== "registros"
      ? navegacion.seccion
      : null;
  const { titulo, subtitulo } = TITULOS_SECCION[navegacion.seccion];

  return (
    <div className="flex min-h-screen bg-off-white">
      <AdminSidebar
        seccionActiva={navegacion.seccion}
        onNavegar={navegarA}
        abierto={sidebarAbierto}
        onCerrarMovil={() => setSidebarAbierto(false)}
        onCerrarSesion={cerrarSesion}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          titulo={titulo}
          subtitulo={subtitulo}
          onAbrirMenu={() => setSidebarAbierto(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            {vista === "resumen" ? (
              <ResumenGeneral
                seccionEnfocada={seccionEnfocada}
                navKey={navegacion.key}
                onVerRegistros={() => navegarA("registros")}
              />
            ) : (
              <RegistrosTabla />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
