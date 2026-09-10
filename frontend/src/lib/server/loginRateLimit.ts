// Excluye "/" ademas de espacios y "@": el email se usa como ID de
// documento en Firestore, donde "/" es separador de ruta.
const EMAIL_REGEX = /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/;

const LOGIN_INTENTOS_POR_CICLO = 5;
const LOGIN_DURACIONES_BLOQUEO_SEGUNDOS = [30, 60, 180, 300];

export function normalizarEmail(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }
  const limpio = valor.trim().toLowerCase();
  return limpio.length > 0 && EMAIL_REGEX.test(limpio) ? limpio : null;
}

export function calcularDuracionBloqueo(
  intentosFallidos: number
): number | null {
  if (
    intentosFallidos === 0 ||
    intentosFallidos % LOGIN_INTENTOS_POR_CICLO !== 0
  ) {
    return null;
  }
  const ciclo = intentosFallidos / LOGIN_INTENTOS_POR_CICLO - 1;
  const indice = Math.min(ciclo, LOGIN_DURACIONES_BLOQUEO_SEGUNDOS.length - 1);
  return LOGIN_DURACIONES_BLOQUEO_SEGUNDOS[indice];
}
