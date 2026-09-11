import { FieldValue } from "firebase-admin/firestore";
import { dbAdmin } from "@/lib/server/firebaseAdmin";
import { verificarAppCheck } from "@/lib/server/verificarAppCheck";
import { ErrorHttp } from "@/lib/server/httpError";
import {
  DIMENSIONES_PREGUNTAS,
  PLAYBOOK_INTERVENCIONES,
  calcularVariablesDerivadas,
  esObjetoValido,
  nivelDeScore,
  resolverArquetipo,
  resolverNivelInnovacion,
  validarPayload,
} from "@/lib/server/diagnosticoEngine";

export async function POST(request: Request) {
  try {
    await verificarAppCheck(request);
  } catch (error) {
    const codigo = error instanceof ErrorHttp ? error.codigoHttp : 401;
    return Response.json({ error: (error as Error).message }, { status: codigo });
  }

  try {
    const cuerpo = await request.json().catch(() => null);
    if (!esObjetoValido(cuerpo)) {
      return Response.json(
        { error: "Cuerpo de la solicitud inválido o ausente." },
        { status: 400 }
      );
    }

    const { perfil, empresa, respuestas } = cuerpo as Record<string, unknown>;

    const errorValidacion = validarPayload(perfil, empresa, respuestas);
    if (errorValidacion) {
      return Response.json({ error: errorValidacion }, { status: 400 });
    }

    const respuestasTyped = respuestas as Record<string, number[]>;
    const variablesDerivadas = calcularVariablesDerivadas(respuestasTyped);
    const { scores, brecha, dimension_critica } = variablesDerivadas;

    const dimensionesArray = Object.values(scores);
    const sumaDimensiones = dimensionesArray.reduce((a, b) => a + b, 0);
    const scorePonderado = parseFloat(
      (sumaDimensiones / (dimensionesArray.length || 1)).toFixed(2)
    );
    const score0a100 = parseFloat(((scorePonderado / 4.0) * 100).toFixed(2));

    const dimensionCritica = dimension_critica[0];
    const arquetipoInfo = resolverArquetipo(variablesDerivadas);
    const nivelInnovacion = resolverNivelInnovacion(scores);
    const quickWins = PLAYBOOK_INTERVENCIONES[dimensionCritica] || [];

    const nivelesPorDimension: Record<string, string> = {};
    for (const [dimension, val] of Object.entries(scores)) {
      nivelesPorDimension[dimension] = nivelDeScore(val);
    }

    const resultadoFinal = {
      perfil,
      empresa,
      scoresPorDimension: scores,
      nivelesPorDimension,
      scorePonderado,
      scoreTotal100: score0a100,
      dimensionCritica,
      dimensionesCriticas: dimension_critica,
      nivelInnovacion,
      brecha,
      arquetipo: arquetipoInfo.arquetipo,
      diagnostico: arquetipoInfo.diagnostico,
      riesgo: arquetipoInfo.riesgo,
      intervencion: arquetipoInfo.intervencion,
      quickWins,
      playbookPorDimension: PLAYBOOK_INTERVENCIONES,
      creadoEn: FieldValue.serverTimestamp(),
    };

    const docRef = await dbAdmin.collection("diagnosticos").add(resultadoFinal);

    return Response.json({
      id: docRef.id,
      ...resultadoFinal,
      creadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al procesar diagnóstico:", error);
    return Response.json(
      { error: "Fallo interno al evaluar respuestas." },
      { status: 500 }
    );
  }
}
