import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // 🛡️ Hide 'X-Powered-By: Next.js / Vercel'
  productionBrowserSourceMaps: false, // 🛡️ Hide source maps from DevTools inspection
  typescript: {
    ignoreBuildErrors: false,
  },
  compiler: {
    // 🛡️ Remove all console.log/warn/error from production client bundle
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
