// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  // --- ADD THIS 'images' CONFIGURATION BLOCK ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // This allows any image path from this domain
      },
    ],
  },
  // -----------------------------------------
};

export default nextConfig;