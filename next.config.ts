import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? undefined : [
    "http://localhost:3000",
    "http://26.219.51.63:3000",
    `http://${process.env.HOSTNAME}:3000`
  ]
};

export default nextConfig;
