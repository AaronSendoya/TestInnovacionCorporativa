import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { dbAdmin } from "@/lib/server/firebaseAdmin";
import { verificarTokenAdmin } from "@/lib/server/verificarAdmin";
import { ErrorHttp } from "@/lib/server/httpError";

const LIMITE_DEFAULT = 10;
const LIMITE_MAXIMO = 500;
const SUFIJO_PREFIJO = String.fromCharCode(0xf8ff);

function resolverLimite(valor: string | null): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) {
    return LIMITE_DEFAULT;
  }
  return Math.min(numero, LIMITE_MAXIMO);
}

export async function GET(request: Request) {
  try {
    await verificarTokenAdmin(request);
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 401;
    const mensaje = error instanceof Error ? error.message : "No autorizado.";
    console.error("Acceso rechazado en admin-diagnosticos:", mensaje);
    return Response.json({ error: mensaje }, { status: codigo });
  }

  try {
    const url = new URL(request.url);
    const limite = resolverLimite(url.searchParams.get("limite"));
    const busqueda = url.searchParams.get("busqueda")?.trim() ?? "";
    const cursorCreadoEn = url.searchParams.get("cursorCreadoEn");
    const cursorId = url.searchParams.get("cursorId");

    const coleccion = dbAdmin.collection("diagnosticos");

    const consultaBase = busqueda
      ? coleccion
          .orderBy("empresa.nombre")
          .where("empresa.nombre", ">=", busqueda)
          .where("empresa.nombre", "<=", busqueda + SUFIJO_PREFIJO)
      : coleccion
          .orderBy("creadoEn", "desc")
          .orderBy(FieldPath.documentId(), "desc");

    let consultaPagina = consultaBase;
    if (busqueda && cursorId) {
      const cursorDoc = await coleccion.doc(cursorId).get();
      if (cursorDoc.exists) {
        consultaPagina = consultaBase.startAfter(
          cursorDoc.get("empresa.nombre")
        );
      }
    } else if (!busqueda && cursorCreadoEn && cursorId) {
      consultaPagina = consultaBase.startAfter(
        Timestamp.fromDate(new Date(cursorCreadoEn)),
        cursorId
      );
    }

    const [snapshot, totalSnapshot] = await Promise.all([
      consultaPagina.limit(limite + 1).get(),
      consultaBase.count().get(),
    ]);

    const hasMore = snapshot.docs.length > limite;
    const docs = snapshot.docs.slice(0, limite);

    const diagnosticos = docs.map((doc) => {
      const datos = doc.data();
      const tieneFecha =
        datos.creadoEn && typeof datos.creadoEn.toDate === "function";
      const creadoEn = tieneFecha ? datos.creadoEn.toDate().toISOString() : null;
      return { ...datos, id: doc.id, creadoEn };
    });

    const ultimoDoc = docs[docs.length - 1];
    const nextCursor = ultimoDoc
      ? {
          creadoEn: diagnosticos[diagnosticos.length - 1].creadoEn,
          id: ultimoDoc.id,
        }
      : null;

    return Response.json({
      diagnosticos,
      hasMore,
      nextCursor,
      total: totalSnapshot.data().count,
    });
  } catch (error) {
    console.error("Error al obtener diagnósticos:", error);
    return Response.json(
      { error: "No se pudieron obtener los diagnósticos." },
      { status: 500 }
    );
  }
}
