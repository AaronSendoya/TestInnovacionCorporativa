import { getToken } from "firebase/app-check";
import { appCheck } from "@/lib/firebase";

export interface EstadoBloqueoLogin {
  bloqueado: boolean;
  segundosRestantes: number;
}

const SIN_BLOQUEO: EstadoBloqueoLogin = { bloqueado: false, segundosRestantes: 0 };

async function llamarEndpoint(
  url: string,
  payload: Record<string, unknown>
): Promise<EstadoBloqueoLogin> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (appCheck) {
    try {
      const { token } = await getToken(appCheck);
      headers["X-Firebase-AppCheck"] = token;
    } catch (error) {
      console.error("No se pudo obtener el token de App Check:", error);
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo verificar el estado de acceso.");
  }

  const datos = await response.json();
  return {
    bloqueado: Boolean(datos.bloqueado),
    segundosRestantes: Number(datos.segundosRestantes) || 0,
  };
}

export async function verificarBloqueoLogin(
  email: string
): Promise<EstadoBloqueoLogin> {
  try {
    return await llamarEndpoint("/api/verificar-bloqueo-login", { email });
  } catch {
    return SIN_BLOQUEO;
  }
}

export async function registrarIntentoLogin(
  email: string,
  exitoso: boolean
): Promise<EstadoBloqueoLogin> {
  try {
    return await llamarEndpoint("/api/registrar-intento-login", {
      email,
      exitoso,
    });
  } catch {
    return SIN_BLOQUEO;
  }
}
