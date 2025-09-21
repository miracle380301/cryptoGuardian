import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration options can be added here as needed
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
