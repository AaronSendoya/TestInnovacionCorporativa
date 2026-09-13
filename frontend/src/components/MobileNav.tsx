"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const ENLACES = [
  { href: "#como-funciona", etiqueta: "Cómo funciona" },
  { href: "#dimensiones", etiqueta: "Dimensiones" },
];

export default function MobileNav() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        aria-expanded={abierto}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-off-white transition-colors hover:bg-off-white/10"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {abierto && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-gris-oscuro">
          <div className="flex items-center justify-end px-6 py-4">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-off-white transition-colors hover:bg-off-white/10"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-24">
            {ENLACES.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={() => setAbierto(false)}
                className="font-heading text-2xl text-off-white transition-colors hover:text-rojo-brillante"
              >
                {enlace.etiqueta}
              </a>
            ))}
            <Link
              href="/admin/login"
              onClick={() => setAbierto(false)}
              className="mt-4 rounded-full border border-off-white/30 px-8 py-3 text-base font-medium text-off-white transition-all hover:border-off-white hover:bg-off-white hover:text-gris-oscuro"
            >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
