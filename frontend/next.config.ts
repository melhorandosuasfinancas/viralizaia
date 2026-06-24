import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/como-crescer-no-tiktok-em-2025",
        destination: "/blog/como-crescer-no-tiktok-em-2026",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
