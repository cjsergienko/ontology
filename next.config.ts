import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "ontology.live",
    "www.ontology.live",
  ],
  output: 'standalone',
  devIndicators: false,
};

export default nextConfig;
