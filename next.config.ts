import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uavonoavvcyzlcdbrifu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  basePath: isProd ? "/Xplore" : undefined,
  assetPrefix: isProd ? "/Xplore/" : undefined,
};

export default nextConfig;
