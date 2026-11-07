import type { NextConfig } from "next";

const apiBackend = process.env.API_BACKEND_URL ?? "http://localhost:8090";

const nextConfig: NextConfig = {
  // Страницы — статика для nginx на сервере бота (docs/stack.md, 1.1).
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // В проде /api/* проксирует nginx; при статическом экспорте rewrites не работают, поэтому только в dev.
  // Без skipTrailingSlashRedirect dev сначала дописал бы «/» к /api/… и сломал POST редиректом.
  ...(process.env.NODE_ENV === "development"
    ? {
        skipTrailingSlashRedirect: true,
        rewrites: async () => [{ source: "/api/:path*", destination: `${apiBackend}/api/:path*` }],
      }
    : {}),
};

export default nextConfig;
