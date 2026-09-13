import { authAdmin } from "@/lib/server/firebaseAdmin";
import { verificarTokenAdmin } from "@/lib/server/verificarAdmin";
import { ErrorHttp } from "@/lib/server/httpError";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  let decodificado;
  try {
    decodificado = await verificarTokenAdmin(request);
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 401;
    const mensaje = error instanceof Error ? error.message : "No autorizado.";
    console.error("Acceso rechazado en admin-usuarios/[uid]:", mensaje);
    return Response.json({ error: mensaje }, { status: codigo });
  }

  try {
    const { uid } = await params;

    if (uid === decodificado.uid) {
      throw new ErrorHttp(
        "No puedes modificar tus propios permisos de administrador.",
        400
      );
    }

    const cuerpo = await request.json().catch(() => null);
    if (typeof cuerpo?.admin !== "boolean") {
      throw new ErrorHttp("El campo 'admin' debe ser un booleano.", 400);
    }

    let usuario;
    try {
      usuario = await authAdmin.getUser(uid);
    } catch {
      throw new ErrorHttp("El usuario no existe.", 404);
    }

    await authAdmin.setCustomUserClaims(uid, {
      ...usuario.customClaims,
      admin: cuerpo.admin,
    });

    return Response.json({ ok: true, uid, admin: cuerpo.admin });
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 500;
    const mensaje =
      error instanceof Error ? error.message : "No se pudo actualizar el usuario.";
    if (codigo === 500) {
      console.error("Error al actualizar rol de usuario:", error);
    }
    return Response.json({ error: mensaje }, { status: codigo });
  }
}
