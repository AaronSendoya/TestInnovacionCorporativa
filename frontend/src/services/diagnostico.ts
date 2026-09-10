import { getToken } from "firebase/app-check";
import { appCheck } from "@/lib/firebase";

export interface PerfilDiagnostico {
  nombre: string;
  email: string;
  pais?: string;
  codigoPais?: string;
  telefono?: string;
  cargo: string;
  cargo_otro?: string;
  relacion_decisiones: string;
}

export interface EmpresaDiagnostico {
  nombre: string;
  sector: string;
  tamano: string;
  focos: string[];
}

export interface ContextoDiagnostico {
  obstaculo: string;
  prioridad: string;
  impacto: string;
  horizonte: string;
}

export interface RespuestasDiagnostico {
  cultura: number[];
  equipos: number[];
  proyectos: number[];
  toma_decisiones: number[];
  colaboracion_externa: number[];
  estrategia_portafolio: number[];
}

export interface DiagnosticoPayload {
  perfil: PerfilDiagnostico;
  empresa: EmpresaDiagnostico;
  contexto: ContextoDiagnostico;
  respuestas: RespuestasDiagnostico;
}

export interface DiagnosticoResultado {
  id: string;
  perfil: PerfilDiagnostico;
  empresa: EmpresaDiagnostico;
  contexto: ContextoDiagnostico;
  scoresPorDimension: Record<string, number>;
  nivelesPorDimension: Record<string, string>;
  scorePonderado: number;
  scoreTotal100: number;
  dimensionCritica: string;
  brecha: number;
  arquetipo: string;
  diagnostico: string;
  riesgo: string;
  intervencion: string;
  quickWins: string[];
  playbookPorDimension: Record<string, string[]>;
}

export async function enviarDiagnostico(
  payload: DiagnosticoPayload
): Promise<DiagnosticoResultado> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (appCheck) {
    try {
      const { token } = await getToken(appCheck);
      headers["X-Firebase-AppCheck"] = token;
    } catch (error) {
      console.error("No se pudo obtener el token de App Check:", error);
    }
  }

  const response = await fetch("/api/calcular-diagnostico", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const cuerpoError = await response.json().catch(() => null);
    const mensaje =
      cuerpoError?.error || "Error desconocido al procesar el diagnóstico.";

    if (response.status === 400) {
      throw new Error(`Datos inválidos: ${mensaje}`);
    }
    if (response.status === 500) {
      throw new Error(`Error del servidor: ${mensaje}`);
    }
    throw new Error(`Error inesperado (HTTP ${response.status}): ${mensaje}`);
  }

  return response.json();
}
