import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "gris-oscuro": "#425051",
        "rojo-brillante": "#FE2800",
        "gris-medio": "#676E69",
        "naranja": "#FF8C12",
        "rojo-oscuro": "#BE1E2D",
        "azul": "#00344C",
        "gris-verde": "#A4A49B",
        "off-white": "#F2F3EE",
      },
    },
  },
};

export default config;
