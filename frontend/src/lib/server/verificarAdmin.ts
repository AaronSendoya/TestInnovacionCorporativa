import { authAdmin } from "@/lib/server/firebaseAdmin";
import { ErrorHttp } from "@/lib/server/httpError";

export async function verificarTokenAdmin(request: Request) {
  const encabezado = request.headers.get("authorization") || "";
  const [tipo, token] = encabezado.split(" ");
  if (tipo !== "Bearer" || !token) {
    throw new ErrorHttp("Token de autenticación faltante.", 401);
  }

  let decodificado;
  try {
    decodificado = await authAdmin.verifyIdToken(token);
  } catch (error) {
    console.error("Token JWT inválido:", error);
    throw new ErrorHttp("Token de autenticación inválido o expirado.", 401);
  }

  if (decodificado.admin !== true) {
    throw new ErrorHttp("No tienes permisos de administrador.", 403);
  }

  return decodificado;
}
