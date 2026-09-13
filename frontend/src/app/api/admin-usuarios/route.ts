import type { UserRecord } from "firebase-admin/auth";
import { authAdmin } from "@/lib/server/firebaseAdmin";
import { verificarTokenAdmin } from "@/lib/server/verificarAdmin";
import { ErrorHttp } from "@/lib/server/httpError";
import {
  EMAIL_REGEX,
  esTextoValido,
  pareceTextoAleatorio,
} from "@/lib/server/diagnosticoEngine";

function mapearUsuario(usuario: UserRecord) {
  return {
    uid: usuario.uid,
    email: usuario.email ?? null,
    nombre: usuario.displayName ?? null,
    admin: usuario.customClaims?.admin === true,
    deshabilitado: usuario.disabled,
    creadoEn: usuario.metadata.creationTime,
    ultimoAcceso: usuario.metadata.lastSignInTime ?? null,
  };
}

export async function GET(request: Request) {
  try {
    await verificarTokenAdmin(request);
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 401;
    const mensaje = error instanceof Error ? error.message : "No autorizado.";
    console.error("Acceso rechazado en admin-usuarios:", mensaje);
    return Response.json({ error: mensaje }, { status: codigo });
  }

  try {
    const usuarios: UserRecord[] = [];
    let pageToken: string | undefined;
    do {
      const resultado = await authAdmin.listUsers(1000, pageToken);
      usuarios.push(...resultado.users);
      pageToken = resultado.pageToken;
    } while (pageToken);

    const usuariosOrdenados = usuarios
      .map(mapearUsuario)
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? "", "es"));

    return Response.json({ usuarios: usuariosOrdenados });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return Response.json(
      { error: "No se pudieron obtener los usuarios." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await verificarTokenAdmin(request);
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 401;
    const mensaje = error instanceof Error ? error.message : "No autorizado.";
    console.error("Acceso rechazado en admin-usuarios (POST):", mensaje);
    return Response.json({ error: mensaje }, { status: codigo });
  }

  try {
    const cuerpo = await request.json().catch(() => null);
    const email =
      typeof cuerpo?.email === "string" ? cuerpo.email.trim() : "";
    const password = typeof cuerpo?.password === "string" ? cuerpo.password : "";
    const nombre =
      typeof cuerpo?.nombre === "string" ? cuerpo.nombre.trim() : "";

    if (!EMAIL_REGEX.test(email)) {
      throw new ErrorHttp("El correo no tiene un formato válido.", 400);
    }
    if (password.length < 8) {
      throw new ErrorHttp(
        "La contraseña debe tener al menos 8 caracteres.",
        400
      );
    }
    if (nombre) {
      if (!esTextoValido(nombre, 2, 50)) {
        throw new ErrorHttp("El nombre debe tener entre 2 y 50 caracteres.", 400);
      }
      if (pareceTextoAleatorio(nombre)) {
        throw new ErrorHttp("El nombre no parece un nombre válido.", 400);
      }
    }

    let nuevoUsuario: UserRecord;
    try {
      nuevoUsuario = await authAdmin.createUser({
        email,
        password,
        displayName: nombre || undefined,
      });
    } catch (error) {
      const codigo = (error as { code?: string })?.code;
      if (codigo === "auth/email-already-exists") {
        throw new ErrorHttp("Ya existe una cuenta con ese correo.", 409);
      }
      if (
        codigo === "auth/invalid-password" ||
        codigo === "auth/password-does-not-meet-requirements"
      ) {
        throw new ErrorHttp(
          "La contraseña no cumple los requisitos mínimos de seguridad.",
          400
        );
      }
      throw error;
    }

    await authAdmin.setCustomUserClaims(nuevoUsuario.uid, { admin: true });
    const usuarioFinal = await authAdmin.getUser(nuevoUsuario.uid);

    return Response.json({ usuario: mapearUsuario(usuarioFinal) }, { status: 201 });
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 500;
    const mensaje =
      error instanceof Error ? error.message : "No se pudo crear el usuario.";
    if (codigo === 500) {
      console.error("Error al crear usuario administrador:", error);
    }
    return Response.json({ error: mensaje }, { status: codigo });
  }
}
