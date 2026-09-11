import { dbAdmin } from "@/lib/server/firebaseAdmin";
import { verificarTokenAdmin } from "@/lib/server/verificarAdmin";
import { ErrorHttp } from "@/lib/server/httpError";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verificarTokenAdmin(request);
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 401;
    const mensaje = error instanceof Error ? error.message : "No autorizado.";
    console.error("Acceso rechazado al eliminar diagnóstico:", mensaje);
    return Response.json({ error: mensaje }, { status: codigo });
  }

  try {
    const { id } = await params;
    const referencia = dbAdmin.collection("diagnosticos").doc(id);
    const documento = await referencia.get();
    if (!documento.exists) {
      return Response.json(
        { error: "El diagnóstico ya no existe." },
        { status: 404 }
      );
    }

    await referencia.delete();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar diagnóstico:", error);
    return Response.json(
      { error: "No se pudo eliminar el diagnóstico." },
      { status: 500 }
    );
  }
}
