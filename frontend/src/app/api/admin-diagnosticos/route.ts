import {
  FieldPath,
  Timestamp,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { dbAdmin } from "@/lib/server/firebaseAdmin";
import { verificarTokenAdmin } from "@/lib/server/verificarAdmin";
import { ErrorHttp } from "@/lib/server/httpError";

const TAMANO_PAGINA_DEFAULT = 10;
const TAMANO_PAGINA_MAXIMO = 500;
// Limite interno por cada una de las 2 sub-consultas de busqueda (nombre de
// empresa y nombre de contacto). No es el limite de pagina: se trae esta
// cantidad para poder combinar+ordenar+paginar en memoria, ya que Firestore
// no permite una condicion "OR" entre dos campos distintos en una sola
// consulta. Una coincidencia de texto especifica siempre sera un subconjunto
// pequeno de la coleccion, asi que este limite es un techo de seguridad, no
// el tamano esperado real.
const LIMITE_BUSQUEDA_INTERNO = 300;
const SUFIJO_PREFIJO = String.fromCharCode(0xf8ff);

function resolverEntero(valor: string | null, porDefecto: number, maximo: number): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) {
    return porDefecto;
  }
  return Math.min(numero, maximo);
}

function mapearDoc(doc: QueryDocumentSnapshot) {
  const datos = doc.data();
  const tieneFecha = datos.creadoEn && typeof datos.creadoEn.toDate === "function";
  const creadoEn = tieneFecha ? datos.creadoEn.toDate().toISOString() : null;
  return { ...datos, id: doc.id, creadoEn };
}

function timestampInicioDia(ymd: string): Timestamp {
  return Timestamp.fromDate(new Date(`${ymd}T00:00:00.000`));
}

function timestampFinDia(ymd: string): Timestamp {
  return Timestamp.fromDate(new Date(`${ymd}T23:59:59.999`));
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
    const pagina = resolverEntero(url.searchParams.get("pagina"), 1, Number.MAX_SAFE_INTEGER);
    const tamanoPagina = resolverEntero(
      url.searchParams.get("tamanoPagina"),
      TAMANO_PAGINA_DEFAULT,
      TAMANO_PAGINA_MAXIMO
    );
    const busqueda = url.searchParams.get("busqueda")?.trim() ?? "";
    const sector = url.searchParams.get("sector")?.trim() ?? "";
    const fechaDesde = url.searchParams.get("fechaDesde")?.trim() ?? "";
    const fechaHasta = url.searchParams.get("fechaHasta")?.trim() ?? "";

    const coleccion = dbAdmin.collection("diagnosticos");

    if (busqueda) {
      let consultaNombre: Query = coleccion
        .orderBy("empresa.nombre")
        .where("empresa.nombre", ">=", busqueda)
        .where("empresa.nombre", "<=", busqueda + SUFIJO_PREFIJO);
      let consultaContacto: Query = coleccion
        .orderBy("perfil.nombre")
        .where("perfil.nombre", ">=", busqueda)
        .where("perfil.nombre", "<=", busqueda + SUFIJO_PREFIJO);

      if (sector) {
        consultaNombre = consultaNombre.where("empresa.sector", "==", sector);
        consultaContacto = consultaContacto.where("empresa.sector", "==", sector);
      }

      const [snapNombre, snapContacto] = await Promise.all([
        consultaNombre.limit(LIMITE_BUSQUEDA_INTERNO).get(),
        consultaContacto.limit(LIMITE_BUSQUEDA_INTERNO).get(),
      ]);

      const combinados = new Map<string, ReturnType<typeof mapearDoc>>();
      for (const doc of [...snapNombre.docs, ...snapContacto.docs]) {
        if (!combinados.has(doc.id)) {
          combinados.set(doc.id, mapearDoc(doc));
        }
      }

      let resultados = [...combinados.values()];

      if (fechaDesde || fechaHasta) {
        resultados = resultados.filter((registro) => {
          if (!registro.creadoEn) return false;
          const ymd = registro.creadoEn.slice(0, 10);
          if (fechaDesde && ymd < fechaDesde) return false;
          if (fechaHasta && ymd > fechaHasta) return false;
          return true;
        });
      }

      resultados.sort((a, b) => (b.creadoEn ?? "").localeCompare(a.creadoEn ?? ""));

      const total = resultados.length;
      const inicio = (pagina - 1) * tamanoPagina;
      const diagnosticos = resultados.slice(inicio, inicio + tamanoPagina);
      const hasMore = inicio + tamanoPagina < total;

      return Response.json({ diagnosticos, hasMore, total, pagina });
    }

    let consultaFiltrada: Query = coleccion;
    if (sector) {
      consultaFiltrada = consultaFiltrada.where("empresa.sector", "==", sector);
    }
    if (fechaDesde) {
      consultaFiltrada = consultaFiltrada.where("creadoEn", ">=", timestampInicioDia(fechaDesde));
    }
    if (fechaHasta) {
      consultaFiltrada = consultaFiltrada.where("creadoEn", "<=", timestampFinDia(fechaHasta));
    }

    const consultaOrdenada = consultaFiltrada
      .orderBy("creadoEn", "desc")
      .orderBy(FieldPath.documentId(), "desc");

    const [snapshot, totalSnapshot] = await Promise.all([
      consultaOrdenada.offset((pagina - 1) * tamanoPagina).limit(tamanoPagina).get(),
      consultaOrdenada.count().get(),
    ]);

    const diagnosticos = snapshot.docs.map(mapearDoc);
    const total = totalSnapshot.data().count;
    const hasMore = pagina * tamanoPagina < total;

    return Response.json({ diagnosticos, hasMore, total, pagina });
  } catch (error) {
    console.error("Error al obtener diagnósticos:", error);
    return Response.json(
      { error: "No se pudieron obtener los diagnósticos." },
      { status: 500 }
    );
  }
}
