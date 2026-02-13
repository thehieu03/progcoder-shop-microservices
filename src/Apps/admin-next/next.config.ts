import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Allow external access in development
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, PATCH, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
        ],
      },
    ];
  },
  
  // Rewrites (if needed for proxying)
  async rewrites() {
    return [];
  },
};

export default nextConfig;
