import { auth } from "@/lib/firebase";
import type { DiagnosticoResultado } from "@/services/diagnostico";

export interface DiagnosticoAdmin extends DiagnosticoResultado {
  creadoEn: string | null;
}

export interface PaginaDiagnosticos {
  diagnosticos: DiagnosticoAdmin[];
  hasMore: boolean;
  total: number;
  pagina: number;
}

interface ObtenerDiagnosticosParams {
  pagina?: number;
  tamanoPagina: number;
  busqueda?: string;
  sector?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export async function obtenerDiagnosticos({
  pagina = 1,
  tamanoPagina,
  busqueda,
  sector,
  fechaDesde,
  fechaHasta,
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

  const params = new URLSearchParams({
    pagina: String(pagina),
    tamanoPagina: String(tamanoPagina),
  });
  if (busqueda) params.set("busqueda", busqueda);
  if (sector) params.set("sector", sector);
  if (fechaDesde) params.set("fechaDesde", fechaDesde);
  if (fechaHasta) params.set("fechaHasta", fechaHasta);

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
    total: Number(datos?.total) || 0,
    pagina: Number(datos?.pagina) || 1,
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
