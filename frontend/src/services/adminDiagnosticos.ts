import { auth } from "@/lib/firebase";
import type { DiagnosticoResultado } from "@/services/diagnostico";

export interface DiagnosticoAdmin extends DiagnosticoResultado {
  creadoEn: string | null;
}

export interface CursorPagina {
  creadoEn: string | null;
  id: string;
}

export interface PaginaDiagnosticos {
  diagnosticos: DiagnosticoAdmin[];
  hasMore: boolean;
  nextCursor: CursorPagina | null;
  total: number;
}

interface ObtenerDiagnosticosParams {
  limite: number;
  busqueda?: string;
  cursor?: CursorPagina | null;
}

export async function obtenerDiagnosticos({
  limite,
  busqueda,
  cursor,
}: ObtenerDiagnosticosParams): Promise<PaginaDiagnosticos> {
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error("Debes iniciar sesión como administrador.");
  }

  let token: string;
  try {
    token = await usuario.getIdToken();
  } catch {
    throw new Error("No se pudo verificar tu sesión. Vuelve a iniciar sesión.");
  }

  const params = new URLSearchParams({ limite: String(limite) });
  if (busqueda) {
    params.set("busqueda", busqueda);
  }
  if (cursor) {
    params.set("cursorId", cursor.id);
    if (cursor.creadoEn) {
      params.set("cursorCreadoEn", cursor.creadoEn);
    }
  }

  let response: Response;
  try {
    response = await fetch(`/api/admin-diagnosticos?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(
      cuerpo?.error || "No se pudieron cargar los diagnósticos."
    );
  }

  const datos = await response.json().catch(() => null);
  return {
    diagnosticos: Array.isArray(datos?.diagnosticos) ? datos.diagnosticos : [],
    hasMore: Boolean(datos?.hasMore),
    nextCursor: datos?.nextCursor ?? null,
    total: Number(datos?.total) || 0,
  };
}

export async function eliminarDiagnostico(id: string): Promise<void> {
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error("Debes iniciar sesión como administrador.");
  }

  let token: string;
  try {
    token = await usuario.getIdToken();
  } catch {
    throw new Error("No se pudo verificar tu sesión. Vuelve a iniciar sesión.");
  }

  let response: Response;
  try {
    response = await fetch(`/api/admin-diagnosticos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error || "No se pudo eliminar el diagnóstico.");
  }
}
