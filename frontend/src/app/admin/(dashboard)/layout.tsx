"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import { auth } from "@/lib/firebase";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  async function cerrarSesion() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      router.replace("/admin/login");
    }
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col bg-off-white">
        <header className="sticky top-0 z-50 border-b border-gris-verde/30 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Image
              src="/corporate-innovation-logo.png"
              alt="Corporate Innovation - Powered by Pista8"
              width={1534}
              height={639}
              priority
              className="h-9 w-auto sm:h-11"
            />

            <button
              type="button"
              onClick={cerrarSesion}
              className="flex items-center gap-2 rounded-full border border-gris-oscuro px-4 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-oscuro hover:text-off-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar Sesión
            </button>
          </div>
        </header>

        {children}
      </div>
    </AdminGuard>
  );
}
