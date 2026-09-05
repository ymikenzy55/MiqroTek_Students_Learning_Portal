import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Add your image CDN domains here when needed
    ],
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ["lucide-react", "@heroicons/react"],
  },

  // Enable compression
  compress: true,

  // Optimize fonts
  optimizeFonts: true,
};

export default nextConfig;
