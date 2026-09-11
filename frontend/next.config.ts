import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next.js empaquete firebase-admin (y sus dependencias internas
  // como jwks-rsa/jose) con el bundler: en funciones serverless de Vercel
  // eso rompe con "ERR_REQUIRE_ESM" por incompatibilidades CJS/ESM. Al
  // marcarlo como externo, Node lo resuelve directo desde node_modules.
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
