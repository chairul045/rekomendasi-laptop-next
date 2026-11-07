import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'xlsx', 'framer-motion'],
  },
};

export default nextConfig;
