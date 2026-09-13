"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Shuffle,
  ShieldCheck,
  ShieldOff,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  actualizarRolAdmin,
  crearUsuarioAdmin,
  obtenerUsuariosAdmin,
  type UsuarioAdmin,
} from "@/services/adminUsuarios";

interface AccionPendiente {
  usuario: UsuarioAdmin;
  nuevoValor: boolean;
}

// Evita caracteres facilmente confundibles (0/O, 1/l/I) al compartir la
// contrasena generada por telefono, chat o de viva voz.
function generarPasswordSegura(longitud = 14): string {
  const alfabeto =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*-_";
  const valores = new Uint32Array(longitud);
  crypto.getRandomValues(valores);
  let resultado = "";
  for (let i = 0; i < longitud; i++) {
    resultado += alfabeto[valores[i] % alfabeto.length];
  }
  return resultado;
}

function BotonCopiar({ valor }: { valor: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Portapapeles no disponible (ej. contexto no seguro); se ignora.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title="Copiar"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gris-medio transition-colors hover:bg-gris-verde/10 hover:text-gris-oscuro"
    >
      {copiado ? (
        <Check className="h-4 w-4 text-azul" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default function GestionAdministradores() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionPendiente, setAccionPendiente] = useState<AccionPendiente | null>(
    null
  );
  const [aplicando, setAplicando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const [creando, setCreando] = useState(false);
  const [emailNuevo, setEmailNuevo] = useState("");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);
  const [creado, setCreado] = useState<UsuarioAdmin | null>(null);

  const uidPropio = auth.currentUser?.uid;

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const lista = await obtenerUsuariosAdmin();
        if (cancelado) return;
        setUsuarios(lista);
      } catch (err) {
        if (cancelado) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar usuarios."
        );
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  async function confirmarAccion() {
    if (!accionPendiente) return;
    setAplicando(true);
    setErrorAccion(null);
    try {
      await actualizarRolAdmin(
        accionPendiente.usuario.uid,
        accionPendiente.nuevoValor
      );
      setUsuarios((actuales) =>
        actuales.map((usuario) =>
          usuario.uid === accionPendiente.usuario.uid
            ? { ...usuario, admin: accionPendiente.nuevoValor }
            : usuario
        )
      );
      setAccionPendiente(null);
    } catch (err) {
      setErrorAccion(
        err instanceof Error ? err.message : "No se pudo actualizar el usuario."
      );
    } finally {
      setAplicando(false);
    }
  }

  function abrirCreacion() {
    setEmailNuevo("");
    setNombreNuevo("");
    setPasswordNuevo(generarPasswordSegura());
    setMostrarPassword(false);
    setErrorNuevo(null);
    setCreado(null);
    setCreando(true);
  }

  function cerrarCreacion() {
    if (guardandoNuevo) return;
    setCreando(false);
    if (creado) {
      setUsuarios((actuales) => [creado, ...actuales]);
      setCreado(null);
    }
  }

  async function confirmarCreacion() {
    setGuardandoNuevo(true);
    setErrorNuevo(null);
    try {
      const nuevo = await crearUsuarioAdmin({
        email: emailNuevo.trim(),
        password: passwordNuevo,
        nombre: nombreNuevo.trim() || undefined,
      });
      setCreado(nuevo);
    } catch (err) {
      setErrorNuevo(
        err instanceof Error ? err.message : "No se pudo crear el usuario."
      );
    } finally {
      setGuardandoNuevo(false);
    }
  }

  return (
    <div className="animate-entrada flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gris-medio">
          {usuarios.length} cuentas registradas en Firebase Authentication ·
          otorga o revoca el acceso al panel administrativo.
        </p>
        <button
          type="button"
          onClick={abrirCreacion}
          className="flex shrink-0 items-center gap-2 rounded-full bg-rojo-brillante px-4 py-2.5 text-sm font-medium text-off-white transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Nuevo administrador
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-4 py-3 text-sm text-rojo-oscuro">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gris-verde/40 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gris-verde/30 bg-off-white">
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Cuenta
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Estado
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-gris-medio">
                Último acceso
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gris-medio">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Cargando usuarios...
                  </span>
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gris-medio">
                  No hay cuentas registradas.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => {
                const esPropio = usuario.uid === uidPropio;
                const ultimoAcceso = usuario.ultimoAcceso
                  ? new Date(usuario.ultimoAcceso).toLocaleDateString("es-ES")
                  : "Nunca";
                return (
                  <tr
                    key={usuario.uid}
                    className="border-b border-gris-verde/15 last:border-b-0"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-azul/10 text-azul">
                          <UserCog className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-medium text-gris-oscuro">
                            {usuario.nombre ?? usuario.email ?? "Sin nombre"}
                          </p>
                          {usuario.nombre && (
                            <p className="text-xs text-gris-medio">
                              {usuario.email}
                            </p>
                          )}
                        </div>
                        {esPropio && (
                          <span className="rounded-full bg-gris-verde/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gris-medio">
                            Tú
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          usuario.admin
                            ? "bg-azul/10 text-azul"
                            : "bg-gris-verde/15 text-gris-medio"
                        }`}
                      >
                        {usuario.admin ? (
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {usuario.admin ? "Administrador" : "Sin permisos"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gris-medio">
                      {ultimoAcceso}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={esPropio}
                        title={
                          esPropio
                            ? "No puedes modificar tu propio rol"
                            : undefined
                        }
                        onClick={() => {
                          setErrorAccion(null);
                          setAccionPendiente({
                            usuario,
                            nuevoValor: !usuario.admin,
                          });
                        }}
                        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                          esPropio
                            ? "cursor-not-allowed border-gris-verde/30 text-gris-verde"
                            : usuario.admin
                              ? "border-rojo-oscuro/40 text-rojo-oscuro hover:bg-rojo-oscuro/10"
                              : "border-azul/40 text-azul hover:bg-azul/10"
                        }`}
                      >
                        {usuario.admin ? "Quitar acceso" : "Dar acceso"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Ambos modales se renderizan via portal a document.body: el
          contenedor raiz de este componente tiene animate-entrada, cuya
          animacion deja un transform activo (fill-mode both) que crearia un
          containing block distinto del viewport para position:fixed y
          rompe el centrado/tamano del modal (mismo problema ya resuelto asi
          en DetalleDiagnosticoModal). */}
      {accionPendiente &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gris-oscuro/55 p-4"
            onClick={() => !aplicando && setAccionPendiente(null)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    accionPendiente.nuevoValor
                      ? "bg-azul/10 text-azul"
                      : "bg-rojo-oscuro/10 text-rojo-oscuro"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-heading text-lg text-gris-oscuro">
                    {accionPendiente.nuevoValor
                      ? "Dar acceso de administrador"
                      : "Quitar acceso de administrador"}
                  </h2>
                  <p className="mt-1 text-sm text-gris-medio">
                    {accionPendiente.nuevoValor ? (
                      <>
                        <span className="font-semibold text-gris-oscuro">
                          {accionPendiente.usuario.email}
                        </span>{" "}
                        podrá ver todos los diagnósticos y datos de contacto
                        de las empresas evaluadas, y podrá administrar otras
                        cuentas de administrador.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-gris-oscuro">
                          {accionPendiente.usuario.email}
                        </span>{" "}
                        perderá acceso al panel administrativo en su próximo
                        inicio de sesión.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {errorAccion && (
                <p className="rounded-lg bg-rojo-oscuro/10 px-3 py-2 text-xs text-rojo-oscuro">
                  {errorAccion}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAccionPendiente(null)}
                  disabled={aplicando}
                  className="rounded-full border border-gris-medio px-4 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAccion}
                  disabled={aplicando}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-off-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                    accionPendiente.nuevoValor ? "bg-azul" : "bg-rojo-oscuro"
                  }`}
                >
                  {aplicando ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : accionPendiente.nuevoValor ? (
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ShieldOff className="h-4 w-4" aria-hidden="true" />
                  )}
                  Confirmar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {creando &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gris-oscuro/55 p-4"
            onClick={cerrarCreacion}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6"
              onClick={(evento) => evento.stopPropagation()}
            >
              {creado ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azul/10 text-azul">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-heading text-lg text-gris-oscuro">
                        Cuenta creada con acceso de administrador
                      </h2>
                      <p className="mt-1 text-sm text-gris-medio">
                        Comparte estas credenciales de forma segura. La
                        contraseña no se volverá a mostrar en el panel.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 rounded-xl border border-gris-verde/30 bg-off-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gris-verde">
                          Correo
                        </p>
                        <p className="truncate text-sm text-gris-oscuro">
                          {creado.email}
                        </p>
                      </div>
                      <BotonCopiar valor={creado.email ?? ""} />
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-gris-verde/20 pt-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gris-verde">
                          Contraseña temporal
                        </p>
                        <p className="truncate font-mono text-sm text-gris-oscuro">
                          {passwordNuevo}
                        </p>
                      </div>
                      <BotonCopiar valor={passwordNuevo} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={cerrarCreacion}
                      className="rounded-full bg-azul px-5 py-2 text-sm font-medium text-off-white transition-opacity hover:opacity-90"
                    >
                      Entendido
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rojo-brillante/10 text-rojo-brillante">
                        <UserPlus className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="font-heading text-lg text-gris-oscuro">
                          Nuevo administrador
                        </h2>
                        <p className="mt-1 text-sm text-gris-medio">
                          Crea una cuenta de Firebase Authentication con
                          acceso de administrador inmediato.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={cerrarCreacion}
                      disabled={guardandoNuevo}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gris-medio transition-colors hover:bg-gris-verde/10"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-gris-oscuro">
                        Correo
                      </span>
                      <input
                        type="email"
                        value={emailNuevo}
                        onChange={(evento) => setEmailNuevo(evento.target.value)}
                        placeholder="nombre@empresa.com"
                        className="rounded-lg border border-gris-verde/40 px-3 py-2 text-sm text-gris-oscuro outline-none transition-colors focus:border-azul focus:ring-2 focus:ring-azul/20"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-gris-oscuro">
                        Nombre{" "}
                        <span className="font-normal text-gris-medio">
                          (opcional)
                        </span>
                      </span>
                      <input
                        type="text"
                        value={nombreNuevo}
                        onChange={(evento) => setNombreNuevo(evento.target.value)}
                        placeholder="Nombre y apellido"
                        className="rounded-lg border border-gris-verde/40 px-3 py-2 text-sm text-gris-oscuro outline-none transition-colors focus:border-azul focus:ring-2 focus:ring-azul/20"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-gris-oscuro">
                        Contraseña temporal
                      </span>
                      <div className="flex items-center gap-1.5 rounded-lg border border-gris-verde/40 pr-1.5 focus-within:border-azul focus-within:ring-2 focus-within:ring-azul/20">
                        <input
                          type={mostrarPassword ? "text" : "password"}
                          value={passwordNuevo}
                          onChange={(evento) =>
                            setPasswordNuevo(evento.target.value)
                          }
                          className="min-w-0 flex-1 rounded-lg px-3 py-2 font-mono text-sm text-gris-oscuro outline-none"
                        />
                        <button
                          type="button"
                          title={mostrarPassword ? "Ocultar" : "Mostrar"}
                          onClick={() => setMostrarPassword((v) => !v)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gris-medio transition-colors hover:bg-gris-verde/10"
                        >
                          {mostrarPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          title="Generar otra contraseña"
                          onClick={() => setPasswordNuevo(generarPasswordSegura())}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gris-medio transition-colors hover:bg-gris-verde/10"
                        >
                          <Shuffle className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-xs text-gris-medio">
                        Mínimo 8 caracteres. Se genera una segura por defecto.
                      </span>
                    </label>
                  </div>

                  <p className="flex items-start gap-1.5 rounded-lg bg-naranja/10 px-3 py-2 text-xs text-gris-oscuro">
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-naranja"
                      aria-hidden="true"
                    />
                    Esta cuenta tendrá acceso completo de administrador desde
                    el momento en que se crea.
                  </p>

                  {errorNuevo && (
                    <p className="rounded-lg bg-rojo-oscuro/10 px-3 py-2 text-xs text-rojo-oscuro">
                      {errorNuevo}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cerrarCreacion}
                      disabled={guardandoNuevo}
                      className="rounded-full border border-gris-medio px-4 py-2 text-sm font-medium text-gris-oscuro transition-colors hover:bg-gris-verde/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmarCreacion}
                      disabled={
                        guardandoNuevo ||
                        !emailNuevo.trim() ||
                        passwordNuevo.length < 8
                      }
                      className="flex items-center gap-2 rounded-full bg-rojo-brillante px-4 py-2 text-sm font-medium text-off-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {guardandoNuevo ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                      )}
                      Crear cuenta
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
