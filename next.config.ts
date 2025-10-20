import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: [
      "s3-alpha-sig.figma.com",
      "avatar.iran.liara.run",
      "demos.creative-tim.com",
      "example.com",
      "cnm-chatapp-bucket.s3.ap-southeast-1.amazonaws.com",
    ],
  },
};

export default nextConfig;
