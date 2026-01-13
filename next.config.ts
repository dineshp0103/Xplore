import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: "/Xplore",
  assetPrefix: "/Xplore/",
};

export default nextConfig;
