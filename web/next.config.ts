import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Сайт — только статика для nginx на сервере бота (docs/stack.md, 1.1).
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
