import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- 1. Enable Standalone Output (CRITICAL FOR DOCKER) ---
  // This creates the folder /app/.next/standalone that Docker is looking for
  output: "standalone",

  // --- 2. Ignore Build Errors ---
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // --- 3. Image Configuration ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;