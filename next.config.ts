import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    /* empty */
  },
  allowedDevOrigins: ["192.168.1.130"] as string[] // Casting to string[] in case typing is old
} as any;

export default nextConfig;
