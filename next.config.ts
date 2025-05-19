import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? undefined : [
    "http://localhost:3000",
    "http://26.219.51.63:3000",
    "http://192.168.15.2:3000"
  ]
};

export default nextConfig;
