import { FieldValue } from "firebase-admin/firestore";
import { dbAdmin } from "@/lib/server/firebaseAdmin";
import { verificarAppCheck } from "@/lib/server/verificarAppCheck";
import { ErrorHttp } from "@/lib/server/httpError";
import {
  DIMENSIONES_PREGUNTAS,
  PLAYBOOK_INTERVENCIONES,
  esObjetoValido,
  nivelDeScore,
  resolverArquetipo,
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

    const { perfil, empresa, contexto, respuestas } = cuerpo as Record<
      string,
      unknown
    >;

    const errorValidacion = validarPayload(perfil, empresa, contexto, respuestas);
    if (errorValidacion) {
      return Response.json({ error: errorValidacion }, { status: 400 });
    }

    const respuestasTyped = respuestas as Record<string, number[]>;
    const scores: Record<string, number> = {};
    for (const dimension of Object.keys(DIMENSIONES_PREGUNTAS)) {
      const valores = respuestasTyped[dimension];
      const suma = valores.reduce((acc, curr) => acc + curr, 0);
      scores[dimension] = parseFloat((suma / valores.length).toFixed(2));
    }

    const dimensionesArray = Object.values(scores);
    const sumaDimensiones = dimensionesArray.reduce((a, b) => a + b, 0);
    const scorePonderado = parseFloat(
      (sumaDimensiones / dimensionesArray.length).toFixed(2)
    );
    const score0a100 = parseFloat(((scorePonderado / 4.0) * 100).toFixed(2));

    let dimensionCritica = Object.keys(scores)[0];
    let scoreMin = scores[dimensionCritica];
    let scoreMax = scores[dimensionCritica];

    for (const [dimension, val] of Object.entries(scores)) {
      if (val < scoreMin) {
        scoreMin = val;
        dimensionCritica = dimension;
      }
      if (val > scoreMax) {
        scoreMax = val;
      }
    }

    const brecha = parseFloat((scoreMax - scoreMin).toFixed(2));
    const arquetipoInfo = resolverArquetipo(dimensionCritica, scores);
    const quickWins = PLAYBOOK_INTERVENCIONES[dimensionCritica] || [];

    const nivelesPorDimension: Record<string, string> = {};
    for (const [dimension, val] of Object.entries(scores)) {
      nivelesPorDimension[dimension] = nivelDeScore(val);
    }

    const resultadoFinal = {
      perfil,
      empresa,
      contexto,
      scoresPorDimension: scores,
      nivelesPorDimension,
      scorePonderado,
      scoreTotal100: score0a100,
      dimensionCritica,
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
