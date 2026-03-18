import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "ontology.live",
    "www.ontology.live",
    "hiringaihelp.com",
    "www.hiringaihelp.com",
  ],
  output: 'standalone',
};

export default nextConfig;
