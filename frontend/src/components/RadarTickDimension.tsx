function partirEtiqueta(texto: string): string[] {
  if (texto.length <= 12) {
    return [texto];
  }
  const posicionesEspacio: number[] = [];
  for (let i = 0; i < texto.length; i += 1) {
    if (texto[i] === " ") {
      posicionesEspacio.push(i);
    }
  }
  if (posicionesEspacio.length === 0) {
    return [texto];
  }
  const medio = texto.length / 2;
  const corte = posicionesEspacio.reduce((mejor, actual) =>
    Math.abs(actual - medio) < Math.abs(mejor - medio) ? actual : mejor
  );
  return [texto.slice(0, corte), texto.slice(corte + 1)];
}

interface RadarTickDimensionProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  textAnchor?: "middle" | "start" | "end" | "inherit";
}

export default function RadarTickDimension({
  x = 0,
  y = 0,
  payload,
  textAnchor = "middle",
}: RadarTickDimensionProps) {
  const lineas = partirEtiqueta(payload?.value ?? "");
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="#425051" fontSize={11}>
      {lineas.map((linea, indice) => (
        <tspan
          key={linea}
          x={x}
          dy={indice === 0 ? (lineas.length > 1 ? -5 : 4) : 14}
        >
          {linea}
        </tspan>
      ))}
    </text>
  );
}
