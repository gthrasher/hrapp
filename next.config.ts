import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@okta/okta-sdk-nodejs'],
};

export default nextConfig;
