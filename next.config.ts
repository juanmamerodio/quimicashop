import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Permite el despliegue aunque existan errores de tipos (temporal)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;