interface GaugeMadurezProps {
  valor: number;
  tamano?: number;
}

export default function GaugeMadurez({ valor, tamano = 128 }: GaugeMadurezProps) {
  const alto = tamano * 0.62;
  return (
    <svg
      viewBox="0 0 200 120"
      width={tamano}
      height={alto}
      role="img"
      aria-label={`Madurez promedio ${valor} de 100`}
    >
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="#E7E7E1"
        strokeWidth={18}
        strokeLinecap="round"
      />
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="#FE2800"
        strokeWidth={18}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${valor} 100`}
      />
    </svg>
  );
}
