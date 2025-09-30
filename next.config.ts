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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
