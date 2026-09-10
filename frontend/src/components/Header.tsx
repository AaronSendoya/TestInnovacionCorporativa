import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  mostrarLogin?: boolean;
}

export default function Header({ mostrarLogin = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gris-verde/30 bg-off-white/95 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/corporate-innovation-logo.png"
            alt="Corporate Innovation - Powered by Pista8"
            width={1534}
            height={639}
            priority
            className="h-12 w-auto sm:h-16"
          />
        </Link>

        {mostrarLogin ? (
          <Link
            href="/admin/login"
            className="rounded-full border border-gris-oscuro px-5 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-oscuro hover:text-off-white"
          >
            Iniciar Sesión
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gris-oscuro transition-colors hover:text-rojo-brillante"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        )}
      </div>
    </header>
  );
}
