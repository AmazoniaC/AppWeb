import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El logo puede pesar hasta 2 MB; se deja margen para el formulario.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
