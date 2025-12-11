import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    "*.replit.dev",
    "*.repl.co",
    "*.pike.replit.dev",
  ],
};

export default nextConfig;
