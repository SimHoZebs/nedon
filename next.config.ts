import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  bundlePagesRouterDependencies: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plaid-merchant-logos.plaid.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};
export default nextConfig;
