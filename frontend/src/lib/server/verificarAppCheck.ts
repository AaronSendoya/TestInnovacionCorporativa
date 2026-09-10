import { appCheckAdmin, usandoEmulador } from "@/lib/server/firebaseAdmin";
import { ErrorHttp } from "@/lib/server/httpError";

export async function verificarAppCheck(request: Request): Promise<void> {
  if (usandoEmulador) {
    return;
  }

  const token = request.headers.get("X-Firebase-AppCheck");
  if (!token) {
    throw new ErrorHttp("Falta el token de App Check.", 401);
  }

  try {
    await appCheckAdmin.verifyToken(token);
  } catch (error) {
    console.error("Token de App Check inválido:", error);
    throw new ErrorHttp("Verificación de App Check fallida.", 401);
  }
}
