import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Разрешаем доступ с твоего IP в локальной сети
  allowedDevOrigins: ["192.168.8.180", "http://192.168.8.180:3000"],

  experimental: {
    typedRoutes: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http", 
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ],
      },
    ];
  },
};

export default nextConfig;