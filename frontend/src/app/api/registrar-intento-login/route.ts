import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { dbAdmin } from "@/lib/server/firebaseAdmin";
import { calcularDuracionBloqueo, normalizarEmail } from "@/lib/server/loginRateLimit";

export async function POST(request: Request) {
  try {
    const cuerpo = await request.json().catch(() => null);
    const email = normalizarEmail(cuerpo?.email);
    if (!email) {
      return Response.json({ error: "El campo 'email' es inválido." }, { status: 400 });
    }
    const exitoso = cuerpo?.exitoso === true;
    const referencia = dbAdmin.collection("login_intentos").doc(email);

    const resultado = await dbAdmin.runTransaction(async (transaccion) => {
      if (exitoso) {
        transaccion.set(referencia, {
          intentosFallidos: 0,
          bloqueadoHasta: null,
          actualizadoEn: FieldValue.serverTimestamp(),
        });
        return { bloqueado: false, segundosRestantes: 0 };
      }

      const documento = await transaccion.get(referencia);
      const datos = documento.exists ? documento.data() : {};
      const intentosFallidos = (datos?.intentosFallidos || 0) + 1;
      const duracionSegundos = calcularDuracionBloqueo(intentosFallidos);

      const actualizacion: Record<string, unknown> = {
        intentosFallidos,
        actualizadoEn: FieldValue.serverTimestamp(),
      };
      if (duracionSegundos) {
        actualizacion.bloqueadoHasta = Timestamp.fromMillis(
          Date.now() + duracionSegundos * 1000
        );
      }

      transaccion.set(referencia, actualizacion, { merge: true });

      return {
        bloqueado: Boolean(duracionSegundos),
        segundosRestantes: duracionSegundos || 0,
      };
    });

    return Response.json(resultado);
  } catch (error) {
    console.error("Error al registrar intento de login:", error);
    return Response.json(
      { error: "No se pudo registrar el intento de acceso." },
      { status: 500 }
    );
  }
}
