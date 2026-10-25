import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  // partialPrefetching: true,
  transpilePackages: ["@speako/ui"],
};

export default nextConfig;