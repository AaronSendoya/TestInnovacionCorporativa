"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  registrarIntentoLogin,
  verificarBloqueoLogin,
} from "@/services/loginRateLimit";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido.")
    .email("Ingresa un email válido."),
  password: z.string().min(6, "Mínimo 6 caracteres."),
});

type LoginValues = z.infer<typeof loginSchema>;

function formatearTiempo(totalSegundos: number): string {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  if (minutos === 0) {
    return `${segundos}s`;
  }
  return `${minutos}m ${segundos.toString().padStart(2, "0")}s`;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(
    null
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (segundosRestantes === null || segundosRestantes <= 0) {
      return;
    }
    const temporizador = setTimeout(() => {
      setSegundosRestantes((actual) =>
        actual !== null && actual > 1 ? actual - 1 : null
      );
    }, 1000);
    return () => clearTimeout(temporizador);
  }, [segundosRestantes]);

  const bloqueado = segundosRestantes !== null && segundosRestantes > 0;

  async function alEnviar(datos: LoginValues) {
    setErrorGeneral(null);
    const email = datos.email.trim().toLowerCase();

    const estadoPrevio = await verificarBloqueoLogin(email);
    if (estadoPrevio.bloqueado) {
      setSegundosRestantes(estadoPrevio.segundosRestantes);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, datos.password);
      await registrarIntentoLogin(email, true);
      router.replace("/admin");
    } catch {
      const nuevoEstado = await registrarIntentoLogin(email, false);
      if (nuevoEstado.bloqueado) {
        setSegundosRestantes(nuevoEstado.segundosRestantes);
      } else {
        setErrorGeneral("Credenciales inválidas. Verifica tu correo y contraseña.");
      }
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-off-white via-off-white to-azul/10 px-4">
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 flex items-center gap-1.5 text-sm font-medium text-gris-oscuro transition-colors hover:text-rojo-brillante sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al inicio
      </Link>

      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-flotar rounded-full bg-rojo-brillante/15 blur-3xl" />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 animate-flotar rounded-full bg-azul/15 blur-3xl"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gris-verde/30 bg-white shadow-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-rojo-oscuro via-rojo-brillante to-naranja" />

        <div className="flex flex-col gap-6 p-8">
          <Link href="/" className="mx-auto">
            <Image
              src="/corporate-innovation-logo.png"
              alt="Corporate Innovation - Powered by Pista8"
              width={1534}
              height={639}
              priority
              className="h-12 w-auto"
            />
          </Link>

          <div className="text-center">
            <h1 className="font-heading text-2xl text-gris-oscuro">
              Acceso Administrador
            </h1>
            <p className="mt-1 text-sm text-gris-medio">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {bloqueado ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-naranja/40 bg-naranja/10 px-4 py-6 text-center">
              <ShieldAlert
                className="h-8 w-8 text-naranja"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-gris-oscuro">
                Demasiados intentos fallidos
              </p>
              <p className="font-heading text-3xl tabular-nums text-gris-oscuro">
                {formatearTiempo(segundosRestantes ?? 0)}
              </p>
              <p className="text-xs text-gris-medio">
                Por seguridad, espera antes de volver a intentarlo.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(alEnviar)}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1 text-sm text-gris-oscuro">
                Email
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-medio"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-gris-oscuro outline-none transition-colors focus:ring-2 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gris-medio focus:border-azul focus:ring-azul/30"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {errors.email.message}
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-1 text-sm text-gris-oscuro">
                Contraseña
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-medio"
                    aria-hidden="true"
                  />
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    className={`w-full rounded-lg border bg-white py-2 pl-9 pr-9 text-sm text-gris-oscuro outline-none transition-colors focus:ring-2 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gris-medio focus:border-azul focus:ring-azul/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((actual) => !actual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-medio transition-colors hover:text-gris-oscuro"
                    aria-label={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {errors.password.message}
                  </p>
                )}
              </label>

              {errorGeneral && (
                <div className="flex items-center gap-2 rounded-lg border border-rojo-oscuro bg-rojo-oscuro/10 px-3 py-2 text-sm text-rojo-oscuro">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {errorGeneral}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rojo-oscuro via-rojo-brillante to-rojo-brillante bg-[length:200%_auto] bg-left px-6 py-3 font-heading text-base text-off-white transition-all duration-300 hover:bg-right hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
