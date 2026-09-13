"use client";

import Image from "next/image";
import clsx from "clsx";
import {
  Building2,
  ClipboardList,
  FileSpreadsheet,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Target,
  TrendingUp,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type SeccionAdmin =
  | "resumen"
  | "registros"
  | "reportes"
  | "dimensiones"
  | "empresas"
  | "evolucion"
  | "oportunidades"
  | "administradores"
  | "ayuda";

interface ItemNav {
  id: SeccionAdmin;
  etiqueta: string;
  icono: LucideIcon;
  hijo?: ItemNav;
}

interface GrupoNav {
  titulo: string;
  items: ItemNav[];
}

const GRUPOS_NAV: GrupoNav[] = [
  {
    titulo: "Panel administrativo",
    items: [
      { id: "resumen", etiqueta: "Resumen general", icono: LayoutDashboard },
      {
        id: "registros",
        etiqueta: "Registros",
        icono: ClipboardList,
        hijo: { id: "reportes", etiqueta: "Reportes", icono: FileSpreadsheet },
      },
      { id: "dimensiones", etiqueta: "Dimensiones", icono: Target },
      { id: "empresas", etiqueta: "Empresas", icono: Building2 },
      { id: "evolucion", etiqueta: "Evolución", icono: TrendingUp },
      { id: "oportunidades", etiqueta: "Oportunidades", icono: Lightbulb },
    ],
  },
  {
    titulo: "Configuración",
    items: [
      {
        id: "administradores",
        etiqueta: "Usuarios",
        icono: UserCog,
      },
    ],
  },
  {
    titulo: "Soporte",
    items: [{ id: "ayuda", etiqueta: "Ayuda", icono: HelpCircle }],
  },
];

interface AdminSidebarProps {
  seccionActiva: SeccionAdmin;
  onNavegar: (seccion: SeccionAdmin) => void;
  abierto: boolean;
  onCerrarMovil: () => void;
  onCerrarSesion: () => void;
}

export default function AdminSidebar({
  seccionActiva,
  onNavegar,
  abierto,
  onCerrarMovil,
  onCerrarSesion,
}: AdminSidebarProps) {
  return (
    <>
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-gris-oscuro/50 lg:hidden"
          onClick={onCerrarMovil}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-gris-verde/30 bg-white transition-transform duration-300 ease-out",
          "lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0",
          abierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-gris-verde/30 px-5">
          <Image
            src="/corporate-innovation-logo.png"
            alt="Corporate Innovation"
            width={148}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-5">
            {GRUPOS_NAV.map((grupo) => (
              <div key={grupo.titulo}>
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-gris-verde">
                  {grupo.titulo}
                </p>
                <ul className="flex flex-col gap-1">
                  {grupo.items.map((item) => {
                    const activo = item.id === seccionActiva;
                    const hijoVisible =
                      item.hijo &&
                      (item.id === seccionActiva ||
                        item.hijo.id === seccionActiva);
                    const Icono = item.icono;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onNavegar(item.id)}
                          aria-current={activo ? "page" : undefined}
                          className={clsx(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                            activo
                              ? "bg-rojo-brillante/10 text-rojo-brillante"
                              : "text-gris-medio hover:bg-off-white hover:text-gris-oscuro"
                          )}
                        >
                          <span
                            className={clsx(
                              "h-5 w-0.5 shrink-0 rounded-full",
                              activo ? "bg-rojo-brillante" : "bg-transparent"
                            )}
                            aria-hidden="true"
                          />
                          <Icono className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {item.etiqueta}
                        </button>

                        {item.hijo && hijoVisible && (
                          <ul className="mt-1 flex flex-col gap-1 border-l border-gris-verde/30 pl-4">
                            {(() => {
                              const hijo = item.hijo;
                              const hijoActivo = hijo.id === seccionActiva;
                              const IconoHijo = hijo.icono;
                              return (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => onNavegar(hijo.id)}
                                    aria-current={hijoActivo ? "page" : undefined}
                                    className={clsx(
                                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                                      hijoActivo
                                        ? "bg-rojo-brillante/10 text-rojo-brillante"
                                        : "text-gris-medio hover:bg-off-white hover:text-gris-oscuro"
                                    )}
                                  >
                                    <IconoHijo
                                      className="h-3.5 w-3.5 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {hijo.etiqueta}
                                  </button>
                                </li>
                              );
                            })()}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-gris-verde/30 p-3">
          <button
            type="button"
            onClick={onCerrarSesion}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gris-medio transition-colors duration-150 hover:bg-rojo-oscuro/10 hover:text-rojo-oscuro"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
