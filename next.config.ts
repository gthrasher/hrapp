import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@okta/okta-sdk-nodejs'],
};

export default nextConfig;
