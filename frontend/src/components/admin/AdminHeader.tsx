"use client";

import Image from "next/image";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  titulo: string;
  subtitulo: string;
  onAbrirMenu: () => void;
}

export default function AdminHeader({
  titulo,
  subtitulo,
  onAbrirMenu,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-gris-verde/30 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú de navegación"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gris-oscuro transition-colors hover:bg-off-white lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <Image
        src="/corporate-innovation-logo.png"
        alt="Corporate Innovation"
        width={112}
        height={24}
        className="h-6 w-auto object-contain lg:hidden"
      />

      <div className="hidden h-8 w-px bg-gris-verde/30 lg:block" aria-hidden="true" />

      <div className="min-w-0 lg:flex lg:items-baseline lg:gap-2.5">
        <h1 className="truncate font-heading text-lg text-gris-oscuro sm:text-xl">
          {titulo}
        </h1>
        <p className="hidden truncate text-sm text-gris-medio lg:block">
          {subtitulo}
        </p>
      </div>
    </header>
  );
}
