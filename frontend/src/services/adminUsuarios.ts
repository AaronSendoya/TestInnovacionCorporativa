import { auth } from "@/lib/firebase";

export interface UsuarioAdmin {
  uid: string;
  email: string | null;
  nombre: string | null;
  admin: boolean;
  deshabilitado: boolean;
  creadoEn: string;
  ultimoAcceso: string | null;
}

async function obtenerTokenSesion(): Promise<string> {
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error("Debes iniciar sesión como administrador.");
  }
  try {
    return await usuario.getIdToken();
  } catch {
    throw new Error("No se pudo verificar tu sesión. Vuelve a iniciar sesión.");
  }
}

export async function obtenerUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const token = await obtenerTokenSesion();

  let response: Response;
  try {
    response = await fetch("/api/admin-usuarios", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error || "No se pudieron cargar los usuarios.");
  }

  const datos = await response.json().catch(() => null);
  return Array.isArray(datos?.usuarios) ? datos.usuarios : [];
}

interface CrearUsuarioAdminParams {
  email: string;
  password: string;
  nombre?: string;
}

export async function crearUsuarioAdmin({
  email,
  password,
  nombre,
}: CrearUsuarioAdminParams): Promise<UsuarioAdmin> {
  const token = await obtenerTokenSesion();

  let response: Response;
  try {
    response = await fetch("/api/admin-usuarios", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, nombre }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const cuerpo = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(cuerpo?.error || "No se pudo crear el usuario.");
  }
  return cuerpo.usuario;
}

export async function actualizarRolAdmin(
  uid: string,
  admin: boolean
): Promise<void> {
  const token = await obtenerTokenSesion();

  let response: Response;
  try {
    response = await fetch(`/api/admin-usuarios/${uid}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ admin }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error || "No se pudo actualizar el usuario.");
  }
}
