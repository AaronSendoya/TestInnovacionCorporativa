"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

type EstadoVerificacion = "verificando" | "autorizado" | "no-autorizado";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoVerificacion>("verificando");

  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setEstado("no-autorizado");
        router.replace("/admin/login");
        return;
      }

      try {
        const resultadoToken = await usuario.getIdTokenResult(true);
        if (resultadoToken.claims.admin === true) {
          setEstado("autorizado");
          return;
        }
      } catch (error) {
        console.error("Error al verificar el token de administrador:", error);
      }

      setEstado("no-autorizado");
      router.replace("/admin/login");
    });

    return () => cancelarSuscripcion();
  }, [router]);

  if (estado !== "autorizado") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white">
        <Loader2
          className="h-8 w-8 animate-spin text-rojo-brillante"
          aria-hidden="true"
        />
      </div>
    );
  }

  return <>{children}</>;
}
