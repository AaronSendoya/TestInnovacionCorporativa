import { dbAdmin } from "@/lib/server/firebaseAdmin";
import { normalizarEmail } from "@/lib/server/loginRateLimit";

export async function POST(request: Request) {
  try {
    const cuerpo = await request.json().catch(() => null);
    const email = normalizarEmail(cuerpo?.email);
    if (!email) {
      return Response.json({ error: "El campo 'email' es inválido." }, { status: 400 });
    }

    const documento = await dbAdmin.collection("login_intentos").doc(email).get();
    const datos = documento.exists ? documento.data() : null;
    const bloqueadoHastaMs = datos?.bloqueadoHasta
      ? datos.bloqueadoHasta.toMillis()
      : 0;
    const ahora = Date.now();

    if (bloqueadoHastaMs > ahora) {
      return Response.json({
        bloqueado: true,
        segundosRestantes: Math.ceil((bloqueadoHastaMs - ahora) / 1000),
      });
    }

    return Response.json({ bloqueado: false, segundosRestantes: 0 });
  } catch (error) {
    console.error("Error al verificar bloqueo de login:", error);
    return Response.json(
      { error: "No se pudo verificar el estado de acceso." },
      { status: 500 }
    );
  }
}
